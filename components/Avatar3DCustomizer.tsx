'use client'

import { useState } from 'react'
import { Palette, Camera, RotateCcw } from 'lucide-react'

interface Avatar3DSettings {
  faceColor: string
  eyeColor: string
  mouthColor: string
  scale: number
  headShape: 'sphere' | 'oval' | 'square'
  emotionSensitivity: number
  textureScale?: number
  textureOffsetX?: number
  textureOffsetY?: number
  textureRotation?: number
  textureFlipVertical?: boolean
  textureFlipHorizontal?: boolean
  sphereOpacity?: number
  textureOpacity?: number
}

interface Avatar3DCustomizerProps {
  onSettingsChange: (settings: Avatar3DSettings) => void
  currentSettings: Avatar3DSettings
}

export default function Avatar3DCustomizer({ onSettingsChange, currentSettings }: Avatar3DCustomizerProps) {
  const [settings, setSettings] = useState<Avatar3DSettings>(currentSettings)

  const updateSettings = (newSettings: Partial<Avatar3DSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    onSettingsChange(updated)
  }

  const resetToDefaults = () => {
    const defaults: Avatar3DSettings = {
      faceColor: '#ffdba4',
      eyeColor: '#1a1a1a',
      mouthColor: '#444444',
      scale: 1.0,
      headShape: 'sphere',
      emotionSensitivity: 1.0,
      textureScale: 0.9,
      textureOffsetX: 0,
      textureOffsetY: 0,
      textureRotation: 0,
      textureFlipVertical: false,
      textureFlipHorizontal: false,
      sphereOpacity: 1.0,
      textureOpacity: 0.9
    }
    setSettings(defaults)
    onSettingsChange(defaults)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Palette className="mr-2" size={20} />
        3Dアバターカスタマイズ
      </h3>

      <div className="space-y-6">
        {/* 顔の色設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            顔の色
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.faceColor}
              onChange={(e) => updateSettings({ faceColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.faceColor}
              onChange={(e) => updateSettings({ faceColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#ffdba4"
            />
          </div>
        </div>

        {/* 目の色設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目の色
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.eyeColor}
              onChange={(e) => updateSettings({ eyeColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.eyeColor}
              onChange={(e) => updateSettings({ eyeColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#1a1a1a"
            />
          </div>
        </div>

        {/* 口の色設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            口の色
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.mouthColor}
              onChange={(e) => updateSettings({ mouthColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.mouthColor}
              onChange={(e) => updateSettings({ mouthColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#444444"
            />
          </div>
        </div>

        {/* サイズ調整 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            アバターサイズ: {settings.scale.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.scale}
            onChange={(e) => updateSettings({ scale: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 頭の形状 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            頭の形状
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['sphere', 'oval', 'square'].map((shape) => (
              <button
                key={shape}
                onClick={() => updateSettings({ headShape: shape as any })}
                className={`px-3 py-2 rounded border text-sm ${
                  settings.headShape === shape
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {shape === 'sphere' && '球体'}
                {shape === 'oval' && '楕円'}
                {shape === 'square' && '角形'}
              </button>
            ))}
          </div>
        </div>

        {/* 感情表現の感度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            感情表現の感度: {settings.emotionSensitivity.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={settings.emotionSensitivity}
            onChange={(e) => updateSettings({ emotionSensitivity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>控えめ</span>
            <span>標準</span>
            <span>大げさ</span>
          </div>
        </div>

        {/* 透明度調整 */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">
            透明度・強度調整
          </h4>
          
          {/* 球体の透明度 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              球体の透明度: {((settings.sphereOpacity || 1.0) * 100).toFixed(0)}%
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.sphereOpacity || 1.0}
                onChange={(e) => updateSettings({ sphereOpacity: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="100"
                step="5"
                value={((settings.sphereOpacity || 1.0) * 100).toFixed(0)}
                onChange={(e) => updateSettings({ sphereOpacity: parseFloat(e.target.value) / 100 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>透明</span>
              <span>半透明</span>
              <span>不透明</span>
            </div>
          </div>

          {/* 写真の透明度 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真の透明度: {((settings.textureOpacity || 0.9) * 100).toFixed(0)}%
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.textureOpacity || 0.9}
                onChange={(e) => updateSettings({ textureOpacity: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="100"
                step="5"
                value={((settings.textureOpacity || 0.9) * 100).toFixed(0)}
                onChange={(e) => updateSettings({ textureOpacity: parseFloat(e.target.value) / 100 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>透明</span>
              <span>半透明</span>
              <span>不透明</span>
            </div>
          </div>

          {/* 透明度プリセット */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              透明度プリセット
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: '透明', sphere: 0.3, texture: 0.3 },
                { name: '薄い', sphere: 0.6, texture: 0.6 },
                { name: '標準', sphere: 1.0, texture: 0.9 },
                { name: '濃い', sphere: 1.0, texture: 1.0 }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateSettings({ 
                    sphereOpacity: preset.sphere,
                    textureOpacity: preset.texture
                  })}
                  className="px-2 py-1 text-xs rounded border bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 顔写真の位置調整 */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
            <Camera className="mr-2" size={16} />
            顔写真の位置調整
          </h4>
          
          {/* テクスチャスケール */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真のサイズ: {((settings.textureScale || 0.9) * 100).toFixed(0)}%
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={settings.textureScale || 0.9}
                onChange={(e) => updateSettings({ textureScale: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="300"
                step="5"
                value={((settings.textureScale || 0.9) * 100).toFixed(0)}
                onChange={(e) => updateSettings({ textureScale: parseFloat(e.target.value) / 100 })}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>極小</span>
              <span>標準</span>
              <span>超特大</span>
            </div>
            
            {/* サイズプリセット */}
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { name: '極小', value: 0.2 },
                { name: '小', value: 0.5 },
                { name: '標準', value: 0.9 },
                { name: '大', value: 1.2 },
                { name: '特大', value: 1.8 },
                { name: '超特大', value: 2.5 }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateSettings({ textureScale: preset.value })}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    Math.abs((settings.textureScale || 0.9) - preset.value) < 0.1
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* X座標調整 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              左右の位置: {((settings.textureOffsetX || 0) * 100).toFixed(0)}%
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.02"
                value={settings.textureOffsetX || 0}
                onChange={(e) => updateSettings({ textureOffsetX: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="-80"
                max="80"
                step="2"
                value={((settings.textureOffsetX || 0) * 100).toFixed(0)}
                onChange={(e) => updateSettings({ textureOffsetX: parseFloat(e.target.value) / 100 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>左端</span>
              <span>中央</span>
              <span>右端</span>
            </div>
          </div>

          {/* Y座標調整 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上下の位置: {((settings.textureOffsetY || 0) * 100).toFixed(0)}%
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.02"
                value={settings.textureOffsetY || 0}
                onChange={(e) => updateSettings({ textureOffsetY: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="-80"
                max="80"
                step="2"
                value={((settings.textureOffsetY || 0) * 100).toFixed(0)}
                onChange={(e) => updateSettings({ textureOffsetY: parseFloat(e.target.value) / 100 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>上端</span>
              <span>中央</span>
              <span>下端</span>
            </div>
          </div>

          {/* 回転調整 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              回転: {(settings.textureRotation || 0).toFixed(0)}°
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              step="5"
              value={settings.textureRotation || 0}
              onChange={(e) => updateSettings({ textureRotation: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>左回り</span>
              <span>0°</span>
              <span>右回り</span>
            </div>
          </div>

          {/* 反転設定 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              写真の反転
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.textureFlipVertical || false}
                  onChange={(e) => updateSettings({ textureFlipVertical: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">上下反転</span>
                <span className="ml-2 text-xs text-gray-500">（写真が逆さまの場合）</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.textureFlipHorizontal || false}
                  onChange={(e) => updateSettings({ textureFlipHorizontal: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">左右反転</span>
                <span className="ml-2 text-xs text-gray-500">（鏡像の場合）</span>
              </label>
            </div>
            
            {/* 自動修正ボタン */}
            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs text-yellow-800 mb-2">
                💡 写真が逆さまになっている場合は「上下反転」をお試しください
              </p>
              <button
                onClick={() => updateSettings({ 
                  textureFlipVertical: !settings.textureFlipVertical,
                  textureOffsetY: 0,
                  textureOffsetX: 0
                })}
                className="text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                上下反転を{settings.textureFlipVertical ? 'オフ' : 'オン'}
              </button>
            </div>
          </div>
        </div>

        {/* プリセット・リセットボタン */}
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            デフォルトに戻す
          </button>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>ヒント:</strong>
            <br />• 色は16進コード（#ffffff）で入力できます
            <br />• 感情表現の感度を上げると、より大きく表情が変化します
            <br />• 透明度調整で球体や写真の濃さを自由に調整可能
            <br />• 写真のサイズは10%〜300%の範囲で調整可能（極小〜超特大）
            <br />• プリセットボタンで一般的な設定に簡単変更
            <br />• 顔写真の位置調整で、-80%〜+80%の範囲で大きく移動可能
            <br />• 数値入力欄で精密な調整ができます
            <br />• 上下反転・左右反転で写真の向きを調整可能
            <br />• 設定は自動的に保存されます
          </p>
        </div>
      </div>
    </div>
  )
}