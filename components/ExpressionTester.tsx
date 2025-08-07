'use client'

import { useState } from 'react'
import TalkingPortrait from './TalkingPortrait'

interface ExpressionTesterProps {
  imageUrl?: string
  size?: number
}

export default function ExpressionTester({ imageUrl, size = 300 }: ExpressionTesterProps) {
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'happy' | 'surprised' | 'thinking' | 'sad' | 'angry'>('neutral')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [testText, setTestText] = useState('')

  const emotions = [
    { key: 'neutral', name: '😐 普通', color: 'gray' },
    { key: 'happy', name: '😊 嬉しい', color: 'green' },
    { key: 'surprised', name: '😮 驚き', color: 'blue' },
    { key: 'thinking', name: '🤔 考え中', color: 'purple' },
    { key: 'sad', name: '😢 悲しい', color: 'blue' },
    { key: 'angry', name: '😠 怒り', color: 'red' }
  ] as const

  const testMessages = [
    { emotion: 'happy', text: '今日はとても良い天気ですね！お出かけしたくなります。' },
    { emotion: 'surprised', text: 'え！そんなことが起きたんですか？信じられません！' },
    { emotion: 'sad', text: '残念ながら、今日は雨が降ってしまいました...' },
    { emotion: 'angry', text: 'それは本当に困りますね。なぜそんなことが起きるのでしょうか。' },
    { emotion: 'thinking', text: 'うーん、それについてはよく考える必要がありますね。' },
    { emotion: 'neutral', text: 'こんにちは。今日はいかがお過ごしですか。' }
  ]

  const startSpeakingTest = (emotion: typeof currentEmotion, text: string) => {
    setCurrentEmotion(emotion)
    setTestText(text)
    setIsSpeaking(true)
    
    // 3秒後に停止
    setTimeout(() => {
      setIsSpeaking(false)
      setTestText('')
    }, 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 japanese-text">表情テスト</h3>
      
      {/* プレビュー */}
      <div className="flex justify-center mb-6">
        <TalkingPortrait
          imageUrl={imageUrl}
          isSpeaking={isSpeaking}
          emotion={currentEmotion}
          size={size}
        />
      </div>

      {/* 現在の状態表示 */}
      <div className="text-center mb-4 space-y-2">
        <div className={`inline-block px-3 py-1 rounded-full text-white ${
          isSpeaking ? 'bg-green-500' : 'bg-gray-500'
        }`}>
          {isSpeaking ? '話し中' : '待機中'}
        </div>
        <div className="text-sm text-gray-600">
          現在の感情: <span className="font-medium">{emotions.find(e => e.key === currentEmotion)?.name}</span>
        </div>
      </div>

      {/* 感情ボタン */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {emotions.map((emotion) => (
          <button
            key={emotion.key}
            onClick={() => setCurrentEmotion(emotion.key)}
            disabled={isSpeaking}
            className={`px-3 py-2 rounded-lg transition-colors text-sm ${
              currentEmotion === emotion.key
                ? `bg-${emotion.color}-500 text-white`
                : `bg-${emotion.color}-100 text-${emotion.color}-700 hover:bg-${emotion.color}-200`
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {emotion.name}
          </button>
        ))}
      </div>

      {/* テストメッセージ */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">テストメッセージ:</h4>
        <div className="grid grid-cols-1 gap-2">
          {testMessages.map((test, index) => (
            <button
              key={index}
              onClick={() => startSpeakingTest(test.emotion as typeof currentEmotion, test.text)}
              disabled={isSpeaking}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm text-gray-600 mb-1">
                {emotions.find(e => e.key === test.emotion)?.name}
              </div>
              <div className="text-sm">{test.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 手動テスト */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-gray-700 mb-2">手動テスト:</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsSpeaking(!isSpeaking)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isSpeaking
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSpeaking ? '停止' : '話し始める'}
          </button>
          
          <button
            onClick={() => {
              const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
              setCurrentEmotion(randomEmotion.key)
            }}
            disabled={isSpeaking}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ランダム表情
          </button>
        </div>
      </div>

      {/* 説明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 表情変化の仕組み:</strong>
          <br />• 各感情に応じて目・口・頬の形状や位置が変化
          <br />• 話している時は追加のアニメーション効果
          <br />• 色調フィルターで雰囲気も変化
          <br />• リアルタイムでスムーズにアニメーション
        </p>
      </div>
    </div>
  )
}