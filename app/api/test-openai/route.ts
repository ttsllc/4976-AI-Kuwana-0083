import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not found' }, { status: 500 })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: 'OpenAI API Error',
        status: response.status,
        message: errorText
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'OpenAI API Key is valid!' })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to connect to OpenAI API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}