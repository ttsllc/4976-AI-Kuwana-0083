'use client'

import { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// 顔のランドマークから3D形状を制御するためのインターフェース
interface FacialExpressions {
  eyeBlinkLeft: number
  eyeBlinkRight: number
  mouthOpen: number
  mouthSmile: number
  eyebrowUp: number
  cheekPuff: number
}

interface Avatar3DSettings {
  faceColor: string
  eyeColor: string
  mouthColor: string
  scale: number
  headShape: 'sphere' | 'oval' | 'square'
  emotionSensitivity: number
  textureScale?: number
  textureOffsetX?: number
  textureOffsetY?: number
  textureRotation?: number
  textureFlipVertical?: boolean
  textureFlipHorizontal?: boolean
  sphereOpacity?: number
  textureOpacity?: number
}

interface Avatar3DProps {
  imageUrl?: string
  isPlaying?: boolean
  isSpeaking?: boolean
  emotion?: 'neutral' | 'happy' | 'surprised' | 'thinking' | 'sad' | 'angry'
  size?: number
  expressions?: FacialExpressions
  settings?: Avatar3DSettings
}

// 基本的な3D顔モデルコンポーネント
function FaceModel({ 
  imageUrl, 
  isSpeaking, 
  emotion, 
  expressions,
  settings = {
    faceColor: '#ffdba4',
    eyeColor: '#1a1a1a',
    mouthColor: '#444444',
    scale: 1.0,
    headShape: 'sphere',
    emotionSensitivity: 1.0,
    textureScale: 0.9,
    textureOffsetX: 0,
    textureOffsetY: 0,
    textureRotation: 0,
    textureFlipVertical: false,
    textureFlipHorizontal: false,
    sphereOpacity: 1.0,
    textureOpacity: 0.9
  }
}: {
  imageUrl?: string
  isSpeaking: boolean
  emotion: string
  expressions: FacialExpressions
  settings?: Avatar3DSettings
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const eyeLeftRef = useRef<THREE.Mesh>(null)
  const eyeRightRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Mesh>(null)
  
  // カスタムテクスチャローディング
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(imageUrl || '/default-face.svg')
    
    // 強制的に正しい向きに設定
    tex.flipY = true
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.generateMipmaps = false
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    
    return tex
  }, [imageUrl])
  
  // テクスチャの配置と変形を調整
  useEffect(() => {
    if (texture) {
      // 顔写真のサイズと位置調整
      const scale = settings.textureScale || 0.9
      let offsetX = (settings.textureOffsetX || 0)
      let offsetY = (settings.textureOffsetY || 0)
      
      // 反転設定を適用
      const flipVertical = settings.textureFlipVertical || false
      const flipHorizontal = settings.textureFlipHorizontal || false
      
      // 反転による調整
      let repeatX = scale
      let repeatY = scale
      
      if (flipHorizontal) {
        repeatX = -scale
        offsetX = -offsetX
      }
      
      if (flipVertical) {
        repeatY = -scale
        offsetY = -offsetY
      }
      
      // テクスチャの変形を適用
      texture.repeat.set(repeatX, repeatY)
      texture.offset.set(offsetX, offsetY)
      texture.rotation = (settings.textureRotation || 0) * Math.PI / 180
      texture.center.set(0.5, 0.5)
      
      texture.needsUpdate = true
    }
  }, [texture, settings.textureScale, settings.textureOffsetX, settings.textureOffsetY, settings.textureRotation, settings.textureFlipVertical, settings.textureFlipHorizontal])

  // アニメーションフレーム
  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.getElapsedTime()

    // 呼吸のような微細な動き
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.02

    // 話している時の頭の動き
    if (isSpeaking) {
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.05
      meshRef.current.rotation.x = Math.sin(time * 2) * 0.02
    }

    // 表情に応じた変形（感度調整付き）
    const sensitivity = settings.emotionSensitivity
    if (eyeLeftRef.current && eyeRightRef.current) {
      eyeLeftRef.current.scale.y = 1 - expressions.eyeBlinkLeft * 0.8 * sensitivity
      eyeRightRef.current.scale.y = 1 - expressions.eyeBlinkRight * 0.8 * sensitivity
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = 1 + expressions.mouthOpen * 0.5 * sensitivity
      mouthRef.current.scale.x = 1 + expressions.mouthSmile * 0.3 * sensitivity
    }
  })

  // 顔用の球体ジオメトリを作成（UVマッピング改善）
  const headGeometry = useMemo(() => {
    let geometry
    
    switch (settings.headShape) {
      case 'oval':
        geometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI)
        break
      case 'square':
        geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8)
        break
      default:
        geometry = new THREE.SphereGeometry(1, 32, 32)
        break
    }

    // UVマッピングを調整（顔写真が正面中央に来るように）
    if (settings.headShape === 'sphere' && imageUrl) {
      const uvs = geometry.attributes.uv.array
      const positions = geometry.attributes.position.array
      
      // 各頂点のUV座標を調整
      for (let i = 0; i < uvs.length; i += 2) {
        const vertexIndex = i / 2
        const x = positions[vertexIndex * 3]
        const y = positions[vertexIndex * 3 + 1]
        const z = positions[vertexIndex * 3 + 2]
        
        // 球体の正面（Z > 0）により重点を置く
        if (z > 0) {
          // 正面の顔により多くのテクスチャ空間を割り当て
          const frontFactor = Math.max(0.1, z)
          uvs[i] = (uvs[i] - 0.5) * (0.6 + 0.4 * frontFactor) + 0.5
          uvs[i + 1] = (uvs[i + 1] - 0.5) * (0.6 + 0.4 * frontFactor) + 0.5
        }
      }
      geometry.attributes.uv.needsUpdate = true
    }
    
    return geometry
  }, [settings.headShape, imageUrl])

  return (
    <group ref={meshRef} scale={[settings.scale, settings.scale, settings.scale]}>
      {/* 顔のベース */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} geometry={headGeometry}>
        <meshStandardMaterial 
          map={imageUrl ? texture : undefined}
          color={!imageUrl ? settings.faceColor : '#ffffff'}
          transparent
          opacity={imageUrl ? (settings.textureOpacity || 0.9) : (settings.sphereOpacity || 1.0)}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 左目 */}
      <mesh ref={eyeLeftRef} position={[-0.25, 0.15, 0.95]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={settings.eyeColor} />
      </mesh>

      {/* 右目 */}
      <mesh ref={eyeRightRef} position={[0.25, 0.15, 0.95]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={settings.eyeColor} />
      </mesh>

      {/* 口 */}
      <mesh ref={mouthRef} position={[0, -0.25, 0.9]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={isSpeaking ? "#ff6b6b" : settings.mouthColor}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 話している時のオーラエフェクト */}
      {isSpeaking && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial 
            color="#4ecdc4"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
}

// ライティング設定
function Lighting({ emotion }: { emotion: string }) {
  const ambientColor = {
    neutral: '#ffffff',
    happy: '#fff9c4',
    surprised: '#e3f2fd',
    thinking: '#f3e5f5',
    sad: '#e8f5e8',
    angry: '#ffebee'
  }[emotion] || '#ffffff'

  return (
    <>
      <ambientLight intensity={0.6} color={ambientColor} />
      <directionalLight 
        position={[2, 2, 5]} 
        intensity={1} 
        color="#ffffff"
        castShadow
      />
      <pointLight 
        position={[-2, 2, 5]} 
        intensity={0.5} 
        color="#4ecdc4" 
      />
    </>
  )
}

export default function Avatar3D({ 
  imageUrl, 
  isPlaying = false, 
  isSpeaking = false, 
  emotion = 'neutral',
  size = 400,
  expressions = {
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    mouthOpen: 0,
    mouthSmile: 0,
    eyebrowUp: 0,
    cheekPuff: 0
  },
  settings = {
    faceColor: '#ffdba4',
    eyeColor: '#1a1a1a',
    mouthColor: '#444444',
    scale: 1.0,
    headShape: 'sphere',
    emotionSensitivity: 1.0,
    textureScale: 0.9,
    textureOffsetX: 0,
    textureOffsetY: 0,
    textureRotation: 0,
    textureFlipVertical: false,
    textureFlipHorizontal: false,
    sphereOpacity: 1.0,
    textureOpacity: 0.9
  }
}: Avatar3DProps) {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`relative rounded-lg overflow-hidden ${
        isSpeaking ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <Lighting emotion={emotion} />
          <FaceModel
            imageUrl={imageUrl}
            isSpeaking={isSpeaking}
            emotion={emotion}
            expressions={expressions}
            settings={settings}
          />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={2 * Math.PI / 3}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        </Suspense>
      </Canvas>
      
      {/* 感情インジケーター */}
      <div className="absolute top-2 right-2 text-2xl bg-white rounded-full p-1 shadow-lg">
        {emotion === 'happy' && '😊'}
        {emotion === 'surprised' && '😮'}
        {emotion === 'thinking' && '🤔'}
        {emotion === 'sad' && '😢'}
        {emotion === 'angry' && '😠'}
        {emotion === 'neutral' && '😐'}
      </div>
    </div>
  )
}