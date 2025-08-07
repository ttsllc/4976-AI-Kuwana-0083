'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { EmotionType } from '@/lib/emotionAnalyzer'

interface ReadyPlayerMeAvatarProps {
  avatarUrl?: string
  isPlaying?: boolean
  isSpeaking?: boolean
  emotion?: EmotionType
  size?: number
}

// ReadyPlayerMeアバターモデルコンポーネント
function AvatarModel({ 
  avatarUrl, 
  isSpeaking, 
  emotion 
}: {
  avatarUrl?: string
  isSpeaking: boolean
  emotion: string
}) {
  const group = useRef<THREE.Group>(null)
  const [model, setModel] = useState<any>(null)
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null)
  
  // デフォルトのサンプルアバターURL (ReadyPlayerMeの公開デモアバター)
  const defaultAvatarUrl = avatarUrl || 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934c5.glb'

  // GLTFモデルの読み込み
  useEffect(() => {
    const loader = new GLTFLoader()
    
    loader.load(
      defaultAvatarUrl,
      (gltf) => {
        console.log('ReadyPlayerMe avatar loaded:', gltf)
        setModel(gltf.scene)
        
        // アニメーションミキサーの設定
        if (gltf.animations.length > 0) {
          const newMixer = new THREE.AnimationMixer(gltf.scene)
          setMixer(newMixer)
          
          // 基本的なアニメーションを開始
          const idleAction = newMixer.clipAction(gltf.animations[0])
          idleAction.play()
        }
      },
      (progress) => {
        console.log('Loading progress:', progress.loaded / progress.total * 100 + '%')
      },
      (error) => {
        console.error('Error loading ReadyPlayerMe avatar:', error)
        // フォールバック: 基本的な3D形状を表示
        createFallbackAvatar()
      }
    )
  }, [defaultAvatarUrl])

  // フォールバックアバターの作成
  const createFallbackAvatar = () => {
    const geometry = new THREE.CapsuleGeometry(1, 2, 4, 8)
    const material = new THREE.MeshStandardMaterial({ 
      color: '#8A2BE2',
      transparent: true,
      opacity: 0.8 
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    
    const scene = new THREE.Object3D()
    scene.add(mesh)
    setModel(scene)
  }

  // アニメーションフレーム
  useFrame((state, delta) => {
    if (!group.current) return

    // アニメーションミキサーの更新
    if (mixer) {
      mixer.update(delta)
    }

    // 基本的な呼吸アニメーション
    const time = state.clock.getElapsedTime()
    group.current.position.y = Math.sin(time * 0.5) * 0.02

    // 話している時のアニメーション
    if (isSpeaking) {
      group.current.rotation.y = Math.sin(time * 3) * 0.03
      group.current.scale.setScalar(1 + Math.sin(time * 8) * 0.01)
    } else {
      group.current.scale.setScalar(1)
    }

    // 感情に応じた動き
    switch (emotion) {
      case 'happy':
        group.current.rotation.z = Math.sin(time * 2) * 0.02
        break
      case 'surprised':
        group.current.scale.y = 1 + Math.sin(time * 4) * 0.02
        break
      case 'thinking':
        group.current.rotation.x = Math.sin(time * 1) * 0.01
        break
    }
  })

  if (!model) {
    return null
  }

  return (
    <group ref={group}>
      <primitive 
        object={model} 
        scale={[1.8, 1.8, 1.8]}
        position={[0, -1, 0]}
      />
    </group>
  )
}

// ライティング設定
function AvatarLighting({ emotion }: { emotion: string }) {
  const lightColor = {
    neutral: '#ffffff',
    happy: '#fff9c4',
    surprised: '#e3f2fd',
    thinking: '#f3e5f5',
    sad: '#e8f5e8',
    angry: '#ffebee'
  }[emotion] || '#ffffff'

  return (
    <>
      <ambientLight intensity={0.4} color={lightColor} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight 
        position={[-5, 3, 5]} 
        intensity={0.3} 
        color="#4ecdc4" 
      />
      <hemisphereLight
        args={['#87CEEB', '#98D8E8', 0.3]}
      />
    </>
  )
}

// ローディングコンポーネント
function AvatarLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">3Dアバターを読み込み中...</p>
      </div>
    </div>
  )
}

export default function ReadyPlayerMeAvatar({ 
  avatarUrl, 
  isPlaying = false, 
  isSpeaking = false, 
  emotion = 'neutral',
  size = 400
}: ReadyPlayerMeAvatarProps) {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`relative rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 ${
        isSpeaking ? 'ring-4 ring-green-400 ring-opacity-50 shadow-lg' : 'shadow-md'
      }`}
    >
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <AvatarLighting emotion={emotion} />
          <AvatarModel
            avatarUrl={avatarUrl}
            isSpeaking={isSpeaking}
            emotion={emotion}
          />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Suspense>
      </Canvas>
      
      {/* 状態インジケーター */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2">
        {/* 感情表示 */}
        <div className="bg-white bg-opacity-90 rounded-full px-2 py-1 text-sm shadow-md">
          {emotion === 'happy' && '😊'}
          {emotion === 'surprised' && '😮'}
          {emotion === 'thinking' && '🤔'}
          {emotion === 'sad' && '😢'}
          {emotion === 'angry' && '😠'}
          {emotion === 'neutral' && '😐'}
        </div>
        
        {/* 話している状態 */}
        {isSpeaking && (
          <div className="bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium shadow-md animate-pulse">
            話し中
          </div>
        )}
      </div>

      {/* ReadyPlayerMeブランディング */}
      <div className="absolute bottom-2 left-2">
        <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          Powered by ReadyPlayer.Me
        </div>
      </div>
    </div>
  )
}