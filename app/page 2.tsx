'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, User, MessageCircle, Mic } from 'lucide-react'
import Avatar3D from '@/components/Avatar3D'
import ReadyPlayerMeAvatar from '@/components/ReadyPlayerMeAvatar'
import RealTimeChat from '@/components/RealTimeChat'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'
import { useAvatarAnimation } from '@/lib/useAvatarAnimation'
import { emotionAnalyzer, type EmotionAnalysis } from '@/lib/emotionAnalyzer'

export default function Home() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [realtimeMode, setRealtimeMode] = useState(false)
  const [useReadyPlayerMe, setUseReadyPlayerMe] = useState(false)
  const [readyPlayerMeUrl, setReadyPlayerMeUrl] = useState<string | undefined>(undefined)
  const [avatar3DSettings, setAvatar3DSettings] = useState({
    faceColor: '#ffdba4',
    eyeColor: '#1a1a1a',
    mouthColor: '#444444',
    scale: 1.0,
    headShape: 'sphere' as const,
    emotionSensitivity: 1.0,
    textureScale: 0.9,
    textureOffsetX: 0,
    textureOffsetY: 0,
    textureRotation: 0,
    textureFlipVertical: false,
    textureFlipHorizontal: false,
    sphereOpacity: 1.0,
    textureOpacity: 0.9
  })
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis>({
    primary: 'neutral',
    confidence: 0,
    intensity: 0,
    facialExpressions: {
      eyeBlinkLeft: 0,
      eyeBlinkRight: 0,
      mouthOpen: 0,
      mouthSmile: 0,
      eyebrowUp: 0,
      cheekPuff: 0
    }
  })
  
  // アバターアニメーションフック
  const { isSpeaking, emotion, isPlaying, startSpeaking, stopSpeaking } = useAvatarAnimation()

  // アバター画像と3D設定を読み込み
  useEffect(() => {
    const savedAvatar = localStorage.getItem('avatarSettings')
    if (savedAvatar) {
      const avatarData = JSON.parse(savedAvatar)
      setAvatarImage(avatarData.imageUrl)
    }

    const saved3DSettings = localStorage.getItem('avatar3DSettings')
    if (saved3DSettings) {
      setAvatar3DSettings(JSON.parse(saved3DSettings))
    }

    // ReadyPlayerMe設定を読み込み
    const savedReadyPlayerMe = localStorage.getItem('useReadyPlayerMe')
    if (savedReadyPlayerMe) {
      setUseReadyPlayerMe(JSON.parse(savedReadyPlayerMe))
    }

    const savedReadyPlayerMeUrl = localStorage.getItem('readyPlayerMeUrl')
    if (savedReadyPlayerMeUrl) {
      setReadyPlayerMeUrl(JSON.parse(savedReadyPlayerMeUrl))
    }
  }, [])

  // sendMessage関数を更新（高度な感情分析付き）
  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user' as const, content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    
    // ユーザーメッセージの感情分析
    const userEmotion = emotionAnalyzer.analyzeText(input)
    console.log('ユーザー感情分析:', userEmotion)
    
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage = { role: 'assistant' as const, content: data.message }
      setMessages(prev => [...prev, assistantMessage])
      
      // AIメッセージの感情分析
      const aiEmotion = emotionAnalyzer.analyzeText(data.message)
      setCurrentEmotion(aiEmotion)
      
      // アバターアニメーション開始
      startSpeaking(data.message)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'すみません、エラーが発生しました。もう一度お試しください。' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // リアルタイムチャットのハンドラー
  const handleRealtimeTranscript = (text: string, isFinal: boolean) => {
    if (!isFinal) {
      // 中間結果の表示用
      console.log('リアルタイム認識:', text)
    }
  }

  const handleRealtimeResponse = (text: string) => {
    // AIの応答を会話履歴に追加
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: text }
    ])
    
    // 感情分析
    const emotion = emotionAnalyzer.analyzeText(text)
    setCurrentEmotion(emotion)
    
    // アバターアニメーション
    startSpeaking(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            AI 3Dアバターチャット
          </h1>
          <div className="flex space-x-3">
            <Link 
              href="/avatar"
              className="flex items-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              <User size={14} className="mr-1" />
              アバター
            </Link>
            <Link 
              href="/avatar-3d"
              className="flex items-center px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
            >
              <User size={14} className="mr-1" />
              3D設定
            </Link>
            <Link 
              href="/readyplayerme"
              className="flex items-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              <User size={14} className="mr-1" />
              ReadyPlayerMe
            </Link>
            <Link 
              href="/voice"
              className="flex items-center px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
            >
              <Mic size={14} className="mr-1" />
              音声
            </Link>
            <Link 
              href="/personality"
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <MessageCircle size={14} className="mr-1" />
              AI設定
            </Link>
          </div>
        </div>

        {/* モード切り替え */}
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setRealtimeMode(!realtimeMode)}
            className={`px-6 py-3 rounded-lg transition-colors ${
              realtimeMode 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {realtimeMode ? 'リアルタイムモード終了' : 'リアルタイム会話開始'}
          </button>
          
          <button
            onClick={() => {
              const newMode = !useReadyPlayerMe
              setUseReadyPlayerMe(newMode)
              localStorage.setItem('useReadyPlayerMe', JSON.stringify(newMode))
            }}
            className={`px-6 py-3 rounded-lg transition-colors ${
              useReadyPlayerMe
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {useReadyPlayerMe ? 'ReadyPlayerMe使用中' : 'ReadyPlayerMe使用'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3Dアバター表示エリア */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {useReadyPlayerMe ? 'ReadyPlayerMe アバター' : '3Dアバター'}
              </h2>
              <div className="flex justify-center mb-4">
                {useReadyPlayerMe ? (
                  <ReadyPlayerMeAvatar
                    avatarUrl={readyPlayerMeUrl}
                    isPlaying={isPlaying}
                    isSpeaking={isSpeaking}
                    emotion={currentEmotion.primary}
                    size={300}
                  />
                ) : (
                  <Avatar3D
                    imageUrl={avatarImage || undefined}
                    isPlaying={isPlaying}
                    isSpeaking={isSpeaking}
                    emotion={currentEmotion.primary}
                    size={300}
                    expressions={currentEmotion.facialExpressions}
                    settings={avatar3DSettings}
                  />
                )}
              </div>
              
              {/* 感情分析結果表示 */}
              <div className="text-center text-sm space-y-2">
                <div className={`px-3 py-1 rounded-full text-white ${
                  isSpeaking ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {isSpeaking ? '話しています' : '待機中'}
                </div>
                
                <div className="bg-gray-100 rounded-lg p-2">
                  <div>感情: {currentEmotion.primary} 
                    {currentEmotion.secondary && ` + ${currentEmotion.secondary}`}
                  </div>
                  <div>強度: {Math.round(currentEmotion.intensity * 100)}%</div>
                  <div>信頼度: {Math.round(currentEmotion.confidence * 100)}%</div>
                </div>
              </div>
              
              {useReadyPlayerMe ? (
                <div className="mt-4 text-center space-y-2">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-purple-800 mb-2">
                      <strong>ReadyPlayerMe URL:</strong>
                    </p>
                    <input
                      type="text"
                      value={readyPlayerMeUrl || ''}
                      onChange={(e) => {
                        setReadyPlayerMeUrl(e.target.value)
                        localStorage.setItem('readyPlayerMeUrl', JSON.stringify(e.target.value))
                      }}
                      placeholder="https://models.readyplayer.me/your-avatar-id.glb"
                      className="w-full px-3 py-2 border border-purple-300 rounded text-sm"
                    />
                    <p className="text-xs text-purple-600 mt-1">
                      ReadyPlayer.Meで作成したアバターのURLを入力してください
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      window.open('https://readyplayer.me/avatar', '_blank')
                    }}
                    className="text-purple-500 hover:underline text-sm"
                  >
                    ReadyPlayer.Meでアバターを作成する →
                  </button>
                </div>
              ) : (
                !avatarImage && (
                  <div className="mt-4 text-center">
                    <Link 
                      href="/avatar"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      アバター画像を設定する
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* リアルタイムチャットコンポーネント */}
            {realtimeMode && (
              <div className="mt-6">
                <RealTimeChat
                  onTranscript={handleRealtimeTranscript}
                  onResponse={handleRealtimeResponse}
                  isEnabled={realtimeMode}
                />
              </div>
            )}
          </div>

          {/* チャットエリア */}
          <div className="lg:col-span-2">
            {/* チャット履歴 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  メッセージを送信してチャットを開始しましょう
                  <br />
                  <span className="text-sm">または上の「リアルタイム会話開始」ボタンで音声会話を始められます</span>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}>
                      <div className="flex items-start space-x-2">
                        <span className="flex-1">{message.content}</span>
                        {message.role === 'assistant' && (
                          <AudioPlayer 
                            text={message.content}
                            autoPlay={index === messages.length - 1}
                            onPlayStart={() => startSpeaking(message.content)}
                            onPlayEnd={() => stopSpeaking()}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-left">
                  <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 入力エリア（リアルタイムモード時は無効化） */}
            {!realtimeMode && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="メッセージを入力するか、マイクボタンで音声入力..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                  <VoiceRecorder
                    onTranscript={(text) => {
                      setInput(text)
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}