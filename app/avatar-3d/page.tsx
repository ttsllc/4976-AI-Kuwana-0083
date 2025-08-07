'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import Avatar3D from '@/components/Avatar3D'
import Avatar3DCustomizer from '@/components/Avatar3DCustomizer'

interface Avatar3DSettings {
  faceColor: string
  eyeColor: string
  mouthColor: string
  scale: number
  headShape: 'sphere' | 'oval' | 'square'
  emotionSensitivity: number
}

export default function Avatar3DPage() {
  const [settings, setSettings] = useState<Avatar3DSettings>({
    faceColor: '#ffdba4',
    eyeColor: '#1a1a1a',
    mouthColor: '#444444',
    scale: 1.0,
    headShape: 'sphere',
    emotionSensitivity: 1.0
  })
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // 設定を読み込み
  useEffect(() => {
    const saved3DSettings = localStorage.getItem('avatar3DSettings')
    if (saved3DSettings) {
      setSettings(JSON.parse(saved3DSettings))
    }

    const savedAvatar = localStorage.getItem('avatarSettings')
    if (savedAvatar) {
      const avatarData = JSON.parse(savedAvatar)
      setAvatarImage(avatarData.imageUrl)
    }
  }, [])

  // 設定変更ハンドラー
  const handleSettingsChange = (newSettings: Avatar3DSettings) => {
    setSettings(newSettings)
    setIsSaved(false)
  }

  // 設定保存
  const saveSettings = () => {
    localStorage.setItem('avatar3DSettings', JSON.stringify(settings))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

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
              3Dアバター設定
            </h1>
          </div>
          
          <button
            onClick={saveSettings}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              isSaved
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Save size={16} className="mr-2" />
            {isSaved ? '保存済み' : '設定を保存'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* プレビューエリア */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">プレビュー</h2>
              <div className="flex justify-center mb-6">
                <Avatar3D
                  imageUrl={avatarImage || undefined}
                  isPlaying={false}
                  isSpeaking={false}
                  emotion="happy"
                  size={400}
                  expressions={{
                    eyeBlinkLeft: 0,
                    eyeBlinkRight: 0,
                    mouthOpen: 0.2,
                    mouthSmile: 0.5,
                    eyebrowUp: 0.3,
                    cheekPuff: 0
                  }}
                  settings={settings}
                />
              </div>
              
              {/* 表情テスト */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">表情テスト</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: '普通', emotion: 'neutral', expressions: { eyeBlinkLeft: 0, eyeBlinkRight: 0, mouthOpen: 0, mouthSmile: 0, eyebrowUp: 0, cheekPuff: 0 }},
                    { name: '嬉しい', emotion: 'happy', expressions: { eyeBlinkLeft: 0.3, eyeBlinkRight: 0.3, mouthOpen: 0.2, mouthSmile: 0.8, eyebrowUp: 0.2, cheekPuff: 0 }},
                    { name: '驚き', emotion: 'surprised', expressions: { eyeBlinkLeft: 0, eyeBlinkRight: 0, mouthOpen: 0.6, mouthSmile: 0, eyebrowUp: 0.9, cheekPuff: 0 }},
                  ].map((test) => (
                    <button
                      key={test.name}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
                      onClick={() => {
                        // プレビューの表情を一時的に変更
                        const avatar3D = document.querySelector('[data-avatar-3d]')
                        if (avatar3D) {
                          // 実際の実装では状態管理が必要
                        }
                      }}
                    >
                      {test.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  💡 <strong>現在の設定:</strong>
                  <br />• 頭の形: {settings.headShape === 'sphere' ? '球体' : settings.headShape === 'oval' ? '楕円' : '角形'}
                  <br />• サイズ: {settings.scale}x
                  <br />• 感情感度: {settings.emotionSensitivity}x
                </p>
              </div>
            </div>
          </div>

          {/* カスタマイザー */}
          <div>
            <Avatar3DCustomizer
              currentSettings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">3Dアバター設定ガイド</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-600 mb-2">🎨 外観カスタマイズ</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 顔、目、口の色を自由に変更できます</li>
                <li>• カラーピッカーまたは16進コードで指定</li>
                <li>• 頭の形状を3種類から選択可能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600 mb-2">⚙️ 動作設定</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• アバターサイズを0.5〜2.0倍で調整</li>
                <li>• 感情表現の感度を細かく設定</li>
                <li>• リアルタイム会話での表情変化に反映</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">🖼️ 画像テクスチャ</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 通常のアバター設定で画像を設定可能</li>
                <li>• 画像がない場合は設定した色が適用されます</li>
                <li>• PNG、JPG、SVG形式に対応</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">🎭 表情機能</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AIの感情分析結果に基づき自動で表情変化</li>
                <li>• 目の瞬き、口の動き、眉毛の上下</li>
                <li>• 感度調整で表情の大きさを制御</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}