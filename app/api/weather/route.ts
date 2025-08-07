import { NextRequest, NextResponse } from 'next/server'

interface WeatherResponse {
  location: {
    name: string
    region: string
    country: string
    localtime: string
  }
  current: {
    temp_c: number
    condition: {
      text: string
      icon: string
    }
    humidity: number
    wind_kph: number
    pressure_mb: number
    feels_like: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const city = searchParams.get('city')

    if (!process.env.WEATHER_API_KEY) {
      return NextResponse.json(
        { error: '天気情報APIキーが設定されていません。' },
        { status: 500 }
      )
    }

    let query = ''
    if (lat && lon) {
      query = `${lat},${lon}`
    } else if (city) {
      query = city
    } else {
      // デフォルトで桑名市の天気を取得
      query = '桑名市,三重県,日本'
    }

    const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(query)}&lang=ja&aqi=no`

    const response = await fetch(weatherApiUrl)
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data: WeatherResponse = await response.json()

    // 日本語でフォーマットされた天気情報を作成
    const weatherInfo = {
      location: `${data.location.name}${data.location.region ? ', ' + data.location.region : ''}`,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      feelsLike: data.current.feels_like,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      pressure: data.current.pressure_mb,
      localTime: data.location.localtime,
      description: `${data.location.name}の現在の天気は${data.current.condition.text}で、気温は${data.current.temp_c}度です。体感温度は${data.current.feels_like}度、湿度${data.current.humidity}%、風速${data.current.wind_kph}km/h、気圧${data.current.pressure_mb}hPaとなっています。`
    }

    return NextResponse.json(weatherInfo)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: '天気情報の取得に失敗しました。' },
      { status: 500 }
    )
  }
}