'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { optimizeForTTS } from '@/lib/kanjiReading'

interface AudioPlayerProps {
  text: string
  autoPlay?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
  speed?: number // 音声速度 (0.25-4.0)
}

export default function AudioPlayer({ text, autoPlay = false, onPlayStart, onPlayEnd, speed = 1.1 }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (autoPlay && text) {
      handlePlay()
    }
  }, [text, autoPlay])

  const generateAudio = async () => {
    setIsLoading(true)
    try {
      // 漢字を読み仮名に変換してTTS用に最適化
      const optimizedText = optimizeForTTS(text)
      console.log('Original text:', text)
      console.log('Optimized for TTS:', optimizedText)
      
      // 保存された音声設定を取得
      const voiceSettings = localStorage.getItem('voiceSettings')
      let useCustomVoice = false
      let voiceId = ''
      
      if (voiceSettings) {
        const settings = JSON.parse(voiceSettings)
        useCustomVoice = settings.useCustomVoice || false
        voiceId = settings.voiceId || ''
      }

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: optimizedText, // 最適化されたテキストを使用
          voiceId: useCustomVoice ? voiceId : undefined,
          useCustomVoice,
          speed: speed // 音声速度を送信
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('TTS API Error:', response.status, errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Failed to generate audio')
        } catch (parseError) {
          throw new Error(`Failed to generate audio: ${response.status} - ${errorText}`)
        }
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      return url
    } catch (error) {
      console.error('Audio generation error:', error)
      alert('音声の生成に失敗しました。')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = async () => {
    if (!text) return

    let url = audioUrl
    if (!url) {
      url = await generateAudio()
      if (!url) return
    }

    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
      setIsPlaying(true)
      onPlayStart?.()
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
    onPlayEnd?.()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('ended', handleAudioEnd)
      return () => {
        audio.removeEventListener('ended', handleAudioEnd)
      }
    }
  }, [])

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  if (!text) return null

  return (
    <div className="flex items-center space-x-2">
      <audio ref={audioRef} className="hidden" />
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLoading}
        className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        title={isPlaying ? '停止' : '再生'}
      >
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full" />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Volume2 size={16} />
        )}
      </button>
    </div>
  )
}