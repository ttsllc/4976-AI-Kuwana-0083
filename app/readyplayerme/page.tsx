'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Save } from 'lucide-react'
import ReadyPlayerMeAvatar from '@/components/ReadyPlayerMeAvatar'

export default function ReadyPlayerMePage() {
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // 保存されたURL読み込み
  useEffect(() => {
    const saved = localStorage.getItem('readyPlayerMeUrl')
    if (saved) {
      const url = JSON.parse(saved)
      setAvatarUrl(url || '')
    }
  }, [])

  // アバター保存
  const saveAvatar = () => {
    if (avatarUrl) {
      localStorage.setItem('readyPlayerMeUrl', JSON.stringify(avatarUrl))
      localStorage.setItem('useReadyPlayerMe', JSON.stringify(true))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  // iframe からのメッセージ受信
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const json = parse(event)
      if (json?.type === 'v1.avatar.exported') {
        console.log('Avatar created:', json.data.url)
        setAvatarUrl(json.data.url)
        setIsPreviewMode(true)
      }
    }

    const parse = (event: MessageEvent) => {
      try {
        return JSON.parse(event.data)
      } catch (error) {
        return null
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              ReadyPlayerMe アバター作成
            </h1>
          </div>
          
          {avatarUrl && (
            <button
              onClick={saveAvatar}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <Save size={16} className="mr-2" />
              {isSaved ? '保存済み' : 'アバターを保存'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* アバター作成エリア */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-purple-600 text-white">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">🎨</span>
                アバター作成
              </h2>
              <p className="text-sm mt-1 opacity-90">
                カメラまたは写真を使って3Dアバターを作成できます
              </p>
            </div>
            
            {!isPreviewMode ? (
              <div className="h-[600px]">
                <iframe
                  src="https://demo.readyplayer.me/avatar?frameApi"
                  className="w-full h-full border-0"
                  allow="camera *; microphone *; clipboard-write"
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    <span className="text-lg mr-2">✅</span>
                    アバターが作成されました！
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">アバターURL:</p>
                  <div className="flex">
                    <input
                      type="text"
                      value={avatarUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm bg-white"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(avatarUrl)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-r hover:bg-purple-600 transition-colors"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    新しいアバターを作成
                  </button>
                  <button
                    onClick={saveAvatar}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    このアバターを使用
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* プレビューエリア */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              アバタープレビュー
            </h2>
            
            {avatarUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ReadyPlayerMeAvatar
                    avatarUrl={avatarUrl}
                    isPlaying={false}
                    isSpeaking={false}
                    emotion="happy"
                    size={300}
                  />
                </div>
                
                {/* 表情テスト */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">表情テスト</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: '普通', emotion: 'neutral' as const },
                      { name: '嬉しい', emotion: 'happy' as const },
                      { name: '驚き', emotion: 'surprised' as const },
                      { name: '考え中', emotion: 'thinking' as const },
                      { name: '悲しい', emotion: 'sad' as const },
                      { name: '怒り', emotion: 'angry' as const },
                    ].map((test) => (
                      <button
                        key={test.name}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
                        onClick={() => {
                          // 実際の表情変化はReadyPlayerMeAvatarコンポーネント内で処理
                          console.log(`Testing emotion: ${test.emotion}`)
                        }}
                      >
                        {test.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <p>アバターを作成すると<br />ここにプレビューが表示されます</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">ReadyPlayerMe アバター作成ガイド</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-600 mb-2">📸 アバター作成手順</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. 左側のエディターで「Start from Photo」を選択</li>
                <li>2. カメラまたは写真をアップロード</li>
                <li>3. 自動生成された顔を確認・調整</li>
                <li>4. 髪型、服装、アクセサリーをカスタマイズ</li>
                <li>5. 「Done」をクリックして完了</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600 mb-2">🎮 カスタマイズ機能</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 豊富な髪型とヘアカラー</li>
                <li>• 多様な服装とファッション</li>
                <li>• メガネ、帽子などのアクセサリー</li>
                <li>• 肌の色や顔の形状調整</li>
                <li>• リアルタイム3Dプレビュー</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">💡 使用のヒント</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 明るい場所で正面を向いて撮影</li>
                <li>• 髪で顔が隠れないようにする</li>
                <li>• メガネは後から追加可能</li>
                <li>• 作成後もいつでも編集可能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">🔧 技術仕様</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 高品質3Dメッシュモデル</li>
                <li>• WebGL対応ブラウザで動作</li>
                <li>• GLTFファイル形式で出力</li>
                <li>• リアルタイムアニメーション対応</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}