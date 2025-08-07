'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EmotionType } from '@/lib/emotionAnalyzer'

interface ReadyPlayerMeAvatarProps {
  avatarUrl?: string
  isPlaying?: boolean
  isSpeaking?: boolean
  emotion?: EmotionType
  size?: number
}

// ReadyPlayerMeアバターモデルコンポーネント（簡化版）
function AvatarModel({ 
  avatarUrl, 
  isSpeaking, 
  emotion 
}: {
  avatarUrl: string
  isSpeaking: boolean
  emotion: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  // アニメーションの更新
  useFrame((state) => {
    if (meshRef.current) {
      // 感情に基づく簡単なアニメーション
      if (isSpeaking) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 8) * 0.1
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.05
      }
    }
  })

  // 感情に基づく色の設定
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 0x44aa44
      case 'sad': return 0x4444aa
      case 'angry': return 0xaa4444
      case 'surprised': return 0xaaaa44
      default: return 0x8899aa
    }
  }

  return (
    <mesh ref={meshRef} scale={[2, 2, 2]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={getEmotionColor(emotion)} />
    </mesh>
  )
}

export default function ReadyPlayerMeAvatar({
  avatarUrl = '',
  isPlaying = false,
  isSpeaking = false,
  emotion = 'neutral',
  size = 300
}: ReadyPlayerMeAvatarProps) {
  if (!avatarUrl) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl border-2 border-purple-300" 
        style={{ width: size, height: size }}
      >
        <div className="text-center text-purple-600">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-sm font-medium">ReadyPlayerMe URL</p>
          <p className="text-xs">を設定してください</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl border border-purple-200 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AvatarModel
          avatarUrl={avatarUrl}
          isSpeaking={isSpeaking}
          emotion={emotion || 'neutral'}
        />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* デバッグ情報 */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs rounded px-2 py-1">
        {emotion} | {isSpeaking ? '話し中' : '待機中'}
      </div>
    </div>
  )
}