import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // APIキーの確認
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not set')
      return NextResponse.json(
        { error: 'ElevenLabs APIキーが設定されていません' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const voiceName = formData.get('name') as string
    const description = formData.get('description') as string
    const audioFiles: File[] = []

    console.log('Voice clone request:', { voiceName, description })

    // 音声ファイルを収集
    for (let i = 0; formData.has(`audio_${i}`); i++) {
      const audioFile = formData.get(`audio_${i}`) as File
      if (audioFile) {
        console.log(`Audio file ${i}:`, { name: audioFile.name, size: audioFile.size, type: audioFile.type })
        audioFiles.push(audioFile)
      }
    }

    if (!voiceName || audioFiles.length === 0) {
      return NextResponse.json(
        { error: '音声名と音声ファイルが必要です' },
        { status: 400 }
      )
    }

    if (audioFiles.length < 2) {
      return NextResponse.json(
        { error: '最低2つの音声ファイルが必要です' },
        { status: 400 }
      )
    }

    console.log('Creating voice with ElevenLabs...')

    // ElevenLabsで声をクローン
    const voice = await elevenlabs.voices.ivc.create({
      name: voiceName,
      description: description || `クローンされた音声: ${voiceName}`,
      files: audioFiles,
      removeBackgroundNoise: true,
    })

    console.log('Voice created successfully:', voice.voiceId)

    return NextResponse.json({
      message: '音声クローンが作成されました',
      voiceId: voice.voiceId,
      voice: {
        id: voice.voiceId,
        name: voiceName,
        description: description
      }
    })
  } catch (error) {
    console.error('Voice clone error:', error)
    
    // エラー内容をより詳しく返す
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return NextResponse.json(
        { error: `音声クローンの作成に失敗しました: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: '音声クローンの作成に失敗しました' },
      { status: 500 }
    )
  }
}

// クローンされた音声一覧を取得
export async function GET() {
  try {
    // APIキーの確認
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not set')
      return NextResponse.json(
        { error: 'ElevenLabs APIキーが設定されていません' },
        { status: 500 }
      )
    }

    console.log('Fetching voices from ElevenLabs...')
    const voices = await elevenlabs.voices.getAll()
    console.log('Voices fetched:', voices.voices?.length || 0)
    
    // カスタム音声のみをフィルター（premadeでないもの）
    const customVoices = voices.voices?.filter((voice: any) => 
      voice.category !== 'premade'
    ) || []

    console.log('Custom voices:', customVoices.length)

    return NextResponse.json({ voices: customVoices })
  } catch (error) {
    console.error('Get voices error:', error)
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return NextResponse.json(
        { error: `音声一覧の取得に失敗しました: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: '音声一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}