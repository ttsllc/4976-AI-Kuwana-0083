'use client'

import { useRef, useEffect, useState } from 'react'
import { EmotionType } from '@/lib/emotionAnalyzer'

interface TalkingPortraitProps {
  imageUrl?: string
  isSpeaking?: boolean
  emotion?: EmotionType
  size?: number
}

// 表情変化の設定
interface ExpressionConfig {
  eyeScale: number
  eyeRotation: number
  mouthScale: number
  mouthRotation: number
  cheekScale: number
  browRotation: number
  faceSkew: number
}

export default function TalkingPortrait({
  imageUrl,
  isSpeaking = false,
  emotion = 'neutral',
  size = 300
}: TalkingPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)

  // 感情別の表情設定
  const getExpressionConfig = (emotion: string): ExpressionConfig => {
    switch (emotion) {
      case 'happy':
        return {
          eyeScale: 0.9,
          eyeRotation: -2,
          mouthScale: 1.2,
          mouthRotation: 5,
          cheekScale: 1.1,
          browRotation: 1,
          faceSkew: 0
        }
      case 'surprised':
        return {
          eyeScale: 1.3,
          eyeRotation: 0,
          mouthScale: 1.4,
          mouthRotation: 0,
          cheekScale: 1.0,
          browRotation: -3,
          faceSkew: 0
        }
      case 'sad':
        return {
          eyeScale: 0.8,
          eyeRotation: 1,
          mouthScale: 0.8,
          mouthRotation: -8,
          cheekScale: 0.95,
          browRotation: 2,
          faceSkew: -1
        }
      case 'angry':
        return {
          eyeScale: 0.85,
          eyeRotation: 3,
          mouthScale: 0.9,
          mouthRotation: -3,
          cheekScale: 1.05,
          browRotation: -2,
          faceSkew: 1
        }
      case 'thinking':
        return {
          eyeScale: 0.9,
          eyeRotation: 0,
          mouthScale: 0.9,
          mouthRotation: -2,
          cheekScale: 1.0,
          browRotation: 1,
          faceSkew: 0
        }
      default:
        return {
          eyeScale: 1,
          eyeRotation: 0,
          mouthScale: 1,
          mouthRotation: 0,
          cheekScale: 1,
          browRotation: 0,
          faceSkew: 0
        }
    }
  }

  // 話している時の追加変形
  const getSpeakingTransform = () => {
    if (!isSpeaking) return ''
    
    const intensity = Math.sin(animationFrame * 0.3) * 0.5 + 0.5
    const mouthMovement = Math.sin(animationFrame * 0.8) * 0.1
    
    return `scaleY(${1 + mouthMovement * 0.1}) translateY(${mouthMovement * 2}px)`
  }

  // 感情に応じたフィルター効果
  const getEmotionFilter = () => {
    const baseFilter = (() => {
      switch (emotion) {
        case 'happy':
          return 'brightness(1.1) saturate(1.2) hue-rotate(5deg)'
        case 'surprised':
          return 'brightness(1.05) contrast(1.1)'
        case 'thinking':
          return 'sepia(0.1) brightness(0.95)'
        case 'sad':
          return 'brightness(0.9) saturate(0.8) sepia(0.1)'
        case 'angry':
          return 'brightness(1.05) saturate(1.3) hue-rotate(10deg)'
        default:
          return 'none'
      }
    })()
    
    if (isSpeaking) {
      const pulse = Math.sin(animationFrame * 0.2) * 0.05 + 1
      return `${baseFilter} brightness(${pulse})`
    }
    
    return baseFilter
  }

  // アニメーションループ
  useEffect(() => {
    let rafId: number
    
    const animate = () => {
      setAnimationFrame(prev => prev + 1)
      rafId = requestAnimationFrame(animate)
    }
    
    if (isSpeaking) {
      rafId = requestAnimationFrame(animate)
    }
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isSpeaking])

  // 表情オーバーレイエフェクト
  const ExpressionOverlay = () => {
    if (!isLoaded) return null

    const config = getExpressionConfig(emotion)
    const speakingIntensity = isSpeaking ? Math.sin(animationFrame * 0.5) * 0.3 + 0.7 : 1

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* 目のエフェクト（上部1/3あたり） */}
        <div 
          className="absolute top-1/4 left-1/4 right-1/4"
          style={{
            height: '15%',
            transform: `scaleX(${config.eyeScale}) rotateZ(${config.eyeRotation}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* 左目 */}
          <div 
            className="absolute left-2 w-6 h-full"
            style={{
              background: `radial-gradient(ellipse, rgba(0, 0, 0, ${0.1 * speakingIntensity}) 0%, transparent 70%)`,
              borderRadius: '50%'
            }}
          />
          {/* 右目 */}
          <div 
            className="absolute right-2 w-6 h-full"
            style={{
              background: `radial-gradient(ellipse, rgba(0, 0, 0, ${0.1 * speakingIntensity}) 0%, transparent 70%)`,
              borderRadius: '50%'
            }}
          />
        </div>

        {/* 口のエフェクト（下部1/3あたり） */}
        <div 
          className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2"
          style={{
            width: '25%',
            height: '10%',
            transform: `translate(-50%, 0) scaleX(${config.mouthScale}) rotateZ(${config.mouthRotation}deg) ${getSpeakingTransform()}`,
            transformOrigin: 'center',
            transition: isSpeaking ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: isSpeaking 
                ? `radial-gradient(ellipse, rgba(255, 100, 100, ${0.2 * speakingIntensity}) 0%, transparent 70%)`
                : `radial-gradient(ellipse, rgba(255, 255, 255, ${0.1}) 0%, transparent 70%)`,
              borderRadius: '50%'
            }}
          />
        </div>

        {/* 頬のエフェクト */}
        {(emotion === 'happy' || emotion === 'surprised') && (
          <>
            {/* 左頬 */}
            <div 
              className="absolute top-1/2 left-4"
              style={{
                width: '20%',
                height: '15%',
                transform: `scale(${config.cheekScale})`,
                background: 'radial-gradient(circle, rgba(255, 200, 200, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'transform 0.3s ease-out'
              }}
            />
            {/* 右頬 */}
            <div 
              className="absolute top-1/2 right-4"
              style={{
                width: '20%',
                height: '15%',
                transform: `scale(${config.cheekScale})`,
                background: 'radial-gradient(circle, rgba(255, 200, 200, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'transform 0.3s ease-out'
              }}
            />
          </>
        )}
        
        {/* 音声の波形エフェクト */}
        {isSpeaking && (
          <div className="absolute bottom-0 left-0 right-0 h-6 flex items-end justify-center space-x-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="bg-blue-500 opacity-60 rounded-t"
                style={{
                  width: '2px',
                  height: `${Math.sin(animationFrame * 0.3 + i) * 15 + 10}px`,
                  transition: 'height 0.1s ease-out'
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 感情表示
  const EmotionIndicator = () => (
    <div className="absolute top-2 right-2 text-2xl bg-white bg-opacity-90 rounded-full p-1 shadow-lg">
      {emotion === 'happy' && '😊'}
      {emotion === 'surprised' && '😮'}
      {emotion === 'thinking' && '🤔'}
      {emotion === 'sad' && '😢'}
      {emotion === 'angry' && '😠'}
      {emotion === 'neutral' && '😐'}
    </div>
  )

  // 話している状態インジケーター
  const SpeakingIndicator = () => (
    isSpeaking && (
      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
        話し中
      </div>
    )
  )

  // テキスト表示は非表示（不要）
  // const SubtitleText = () => null

  // 全体の画像変形を取得
  const getImageTransform = () => {
    const config = getExpressionConfig(emotion)
    const baseTransform = `skewY(${config.faceSkew}deg)`
    
    if (isSpeaking) {
      const breathe = Math.sin(animationFrame * 0.1) * 0.01 + 1
      const subtle = Math.sin(animationFrame * 0.2) * 0.003
      return `${baseTransform} scale(${breathe}) rotateZ(${subtle}deg)`
    }
    
    return baseTransform
  }

  return (
    <>      
      <div 
        ref={containerRef}
        style={{ width: size, height: size }}
        className={`relative ${
          isSpeaking ? 'ring-4 ring-blue-400 ring-opacity-50' : 'ring-2 ring-gray-200'
        }`}
      >
        {/* 画像コンテナ */}
        <div 
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{ width: size, height: size }}
        >
          {imageUrl ? (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Portrait"
              className="w-full h-full object-cover"
              style={{ 
                filter: getEmotionFilter(),
                transform: getImageTransform(),
                transformOrigin: 'center center',
                transition: isSpeaking ? 'filter 0.1s ease-out' : 'all 0.3s ease-out',
                fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif"
              }}
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(false)}
            />
          ) : (
            // デフォルトアバター
            <div 
              className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
              style={{
                transform: getImageTransform(),
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="text-white text-6xl">👤</div>
            </div>
          )}
          
          {/* 表情オーバーレイエフェクト */}
          <ExpressionOverlay />
          
          {/* インジケーター */}
          <SpeakingIndicator />
          <EmotionIndicator />
          
          {/* 話している時のフレームエフェクト */}
          {isSpeaking && (
            <div className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse pointer-events-none" />
          )}
          
          {/* 読み込み中表示 */}
          {imageUrl && !isLoaded && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        {/* 字幕テキストは非表示 */}
      </div>
    </>
  )
}