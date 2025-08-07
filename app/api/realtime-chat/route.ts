import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 会話履歴を一時的に保存（実際の実装ではRedisやデータベースを使用）
const conversationHistory = new Map<string, any[]>()

function getCurrentDateInfo(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()]
  const hour = now.getHours()
  const minute = now.getMinutes()
  
  return `現在の日時: ${year}年${month}月${day}日(${dayOfWeek}) ${hour}:${minute.toString().padStart(2, '0')}`
}

async function getWeatherInfo(): Promise<string> {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_BASE_URL || ''}/api/weather`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      return ''
    }
    
    const weatherData = await response.json()
    return `現在の天気情報: ${weatherData.description}`
  } catch (error) {
    console.error('Weather fetch error:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationMode = false, sessionId = 'default' } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 })
    }

    // 会話履歴を取得または初期化
    let history = conversationHistory.get(sessionId) || []
    
    // ユーザーメッセージを追加
    const userMessage = { role: 'user', content: message }
    history.push(userMessage)

    // 履歴が長すぎる場合は古いメッセージを削除（最新10件を保持）
    if (history.length > 20) {
      history = history.slice(-20)
    }

    // 現在の日時と天気情報を取得
    const currentDate = getCurrentDateInfo()
    const weatherInfo = await getWeatherInfo()
    const contextInfo = `${currentDate}\n${weatherInfo ? weatherInfo : ''}`

    // リアルタイム会話用のシステムプロンプト
    const systemPrompt = conversationMode
      ? `あなたは自然な会話ができるAIアシスタントです。以下のルールに従って応答してください：
        1. 簡潔で自然な応答（1-2文程度）
        2. 相手の発言に対して適切な反応を示す
        3. 質問がある場合は積極的に聞き返す
        4. 会話の流れを大切にする
        5. 親しみやすく、フレンドリーな口調
        現在はリアルタイム会話モードです。

        ${contextInfo}
        ※この日付・天気情報を参考にして、現在の時期や天候に応じた適切な会話をしてください。`
      : `あなたは親しみやすく、日本語で会話するAIアシスタントです。自然で親近感のある口調で返答してください。

        ${contextInfo}
        ※この日付・天気情報を参考にして、現在の時期や天候に応じた適切な会話をしてください。`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...history
      ],
      temperature: 0.8,
      max_tokens: conversationMode ? 150 : 500, // リアルタイムモードでは短めに
    })

    const response = completion.choices[0]?.message?.content || "すみません、応答を生成できませんでした。"

    // アシスタントの応答を履歴に追加
    const assistantMessage = { role: 'assistant', content: response }
    history.push(assistantMessage)
    
    // 履歴を保存
    conversationHistory.set(sessionId, history)

    return NextResponse.json({ 
      message: response,
      conversationId: sessionId 
    })
  } catch (error) {
    console.error('リアルタイムチャットエラー:', error)
    return NextResponse.json(
      { error: 'リアルタイムチャット応答の取得に失敗しました' },
      { status: 500 }
    )
  }
}