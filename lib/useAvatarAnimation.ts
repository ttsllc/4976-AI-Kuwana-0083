'use client'

import { useState, useEffect, useCallback } from 'react'

type Emotion = 'neutral' | 'happy' | 'surprised' | 'thinking'

export function useAvatarAnimation() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [emotion, setEmotion] = useState<Emotion>('neutral')
  const [isPlaying, setIsPlaying] = useState(false)

  // 感情を自動的に推測する関数
  const analyzeEmotion = useCallback((text: string): Emotion => {
    const happyWords = ['嬉しい', '楽しい', '面白い', '良い', 'ありがとう', '素晴らしい', '最高', '笑', 'www']
    const surprisedWords = ['びっくり', '驚', 'すごい', 'え！', '本当', 'マジ', 'うわー', '信じられない']
    const thinkingWords = ['そうですね', 'う〜ん', '考え', '思い', '悩み', 'どう', 'なぜ', 'もしかして']

    const lowerText = text.toLowerCase()

    if (happyWords.some(word => lowerText.includes(word))) {
      return 'happy'
    } else if (surprisedWords.some(word => lowerText.includes(word))) {
      return 'surprised'
    } else if (thinkingWords.some(word => lowerText.includes(word))) {
      return 'thinking'
    }

    return 'neutral'
  }, [])

  // 話し始める
  const startSpeaking = useCallback((text?: string) => {
    setIsSpeaking(true)
    setIsPlaying(true)
    
    if (text) {
      const detectedEmotion = analyzeEmotion(text)
      setEmotion(detectedEmotion)
    }
  }, [analyzeEmotion])

  // 話し終わる
  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false)
    setIsPlaying(false)
    
    // 3秒後に表情を元に戻す
    setTimeout(() => {
      setEmotion('neutral')
    }, 3000)
  }, [])

  // 手動で感情を設定
  const setEmotionManually = useCallback((newEmotion: Emotion) => {
    setEmotion(newEmotion)
  }, [])

  return {
    isSpeaking,
    emotion,
    isPlaying,
    startSpeaking,
    stopSpeaking,
    setEmotion: setEmotionManually,
    analyzeEmotion
  }
}