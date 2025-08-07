import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ja', // 日本語を指定
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error('Speech-to-text error:', error)
    return NextResponse.json(
      { error: '音声認識に失敗しました。' },
      { status: 500 }
    )
  }
}