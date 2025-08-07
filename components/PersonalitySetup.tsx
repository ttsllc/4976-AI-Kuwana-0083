'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, X, User, MessageCircle, Heart, Lightbulb } from 'lucide-react'

interface PersonalityData {
  name: string
  personality: string
  speakingStyle: string
  interests: string[]
  conversationExamples: string[]
  customPrompt: string
}

interface PersonalitySetupProps {
  onSave?: (data: PersonalityData) => void
}

export default function PersonalitySetup({ onSave }: PersonalitySetupProps) {
  const [formData, setFormData] = useState<PersonalityData>({
    name: '',
    personality: '',
    speakingStyle: '',
    interests: [],
    conversationExamples: [],
    customPrompt: ''
  })
  const [newInterest, setNewInterest] = useState('')
  const [newExample, setNewExample] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 既存設定の読み込み
  useEffect(() => {
    loadPersonality()
  }, [])

  const loadPersonality = async () => {
    try {
      const response = await fetch('/api/personality')
      const data = await response.json()
      
      if (data.personality) {
        setFormData(data.personality)
      }
    } catch (error) {
      console.error('Load personality error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof PersonalityData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }))
  }

  const addExample = () => {
    if (newExample.trim()) {
      setFormData(prev => ({
        ...prev,
        conversationExamples: [...prev.conversationExamples, newExample.trim()]
      }))
      setNewExample('')
    }
  }

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conversationExamples: prev.conversationExamples.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('保存に失敗しました')
      }

      const result = await response.json()
      alert('パーソナリティ設定が保存されました！')
      onSave?.(result.personality)
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  const presetPersonalities = [
    {
      name: '親しい友人',
      personality: 'フレンドリーで気さく、少しおしゃべり好き。相手のことを気にかける優しい性格',
      speakingStyle: 'タメ口で話し、「〜だよ」「〜だね」といった親しみやすい口調',
    },
    {
      name: 'プロフェッショナル',
      personality: '知的で落ち着いている。専門的な知識が豊富で、論理的に物事を考える',
      speakingStyle: '丁寧語で話し、「です・ます」調。簡潔で分かりやすい説明を心がける',
    },
    {
      name: 'エンスージアスト',
      personality: 'エネルギッシュで前向き。新しいことに興味津々で、相手のチャレンジを応援する',
      speakingStyle: '感嘆符を多用し、「すごいね！」「面白そう！」といった表現を使う',
    }
  ]

  const applyPreset = (preset: typeof presetPersonalities[0]) => {
    setFormData(prev => ({
      ...prev,
      ...preset
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 mr-3 text-blue-500" />
        <h2 className="text-2xl font-bold">AIパーソナリティ設定</h2>
      </div>

      {/* プリセット選択 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">クイック設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presetPersonalities.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <h4 className="font-semibold mb-2">{preset.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{preset.personality}</p>
              <p className="text-xs text-gray-500">{preset.speakingStyle}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本情報 */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            <User className="w-4 h-4 mr-2" />
            名前・呼び方
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="例: さくら、助手さん、相棒 など"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 性格 */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            <Heart className="w-4 h-4 mr-2" />
            性格・人格
          </label>
          <textarea
            value={formData.personality}
            onChange={(e) => handleInputChange('personality', e.target.value)}
            placeholder="例: 明るくて前向き、少し天然だけど優しい性格。相手のことをよく気にかけて、一緒に問題を解決したがる。"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* 話し方 */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            <MessageCircle className="w-4 h-4 mr-2" />
            話し方・口調
          </label>
          <textarea
            value={formData.speakingStyle}
            onChange={(e) => handleInputChange('speakingStyle', e.target.value)}
            placeholder="例: フレンドリーなタメ口で話す。「〜だよね」「〜かな？」といった疑問形をよく使う。時々関西弁が混じる。"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* 興味・関心 */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            <Lightbulb className="w-4 h-4 mr-2" />
            興味・関心のあること
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {interest}
                <button
                  onClick={() => removeInterest(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              placeholder="新しい興味を追加"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addInterest}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* 会話例 */}
        <div>
          <label className="block text-sm font-medium mb-2">会話の例</label>
          <div className="space-y-2 mb-3">
            {formData.conversationExamples.map((example, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                  {example}
                </div>
                <button
                  onClick={() => removeExample(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExample()}
              placeholder="会話例を追加（例: おはよう！今日も頑張ろうね〜）"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addExample}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* カスタムプロンプト */}
        <div>
          <label className="block text-sm font-medium mb-2">
            高度な設定（カスタムプロンプト）
          </label>
          <textarea
            value={formData.customPrompt}
            onChange={(e) => handleInputChange('customPrompt', e.target.value)}
            placeholder="より詳細な指示がある場合はここに記入してください。空欄の場合、上記の設定から自動生成されます。"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  )
}