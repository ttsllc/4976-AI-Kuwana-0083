'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PersonalitySetup from '@/components/PersonalitySetup'
import { useRouter } from 'next/navigation'

export default function PersonalityPage() {
  const router = useRouter()

  const handleSave = () => {
    // 保存完了後にメインページに戻る
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} className="mr-2" />
            チャットに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">パーソナリティ設定</h1>
          <div className="w-20"></div>
        </div>

        {/* 説明 */}
        <div className="mb-8 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            あなた専用のAIアシスタントを作成しましょう。性格、話し方、興味などを設定することで、
            よりパーソナライズされた会話が可能になります。
          </p>
        </div>

        {/* パーソナリティ設定コンポーネント */}
        <PersonalitySetup onSave={handleSave} />
      </div>
    </div>
  )
}