'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function AvatarPage() {
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleImageUpload = (imageUrl: string, fileName: string) => {
    setAvatarImage(imageUrl)
    setAvatarFileName(fileName)
  }

  const saveAvatarSettings = async () => {
    if (!avatarImage) {
      alert('アバター画像をアップロードしてください')
      return
    }

    setIsSaving(true)
    try {
      // ここでアバター設定をローカルストレージに保存
      // 実際のアプリではデータベースに保存する
      localStorage.setItem('avatarSettings', JSON.stringify({
        imageUrl: avatarImage,
        fileName: avatarFileName,
        createdAt: new Date().toISOString()
      }))

      alert('アバター設定が保存されました！')
      router.push('/')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} className="mr-2" />
            チャットに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">アバター設定</h1>
          <div className="w-20"></div> {/* スペーサー */}
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">あなたのアバターを作成</h2>
            <p className="text-gray-600">
              顔写真をアップロードして、パーソナライズされたAIアバターを作成しましょう
            </p>
          </div>

          {/* 画像アップロード */}
          <ImageUpload
            onImageUpload={handleImageUpload}
            currentImage={avatarImage || undefined}
            title="顔写真のアップロード"
            description="正面を向いた、明るい場所で撮影された写真が最適です"
          />

          {/* アクションボタン */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </Link>
            <button
              onClick={saveAvatarSettings}
              disabled={!avatarImage || isSaving}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  設定を保存
                </>
              )}
            </button>
          </div>
        </div>

        {/* 使い方のヒント */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📸 最適な写真のコツ</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 正面を向いた顔がはっきり写っている写真</li>
            <li>• 明るい場所で撮影された写真</li>
            <li>• 顔が隠れていない（帽子、サングラスなし）</li>
            <li>• 背景がシンプルな写真</li>
          </ul>
        </div>
      </div>
    </div>
  )
}