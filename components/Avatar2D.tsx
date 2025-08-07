'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface Avatar2DProps {
  imageUrl?: string
  isPlaying?: boolean
  isSpeaking?: boolean
  emotion?: 'neutral' | 'happy' | 'surprised' | 'thinking'
  size?: number
}

export default function Avatar2D({ 
  imageUrl, 
  isPlaying = false, 
  isSpeaking = false, 
  emotion = 'neutral',
  size = 200 
}: Avatar2DProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [mouthOpen, setMouthOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // 口パクアニメーション
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setMouthOpen(prev => !prev)
      }, 150) // 150msごとに口の開閉を切り替え

      return () => clearInterval(interval)
    } else {
      setMouthOpen(false)
    }
  }, [isSpeaking])

  // 表情アニメーション
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentFrame(prev => (prev + 1) % 60) // 60フレームでループ
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [isPlaying])

  // キャンバスでの描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageUrl) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 顔画像を描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // オーバーレイエフェクトを追加
      drawFaceEffects(ctx, canvas.width, canvas.height)
    }
    img.src = imageUrl
  }, [imageUrl, mouthOpen, emotion, currentFrame])

  const drawFaceEffects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2

    // 口のオーバーレイ（口パク効果）
    if (mouthOpen && isSpeaking) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.3)'
      ctx.beginPath()
      ctx.ellipse(centerX, centerY + height * 0.15, width * 0.08, height * 0.04, 0, 0, 2 * Math.PI)
      ctx.fill()
    }

    // 表情に応じたエフェクト
    switch (emotion) {
      case 'happy':
        // 頬の赤み
        ctx.fillStyle = 'rgba(255, 182, 193, 0.4)'
        ctx.beginPath()
        ctx.ellipse(centerX - width * 0.2, centerY, width * 0.06, height * 0.04, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(centerX + width * 0.2, centerY, width * 0.06, height * 0.04, 0, 0, 2 * Math.PI)
        ctx.fill()
        break

      case 'surprised':
        // 目の強調
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(centerX - width * 0.12, centerY - height * 0.08, width * 0.04, height * 0.04, 0, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(centerX + width * 0.12, centerY - height * 0.08, width * 0.04, height * 0.04, 0, 0, 2 * Math.PI)
        ctx.stroke()
        break

      case 'thinking':
        // 思考バブル風エフェクト
        const bubbleOpacity = 0.1 + 0.05 * Math.sin(currentFrame * 0.1)
        ctx.fillStyle = `rgba(100, 150, 255, ${bubbleOpacity})`
        ctx.beginPath()
        ctx.ellipse(centerX + width * 0.3, centerY - height * 0.3, width * 0.04, height * 0.04, 0, 0, 2 * Math.PI)
        ctx.fill()
        break
    }

    // 話している時のオーラエフェクト
    if (isSpeaking) {
      const glowRadius = 5 + 3 * Math.sin(currentFrame * 0.2)
      ctx.shadowBlur = glowRadius
      ctx.shadowColor = 'rgba(100, 200, 255, 0.5)'
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, width * 0.45, height * 0.45, 0, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }

  if (!imageUrl) {
    return (
      <div 
        className="bg-gray-200 rounded-full flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="text-gray-400 text-4xl">👤</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        className={`relative overflow-hidden rounded-full border-4 transition-all duration-300 ${
          isSpeaking 
            ? 'border-blue-400 shadow-lg shadow-blue-200' 
            : 'border-white shadow-lg'
        }`}
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0"
        />
      </div>
      
      {/* 感情インジケーター */}
      {emotion !== 'neutral' && (
        <div className="absolute -top-2 -right-2 text-2xl">
          {emotion === 'happy' && '😊'}
          {emotion === 'surprised' && '😮'}
          {emotion === 'thinking' && '🤔'}
        </div>
      )}
    </div>
  )
}