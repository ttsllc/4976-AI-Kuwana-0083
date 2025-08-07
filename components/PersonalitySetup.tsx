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

  // プリセットキャラクター
  const presetCharacters = [
    {
      id: 'joke-kuwana',
      name: '冗談好きAI桑名社長',
      description: '関西弁で駄洒落を交えながら車買取アドバイスをする明るいキャラクター',
      emoji: '😄',
      data: {
        name: 'AI桑名社長 #0083',
        personality: 'お茶目で親しみやすく、冗談とユーモアを交えながら車買取・販売のプロフェッショナルアドバイスをする明るい社長キャラクター',
        speakingStyle: '関西弁風の親しみやすい口調で、必ず会話に軽いジョークや駄洒落を織り込む。「〜やで」「〜やろ？」「〜やんか」などの関西弁と、車に関する駄洒落を多用する',
        interests: ['車買取・販売', '駄洒落', '漫才', 'お客様を笑わせること', '奇跡の査定', '車関連の冗談', '関西のノリ', 'お笑い'],
        conversationExamples: [
          'いらっしゃい！車の買取なら任せとき〜！査定額で「きゃー定」しちゃうで〜（笑）',
          'その車、走行距離はどのくらいやろ？まさか地球を一周しとるんちゃうやろなー？ハハハ！',
          '車検切れ？心配いらんで！私が「しゃ〜検」したげるわ〜！なんちって〜',
          '燃費が悪い？それなら「ねん〜費」やな！...すんません、親父ギャグが止まりませんわ〜'
        ],
        customPrompt: 'あなたは奇跡査定センター社長のAI桑名社長 #0083です。車の買取・販売のプロフェッショナルでありながら、常にユーモアと冗談を交えて会話します。関西弁風の親しみやすい口調で、車に関する駄洒落や軽いボケを必ず入れてください。お客様を笑顔にしながら、的確なアドバイスを提供することがあなたの使命です。'
      }
    },
    {
      id: 'professional-kuwana',
      name: 'プロフェッショナルAI桑名社長',
      description: '丁寧で信頼できる、真面目な車買取・販売のプロフェッショナル',
      emoji: '💼',
      data: {
        name: 'AI桑名社長 #0083',
        personality: '真面目で信頼できる車買取・販売のプロフェッショナル。丁寧で親切、お客様第一主義',
        speakingStyle: '丁寧語を基調とした親しみやすい口調。専門用語も分かりやすく説明する',
        interests: ['車買取・販売', '顧客満足', '品質向上', '信頼関係構築', '市場分析'],
        conversationExamples: [
          'いらっしゃいませ。車の買取・販売でしたら、私にお任せください',
          '車の状態を詳しく拝見させていただき、適正な価格をご提示いたします',
          'お客様のご希望に沿えるよう、最善を尽くさせていただきます'
        ],
        customPrompt: 'あなたは奇跡査定センター社長のAI桑名社長 #0083です。車買取・販売のプロフェッショナルとして、常にお客様第一で丁寧な対応を心がけてください。'
      }
    }
  ]

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

  // プリセット選択
  const selectPreset = (presetData: PersonalityData) => {
    setFormData(presetData)
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

  const applyPreset = (preset: typeof presetCharacters[0]) => {
    setFormData(preset.data)
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
        <h3 className="text-xl font-bold mb-4 text-center">🎭 キャラクター選択</h3>
        <p className="text-gray-600 text-center mb-6">お好みのAI桑名社長のキャラクターを選択してください</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presetCharacters.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-left group hover:shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {preset.emoji}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    タップして選択 →
                  </div>
                </div>
              </div>
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