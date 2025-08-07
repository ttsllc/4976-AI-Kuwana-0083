'use client'

import { useState } from 'react'
import { Play, Settings } from 'lucide-react'
import { convertKanjiToReading, optimizeForTTS, addKanjiReading, getKanjiDictionary } from '@/lib/kanjiReading'
import AudioPlayer from './AudioPlayer'

export default function KanjiReadingTest() {
  const [showTester, setShowTester] = useState(false)
  const [testText, setTestText] = useState('桑名は素晴らしい場所です。今日の天気はとても良いですね。')
  const [customKanji, setCustomKanji] = useState('')
  const [customReading, setCustomReading] = useState('')

  const testTexts = [
    '桑名は素晴らしい場所です。',
    '今日の天気はとても良いですね。',
    '先生と学生が勉強しています。',
    '東京から大阪まで新幹線で行きました。',
    '田中さんは会社で仕事をしています。',
    '明日は友達と映画を見に行く予定です。',
    '漢字の読み方が正しく変換されているかテストします。',
  ]

  const addCustomReading = () => {
    if (customKanji && customReading) {
      addKanjiReading(customKanji, customReading)
      setCustomKanji('')
      setCustomReading('')
      alert(`「${customKanji}」→「${customReading}」を辞書に追加しました`)
    }
  }

  if (!showTester) {
    return (
      <button
        onClick={() => setShowTester(true)}
        className="fixed bottom-16 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-green-400 z-50 flex items-center space-x-2"
      >
        <Settings size={16} />
        <span>読み方テスト</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold japanese-text">漢字読み方テスト</h2>
          <button
            onClick={() => setShowTester(false)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ✕
          </button>
        </div>

        {/* テスト用テキスト入力 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            テスト用テキスト:
          </label>
          <div className="flex space-x-2">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm japanese-text"
              rows={3}
              placeholder="ここにテストしたいテキストを入力..."
            />
            <AudioPlayer 
              text={testText}
              autoPlay={false}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <div><strong>原文:</strong> {testText}</div>
            <div><strong>変換後:</strong> {optimizeForTTS(testText)}</div>
          </div>
        </div>

        {/* プリセットテストテキスト */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">プリセットテスト:</h3>
          <div className="grid grid-cols-1 gap-2">
            {testTexts.map((text, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                <button
                  onClick={() => setTestText(text)}
                  className="flex-1 text-left text-sm japanese-text hover:bg-gray-50 p-1 rounded"
                >
                  <div><strong>原:</strong> {text}</div>
                  <div className="text-gray-600 text-xs"><strong>変換:</strong> {optimizeForTTS(text)}</div>
                </button>
                <AudioPlayer 
                  text={text}
                  autoPlay={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* カスタム読み追加 */}
        <div className="mb-4 border-t pt-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">カスタム読み追加:</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customKanji}
              onChange={(e) => setCustomKanji(e.target.value)}
              placeholder="漢字 (例: 桑名)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm japanese-text"
            />
            <span className="flex items-center">→</span>
            <input
              type="text"
              value={customReading}
              onChange={(e) => setCustomReading(e.target.value)}
              placeholder="読み仮名 (例: くわな)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm japanese-text"
            />
            <button
              onClick={addCustomReading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              追加
            </button>
          </div>
        </div>

        {/* 現在の辞書 */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">
            読み方辞書 ({Object.keys(getKanjiDictionary()).length}語):
          </h3>
          <div className="max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded">
            {Object.entries(getKanjiDictionary()).map(([kanji, reading]) => (
              <span key={kanji} className="inline-block mr-3 mb-1">
                <span className="japanese-text">{kanji}</span>→<span className="text-blue-600">{reading}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 使い方 */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <h3 className="font-semibold mb-2">使い方:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>テキストを入力してスピーカーボタンで音声を再生</li>
            <li>「変換後」の読み方が正しいか確認</li>
            <li>間違いがあれば「カスタム読み追加」で修正</li>
            <li>修正した読み方は自動的に保存されます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}