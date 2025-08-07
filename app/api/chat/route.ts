import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
})

const PERSONALITY_FILE = path.join(process.cwd(), 'data', 'personality', 'settings.json')

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

async function getPersonalityPrompt(): Promise<string> {
  try {
    const currentDate = getCurrentDateInfo()
    const weatherInfo = await getWeatherInfo()
    
    const contextInfo = `${currentDate}\n${weatherInfo ? weatherInfo : ''}`
    
    if (!existsSync(PERSONALITY_FILE)) {
      return `あなたは親しみやすく、日本語で会話するAIアシスタントです。自然で親近感のある口調で返答してください。\n\n${contextInfo}\n※この日付・天気情報を参考にして、現在の時期や天候に応じた適切な会話をしてください。`
    }

    const data = await readFile(PERSONALITY_FILE, 'utf-8')
    const personality = JSON.parse(data)

    if (personality.customPrompt) {
      return personality.customPrompt
    }

    // パーソナリティデータからプロンプトを生成
    let prompt = `あなたは「${personality.name}」として振る舞ってください。\n\n`
    
    if (personality.personality) {
      prompt += `性格: ${personality.personality}\n`
    }
    
    if (personality.speakingStyle) {
      prompt += `話し方: ${personality.speakingStyle}\n`
    }
    
    if (personality.interests && personality.interests.length > 0) {
      prompt += `興味・関心: ${personality.interests.join(', ')}\n`
    }
    
    if (personality.conversationExamples && personality.conversationExamples.length > 0) {
      prompt += `\n会話例:\n${personality.conversationExamples.join('\n')}\n`
    }
    
    prompt += `\n${contextInfo}\n※この日付・天気情報を参考にして、現在の時期や天候に応じた適切な会話をしてください。\n\n上記の設定に基づいて、自然で一貫性のある会話をしてください。日本語で返答し、相手に親近感を持ってもらえるような口調を心がけてください。`

    return prompt
  } catch (error) {
    console.error('Personality prompt error:', error)
    return "あなたは親しみやすく、日本語で会話するAIアシスタントです。自然で親近感のある口調で返答してください。"
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    const personalityPrompt = await getPersonalityPrompt()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: personalityPrompt
        },
        ...messages
      ],
      temperature: 0.8, // パーソナライズ時は少し創造性を高める
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || "すみません、応答を生成できませんでした。"

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('OpenAI API error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'AIからの応答を取得できませんでした。' },
      { status: 500 }
    )
  }
}