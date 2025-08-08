'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, User, MessageCircle, Mic } from 'lucide-react'
import Avatar3D from '@/components/Avatar3D'
import ReadyPlayerMeAvatar from '@/components/ReadyPlayerMeAvatar'
import TalkingPortrait from '@/components/TalkingPortrait'
import KanjiReadingTest from '@/components/KanjiReadingTest'
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
  const [avatarMode, setAvatarMode] = useState<'3d' | 'readyplayerme' | 'portrait'>('portrait')
  const [currentMessage, setCurrentMessage] = useState<string>('')
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

    // アバターモード設定を読み込み
    const savedAvatarMode = localStorage.getItem('avatarMode')
    if (savedAvatarMode) {
      setAvatarMode(JSON.parse(savedAvatarMode))
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
      setCurrentMessage(data.message)
      
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
    setCurrentMessage(text)
    
    // アバターアニメーション
    startSpeaking(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/40">
      {/* プロフェッショナルなヘッダー */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-8 py-5 max-w-8xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-blue-100/50">
                <span className="text-white font-bold text-xl">桑</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 japanese-text tracking-tight leading-tight">
                  AI桑名社長 #0084
                </h1>
                <p className="text-base text-gray-600 font-medium">中古車・新車買取販売 | 奇跡査定センター代表</p>
                <p className="text-sm text-gray-500 font-mono">Version 0084</p>
              </div>
            </div>
            
            {/* プロフェッショナルナビゲーション */}
            <nav className="hidden lg:flex items-center space-x-3">
              <Link 
                href="/avatar"
                className="flex items-center px-5 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 text-sm font-semibold border border-transparent hover:border-blue-200/50 hover:shadow-md"
              >
                <User size={18} className="mr-2" />
                アバター設定
              </Link>
              <Link 
                href="/voice"
                className="flex items-center px-5 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 text-sm font-semibold border border-transparent hover:border-blue-200/50 hover:shadow-md"
              >
                <Mic size={18} className="mr-2" />
                音声設定
              </Link>
              <Link 
                href="/personality"
                className="flex items-center px-5 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 text-sm font-semibold border border-transparent hover:border-blue-200/50 hover:shadow-md"
              >
                <MessageCircle size={18} className="mr-2" />
                パーソナリティ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-8 py-10 max-w-8xl">

        {/* ステータスバー */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 shadow-xl">
            <div className="flex items-center justify-between">
              {/* リアルタイムコントロール */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setRealtimeMode(!realtimeMode)}
                  className={`flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    realtimeMode 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mr-4 ${realtimeMode ? 'bg-red-200 animate-pulse' : 'bg-blue-200'}`} />
                  {realtimeMode ? '音声会話中' : '音声会話開始'}
                </button>
              </div>
              
              {/* アバターモード選択 */}
              <div className="flex items-center space-x-4">
                <span className="text-base font-semibold text-gray-700 mr-2">表示モード:</span>
                <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-2 shadow-inner">
                  {[
                    { key: 'portrait', label: '2D', icon: '👔' },
                    { key: '3d', label: '3D', icon: '🎭' },
                    { key: 'readyplayerme', label: 'Pro', icon: '🚀' }
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => {
                        setAvatarMode(mode.key as any)
                        localStorage.setItem('avatarMode', JSON.stringify(mode.key))
                      }}
                      className={`flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        avatarMode === mode.key
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <span className="mr-2 text-lg">{mode.icon}</span>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 xl:grid-cols-5 gap-8">
          {/* アバター表示エリア */}
          <div className="lg:col-span-3 xl:col-span-2">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-8 h-fit hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-semibold mb-4 shadow-sm border border-blue-200/50">
                  {avatarMode === 'portrait' && (
                    <>
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-3 animate-pulse" />
                      2Dモード
                    </>
                  )}
                  {avatarMode === '3d' && (
                    <>
                      <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-3 animate-pulse" />
                      3Dモード
                    </>
                  )}
                  {avatarMode === 'readyplayerme' && (
                    <>
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3 animate-pulse" />
                      Proモード
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 japanese-text mb-1">AI桑名社長 #0084</h2>
                <p className="text-base text-gray-600 font-medium">奇跡査定センター代表</p>
                <p className="text-xs text-gray-500 mt-1">社会人大学創設者 | 湘南える新聞社代表</p>
                <p className="text-sm text-gray-500 font-mono mt-1">Version 0084</p>
              </div>
              <div className="flex justify-center mb-4">
                {avatarMode === 'portrait' && (
                  <TalkingPortrait
                    imageUrl={avatarImage || undefined}
                    isSpeaking={isSpeaking}
                    emotion={currentEmotion.primary}
                    size={400}
                  />
                )}
                {avatarMode === 'readyplayerme' && (
                  <ReadyPlayerMeAvatar
                    avatarUrl={readyPlayerMeUrl}
                    isPlaying={isPlaying}
                    isSpeaking={isSpeaking}
                    emotion={currentEmotion.primary}
                    size={400}
                  />
                )}
                {avatarMode === '3d' && (
                  <Avatar3D
                    imageUrl={avatarImage || undefined}
                    isPlaying={isPlaying}
                    isSpeaking={isSpeaking}
                    emotion={currentEmotion.primary}
                    size={400}
                    expressions={currentEmotion.facialExpressions}
                    settings={avatar3DSettings}
                  />
                )}
              </div>
              
              {/* ステータス表示 */}
              <div className="space-y-4">
                {/* 会話状態 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">会話状態</span>
                  <div className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isSpeaking 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    {isSpeaking ? '応答中' : '待機中'}
                  </div>
                </div>

                {/* 感情分析 */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">感情分析</span>
                    <div className="text-lg">
                      {currentEmotion.primary === 'happy' && '😊'}
                      {currentEmotion.primary === 'surprised' && '😮'}
                      {currentEmotion.primary === 'thinking' && '🤔'}
                      {currentEmotion.primary === 'sad' && '😢'}
                      {currentEmotion.primary === 'angry' && '😠'}
                      {currentEmotion.primary === 'neutral' && '😐'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>主要感情: {currentEmotion.primary}</div>
                    <div className="flex justify-between">
                      <span>強度: {Math.round(currentEmotion.intensity * 100)}%</span>
                      <span>信頼度: {Math.round(currentEmotion.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* モード別設定セクション */}
              {avatarMode === 'portrait' && (
                <div className="mt-4 text-center space-y-2">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>2Dポートレートモード</strong>
                    </p>
                    <p className="text-xs text-green-600">
                      画像が話しているように見える軽量なアバターです
                    </p>
                  </div>
                  {!avatarImage && (
                    <Link 
                      href="/avatar"
                      className="text-green-500 hover:underline text-sm"
                    >
                      📸 ポートレート画像を設定する →
                    </Link>
                  )}
                </div>
              )}
              
              {avatarMode === 'readyplayerme' && (
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
              )}
              
              {avatarMode === '3d' && (
                <div className="mt-4 text-center space-y-2">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>3Dアバターモード</strong>
                    </p>
                    <p className="text-xs text-blue-600">
                      カスタマイズ可能な3D球体アバターです
                    </p>
                  </div>
                  <div className="flex space-x-2 justify-center">
                    {!avatarImage && (
                      <Link 
                        href="/avatar"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        🖼️ テクスチャ画像を設定
                      </Link>
                    )}
                    <Link 
                      href="/avatar-3d"
                      className="text-indigo-500 hover:underline text-sm"
                    >
                      ⚙️ 3D設定を調整
                    </Link>
                  </div>
                </div>
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
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 h-fit hover:shadow-3xl transition-all duration-300">
              {/* チャットヘッダー */}
              <div className="flex items-center justify-between p-8 border-b border-gray-200/60">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">車買取・販売相談チャット</h3>
                  <p className="text-base text-gray-600 font-medium mt-1">AI桑名社長が中古車・新車の買取販売についてアドバイスします</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">オンライン</span>
                </div>
              </div>

              {/* チャット履歴 */}
              <div className="p-8 h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🚗</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">AI桑名社長にご相談ください</h4>
                    <p className="text-gray-500 mb-6">車の買取・販売から査定のコツまで、何でもお聞きください</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                      {[
                        '車の買取価格を上げるコツは？',
                        '高額査定のポイントを教えて',
                        '中古車選びのアドバイス',
                        '新車と中古車どちらがお得？'
                      ].map((question, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(question)}
                          className="p-3 text-sm text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 max-w-md ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* アバター */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' 
                              ? 'bg-blue-500' 
                              : 'bg-gradient-to-br from-blue-600 to-purple-600'
                          }`}>
                            <span className="text-white text-sm">
                              {message.role === 'user' ? '👤' : '桑'}
                            </span>
                          </div>
                          
                          {/* メッセージ */}
                          <div className={`rounded-2xl p-4 ${
                            message.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="flex items-start justify-between space-x-2">
                              <span className="text-sm leading-relaxed japanese-text">{message.content}</span>
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
                      </div>
                    ))}
                    
                    {/* ローディング */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-md">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm">桑</span>
                          </div>
                          <div className="bg-gray-100 rounded-2xl p-4">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 入力エリア */}
              {!realtimeMode && (
                <div className="border-t border-gray-200/60 p-8">
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="質問を入力してください... (例: 車の査定額を上げるコツを教えて)"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent japanese-text"
                          disabled={isLoading}
                        />
                        <VoiceRecorder
                          onTranscript={(text) => {
                            setInput(text)
                          }}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* リアルタイムチャット */}
        {realtimeMode && (
          <div className="mt-8">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-8">
              <RealTimeChat
                onTranscript={handleRealtimeTranscript}
                onResponse={handleRealtimeResponse}
                isEnabled={realtimeMode}
              />
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-16 pb-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 font-mono">
            AI桑名社長 #0084 - Version 0084
          </p>
          <p className="text-xs text-gray-400 mt-1">
            奇跡査定センター | 中古車・新車買取販売
          </p>
        </div>
      </footer>

      {/* フローティングツール */}
      <div className="fixed bottom-6 right-6 z-50">
        <KanjiReadingTest />
      </div>
    </div>
  )
}