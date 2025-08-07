'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

interface RealTimeChatProps {
  onTranscript: (text: string, isFinal: boolean) => void
  onResponse: (text: string) => void
  isEnabled: boolean
}

export default function RealTimeChat({ onTranscript, onResponse, isEnabled }: RealTimeChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  
  const recognitionRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Web Speech API の初期化
  useEffect(() => {
    if (!isEnabled) return

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ja-JP'
      
      recognition.onstart = () => {
        setIsListening(true)
        console.log('音声認識開始')
      }
      
      recognition.onend = () => {
        setIsListening(false)
        console.log('音声認識終了')
        
        // 自動再開（接続中の場合）
        if (isConnected) {
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start()
            }
          }, 100)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('音声認識エラー:', event.error)
        setIsListening(false)
      }
      
      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // リアルタイムで文字起こし結果を表示
        setCurrentTranscript(interimTranscript || finalTranscript)
        
        if (finalTranscript) {
          onTranscript(finalTranscript, true)
          processUserInput(finalTranscript)
          setCurrentTranscript('')
          
          // 沈黙タイマーをリセット
          clearTimeout(silenceTimeoutRef.current)
          startSilenceTimer()
        } else if (interimTranscript) {
          onTranscript(interimTranscript, false)
        }
      }
      
      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      clearTimeout(silenceTimeoutRef.current)
      clearTimeout(responseTimeoutRef.current)
    }
  }, [isEnabled, isConnected])

  // ユーザーの発言を処理してAI応答を生成
  const processUserInput = useCallback(async (text: string) => {
    if (text.trim().length < 3) return // 短すぎる入力は無視
    
    clearTimeout(responseTimeoutRef.current)
    
    try {
      const response = await fetch('/api/realtime-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          conversationMode: true 
        }),
      })

      if (!response.ok) {
        throw new Error('リアルタイムチャット応答の取得に失敗')
      }

      const data = await response.json()
      
      // AI応答を再生
      onResponse(data.message)
      
    } catch (error) {
      console.error('リアルタイムチャットエラー:', error)
    }
  }, [onResponse])

  // 沈黙タイマー（一定時間無音が続いたら応答を促す）
  const startSilenceTimer = useCallback(() => {
    silenceTimeoutRef.current = setTimeout(() => {
      // 長時間の沈黙時の処理（オプション）
      console.log('沈黙が検出されました')
    }, 5000) // 5秒間の沈黙
  }, [])

  // リアルタイムチャット開始/停止
  const toggleConnection = () => {
    if (isConnected) {
      // 停止
      setIsConnected(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      clearTimeout(silenceTimeoutRef.current)
      clearTimeout(responseTimeoutRef.current)
    } else {
      // 開始
      setIsConnected(true)
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      startSilenceTimer()
    }
  }

  if (!isEnabled) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">リアルタイム会話</h3>
      
      {/* 接続状態表示 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
          }`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'リアルタイム会話中' : '待機中'}
          </span>
        </div>
        
        <button
          onClick={toggleConnection}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isConnected
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isConnected ? (
            <>
              <PhoneOff size={16} className="mr-2" />
              終了
            </>
          ) : (
            <>
              <Phone size={16} className="mr-2" />
              開始
            </>
          )}
        </button>
      </div>

      {/* リアルタイム音声認識表示 */}
      {isConnected && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-20">
          <div className="flex items-center mb-2">
            <Mic className={`w-4 h-4 mr-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isListening ? '聞き取り中...' : '音声待機中'}
            </span>
          </div>
          
          {currentTranscript && (
            <div className="text-gray-800 italic">
              「{currentTranscript}」
            </div>
          )}
          
          {!currentTranscript && !isListening && (
            <div className="text-gray-500 text-center">
              話してください
            </div>
          )}
        </div>
      )}

      {/* 使い方のヒント */}
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 リアルタイム会話では、話し終わると自動的にAIが応答します</p>
        <p>💡 自然な会話のペースで話してください</p>
      </div>
    </div>
  )
}