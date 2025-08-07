import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
})

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, useCustomVoice = false, speed = 1.1 } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    let audioBuffer: Buffer

    if (useCustomVoice && voiceId && process.env.ELEVENLABS_API_KEY) {
      // ElevenLabsのカスタム音声を使用
      try {
        const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
          text: text,
          modelId: 'eleven_multilingual_v2',
          voiceSettings: {
            stability: 0.6,
            similarityBoost: 0.8,
            style: 0.3,
            useSpeakerBoost: true,
            // ElevenLabsは直接speedを設定できないため、他の設定で調整
          }
        })

        const reader = audioStream.getReader()
        const chunks = []
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
        }
        
        audioBuffer = Buffer.concat(chunks)
      } catch (elevenLabsError) {
        console.error('ElevenLabs error:', elevenLabsError)
        // フォールバックとしてOpenAI TTSを使用
        const mp3 = await openai.audio.speech.create({
          model: 'tts-1-hd', // より高品質なモデルを使用
          voice: 'alloy',
          input: text,
          speed: Math.min(Math.max(speed, 0.25), 4.0), // 0.25-4.0の範囲で制限
        })
        audioBuffer = Buffer.from(await mp3.arrayBuffer())
      }
    } else {
      // OpenAI TTSを使用
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd', // より高品質なモデルを使用
        voice: 'alloy',
        input: text,
        speed: Math.min(Math.max(speed, 0.25), 4.0), // 0.25-4.0の範囲で制限
      })
      audioBuffer = Buffer.from(await mp3.arrayBuffer())
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return NextResponse.json(
      { error: '音声合成に失敗しました。' },
      { status: 500 }
    )
  }
}