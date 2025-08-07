import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const PERSONALITY_DIR = path.join(process.cwd(), 'data', 'personality')

// パーソナリティデータの型定義
interface PersonalityData {
  name: string
  personality: string
  speakingStyle: string
  interests: string[]
  conversationExamples: string[]
  customPrompt: string
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    const filePath = path.join(PERSONALITY_DIR, 'settings.json')
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ personality: null })
    }

    const data = await readFile(filePath, 'utf-8')
    const personality = JSON.parse(data)
    
    return NextResponse.json({ personality })
  } catch (error) {
    console.error('Personality load error:', error)
    return NextResponse.json({ personality: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const personalityData: PersonalityData = await request.json()

    // ディレクトリ作成
    if (!existsSync(PERSONALITY_DIR)) {
      await mkdir(PERSONALITY_DIR, { recursive: true })
    }

    // タイムスタンプ更新
    personalityData.updatedAt = new Date().toISOString()
    if (!personalityData.createdAt) {
      personalityData.createdAt = personalityData.updatedAt
    }

    // ファイル保存
    const filePath = path.join(PERSONALITY_DIR, 'settings.json')
    await writeFile(filePath, JSON.stringify(personalityData, null, 2))

    return NextResponse.json({ 
      message: 'パーソナリティ設定が保存されました',
      personality: personalityData 
    })
  } catch (error) {
    console.error('Personality save error:', error)
    return NextResponse.json(
      { error: 'パーソナリティ設定の保存に失敗しました' },
      { status: 500 }
    )
  }
}