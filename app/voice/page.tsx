'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mic, Play, Plus } from 'lucide-react'
import VoiceUpload from '@/components/VoiceUpload'
import { useRouter } from 'next/navigation'

interface CustomVoice {
  voiceId: string
  name: string
  description?: string
}

export default function VoicePage() {
  const [voiceSamples, setVoiceSamples] = useState<File[]>([])
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('')
  const [voiceName, setVoiceName] = useState('')
  const [voiceDescription, setVoiceDescription] = useState('')
  const [isCreatingVoice, setIsCreatingVoice] = useState(false)
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [testText, setTestText] = useState('こんにちは！これは音声テストです。')
  const [isTestingVoice, setIsTestingVoice] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadCustomVoices()
    loadSavedSettings()
  }, [])

  const loadCustomVoices = async () => {
    try {
      const response = await fetch('/api/voice-clone')
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (data.voices) {
        setCustomVoices(data.voices)
      }
    } catch (error) {
      console.error('Load voices error:', error)
      alert(error instanceof Error ? error.message : '音声一覧の取得に失敗しました')
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const loadSavedSettings = () => {
    const saved = localStorage.getItem('voiceSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setSelectedVoiceId(settings.voiceId || '')
    }
  }

  const handleVoiceSamplesUpload = (samples: File[]) => {
    setVoiceSamples(samples)
  }

  const createCustomVoice = async () => {
    if (!voiceName.trim() || voiceSamples.length < 2) {
      alert('音声名と最低2つの音声サンプルが必要です')
      return
    }

    setIsCreatingVoice(true)
    try {
      const formData = new FormData()
      formData.append('name', voiceName)
      formData.append('description', voiceDescription)
      
      voiceSamples.forEach((sample, index) => {
        formData.append(`audio_${index}`, sample)
      })

      const response = await fetch('/api/voice-clone', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Voice clone API Error:', response.status, errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || '音声クローンの作成に失敗しました')
        } catch (parseError) {
          throw new Error(`音声クローンの作成に失敗しました: ${response.status} - ${errorText}`)
        }
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      // 作成された音声を選択状態にする
      setSelectedVoiceId(data.voiceId)
      
      // 音声一覧を更新
      await loadCustomVoices()
      
      // フォームをリセット
      setVoiceName('')
      setVoiceDescription('')
      setVoiceSamples([])
      
      alert('音声クローンが作成されました！')
    } catch (error) {
      console.error('Create voice error:', error)
      alert(error instanceof Error ? error.message : '音声クローンの作成に失敗しました')
    } finally {
      setIsCreatingVoice(false)
    }
  }

  const testVoice = async (voiceId: string) => {
    if (!testText.trim()) return

    setIsTestingVoice(true)
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: testText, 
          voiceId: voiceId,
          useCustomVoice: true 
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('TTS API Error:', response.status, errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || '音声生成に失敗しました')
        } catch (parseError) {
          throw new Error(`音声生成に失敗しました: ${response.status} - ${errorText}`)
        }
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error('Test voice error:', error)
      alert('音声テストに失敗しました')
    } finally {
      setIsTestingVoice(false)
    }
  }

  const saveVoiceSettings = () => {
    localStorage.setItem('voiceSettings', JSON.stringify({
      voiceId: selectedVoiceId,
      useCustomVoice: true
    }))
    alert('音声設定が保存されました！')
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} className="mr-2" />
            チャットに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">音声設定</h1>
          <div className="w-20"></div>
        </div>

        <div className="space-y-8">
          {/* 既存の音声選択 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">作成済みの音声を選択</h2>
            
            {isLoadingVoices ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : customVoices.length > 0 ? (
              <div className="space-y-3">
                {customVoices.map((voice) => (
                  <div 
                    key={voice.voiceId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVoiceId === voice.voiceId 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVoiceId(voice.voiceId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{voice.name}</h3>
                        {voice.description && (
                          <p className="text-sm text-gray-600">{voice.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            testVoice(voice.voiceId)
                          }}
                          disabled={isTestingVoice}
                          className="p-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                          title="音声テスト"
                        >
                          <Play size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* テスト用テキスト */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">テスト用テキスト</label>
                  <input
                    type="text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="テスト用のテキストを入力"
                  />
                </div>

                {/* 設定保存ボタン */}
                <button
                  onClick={saveVoiceSettings}
                  disabled={!selectedVoiceId}
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  この音声を使用する
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                作成済みの音声がありません。下記で新しい音声を作成してください。
              </p>
            )}
          </div>

          {/* 新しい音声作成 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">新しい音声を作成</h2>
            
            {/* 音声名・説明 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">音声名 *</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="例: マイボイス、仕事用音声など"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">説明（オプション）</label>
                <textarea
                  value={voiceDescription}
                  onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder="この音声についての説明を入力してください"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>
            </div>

            {/* 音声サンプルアップロード */}
            <VoiceUpload
              onVoiceSamplesUpload={handleVoiceSamplesUpload}
              currentSamples={voiceSamples}
              maxSamples={5}
            />

            {/* 作成ボタン */}
            <button
              onClick={createCustomVoice}
              disabled={isCreatingVoice || !voiceName.trim() || voiceSamples.length < 2}
              className="w-full mt-6 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isCreatingVoice ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  音声を作成中...（2-3分かかります）
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  音声を作成
                </>
              )}
            </button>
          </div>

          {/* ElevenLabs APIキー設定の注意書き */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 設定が必要</h4>
            <p className="text-sm text-yellow-700">
              カスタム音声機能を使用するには、ElevenLabs APIキーが必要です。
              <br />
              .env.localファイルに「ELEVENLABS_API_KEY」を設定してください。
              <br />
              APIキーは <a href="https://elevenlabs.io/" target="_blank" className="underline">https://elevenlabs.io/</a> で取得できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}