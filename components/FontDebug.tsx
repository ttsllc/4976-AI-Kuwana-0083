'use client'

import { useState } from 'react'

export default function FontDebug() {
  const [showDebug, setShowDebug] = useState(false)

  const testTexts = [
    "こんにちは", // ひらがな
    "カタカナ", // カタカナ
    "漢字テスト", // 漢字
    "桑名くわな", // 桑名の漢字とひらがな
    "日本語フォント確認", // 複雑な漢字
    "Hello World", // 英語
    "123456789", // 数字
  ]

  const fontStacks = [
    { name: "デフォルト", style: {} },
    { name: "japanese-text", style: { fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic Medium', 'Yu Gothic', 'Meiryo', 'MS Gothic', sans-serif" } },
    { name: "force-japanese", style: { fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic Medium', 'Yu Gothic', 'Meiryo', 'MS Gothic', monospace", fontWeight: "500" } },
    { name: "Noto Sans JP", style: { fontFamily: "'Noto Sans JP', sans-serif" } },
    { name: "Hiragino Sans", style: { fontFamily: "'Hiragino Sans', sans-serif" } },
    { name: "Yu Gothic", style: { fontFamily: "'Yu Gothic', sans-serif" } },
    { name: "Meiryo", style: { fontFamily: "'Meiryo', sans-serif" } },
    { name: "MS Gothic", style: { fontFamily: "'MS Gothic', monospace" } },
  ]

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-yellow-400 z-50"
      >
        フォントデバッグ
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold japanese-text">フォントテスト</h2>
          <button
            onClick={() => setShowDebug(false)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {fontStacks.map((font, fontIndex) => (
            <div key={fontIndex} className="border-b pb-4">
              <h3 className="font-semibold mb-2 text-sm text-gray-600">
                {font.name}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {testTexts.map((text, textIndex) => (
                  <div
                    key={textIndex}
                    style={font.style}
                    className="p-2 border rounded text-lg"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <h3 className="font-semibold mb-2">使用方法:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>各フォントで文字が正しく表示されているか確認</li>
            <li>漢字が四角（□）や「?」で表示される場合はフォントが読み込まれていない</li>
            <li>最初の「japanese-text」が推奨設定です</li>
            <li>ブラウザの開発者ツールでもフォント情報を確認できます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}