// 感情分析ライブラリ
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking' | 'confused' | 'excited'

export interface EmotionAnalysis {
  primary: EmotionType
  confidence: number
  secondary?: EmotionType
  intensity: number // 0-1
  facialExpressions: {
    eyeBlinkLeft: number
    eyeBlinkRight: number
    mouthOpen: number
    mouthSmile: number
    eyebrowUp: number
    cheekPuff: number
  }
}

export class AdvancedEmotionAnalyzer {
  private emotionKeywords: Record<EmotionType, string[]> = {
    happy: [
      '嬉しい', '楽しい', '素晴らしい', '最高', 'ありがとう', '良い', 'いい',
      '面白い', '笑', 'www', '😊', '🎉', '素敵', '感謝', '幸せ', 'やったー',
      '成功', '達成', 'おめでとう', 'グッド', 'ナイス', 'すごい'
    ],
    sad: [
      '悲しい', '辛い', '残念', 'がっかり', '落ち込む', '泣', '😢', 
      '失敗', '困った', 'ダメ', '最悪', 'ショック', '涙', 'つらい',
      '寂しい', '孤独', '絶望', '心配', 'やばい'
    ],
    angry: [
      '怒', '腹立つ', 'むかつく', 'イライラ', '許せない', '最悪', 'バカ',
      '😠', '💢', 'ふざけるな', '頭にくる', 'ストレス', 'うざい',
      '理不尽', '不満', '抗議', 'クレーム'
    ],
    surprised: [
      '驚', 'びっくり', 'えっ', '本当', 'マジ', '信じられない', '😮',
      'すごい', 'うわー', 'おお', '予想外', '想像以上', '衝撃',
      'まさか', 'え〜', 'へー', 'わあ'
    ],
    thinking: [
      '考え', '思う', 'う〜ん', 'そうですね', 'どうしよう', '悩', '🤔',
      'もしかして', 'なぜ', 'なんで', '理由', '検討', '判断', 'わからない',
      '迷う', '複雑', '難しい', 'やや', 'ちょっと'
    ],
    confused: [
      'わからない', '混乱', '理解できない', '意味不明', '？', '❓',
      'はて', '不明', 'さっぱり', '謎', '疑問', '困惑', 'どういうこと',
      'なんだろう', 'よくわからん'
    ],
    excited: [
      '興奮', 'わくわく', 'ドキドキ', '期待', '楽しみ', '🎊', '✨',
      'すげー', 'やばい', 'テンション', '盛り上がる', 'ハイ',
      'エネルギッシュ', '活気', 'パワー'
    ],
    neutral: ['そうですね', 'はい', 'なるほど', 'そう', 'ふむ']
  }

  private sentencePatterns = {
    question: /[？?]$/,
    exclamation: /[！!]$/,
    uncertainty: /(かも|かな|でしょう|と思う|気がする)/,
    emphasis: /(とても|すごく|めちゃくちゃ|本当に|かなり)/
  }

  analyzeText(text: string): EmotionAnalysis {
    const scores: Record<EmotionType, number> = {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      thinking: 0,
      confused: 0,
      excited: 0
    }

    // キーワードベースの分析
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length
        scores[emotion as EmotionType] += matches
      })
    })

    // 文構造の分析
    if (this.sentencePatterns.question.test(text)) {
      scores.confused += 0.5
      scores.thinking += 0.3
    }

    if (this.sentencePatterns.exclamation.test(text)) {
      scores.excited += 0.5
      scores.surprised += 0.3
    }

    if (this.sentencePatterns.uncertainty.test(text)) {
      scores.thinking += 0.4
    }

    if (this.sentencePatterns.emphasis.test(text)) {
      // 強調語がある場合、他の感情を増幅
      Object.keys(scores).forEach(emotion => {
        if (emotion !== 'neutral' && scores[emotion as EmotionType] > 0) {
          scores[emotion as EmotionType] *= 1.5
        }
      })
    }

    // 文字数による感情の強度調整
    const length = text.length
    if (length > 100) {
      scores.excited += 0.3
    }

    // 最も高いスコアの感情を選択
    let primaryEmotion: EmotionType = 'neutral'
    let maxScore = 0
    let secondaryEmotion: EmotionType | undefined

    const sortedEmotions = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)

    if (sortedEmotions[0][1] > 0) {
      primaryEmotion = sortedEmotions[0][0] as EmotionType
      maxScore = sortedEmotions[0][1]

      if (sortedEmotions[1][1] > 0 && sortedEmotions[1][1] > maxScore * 0.6) {
        secondaryEmotion = sortedEmotions[1][0] as EmotionType
      }
    }

    // 表情パラメータの生成
    const facialExpressions = this.generateFacialExpressions(primaryEmotion, maxScore)

    return {
      primary: primaryEmotion,
      confidence: Math.min(maxScore / 3, 1), // 正規化
      secondary: secondaryEmotion,
      intensity: Math.min(maxScore / 2, 1),
      facialExpressions
    }
  }

  private generateFacialExpressions(emotion: EmotionType, intensity: number) {
    const baseExpressions = {
      eyeBlinkLeft: 0,
      eyeBlinkRight: 0,
      mouthOpen: 0,
      mouthSmile: 0,
      eyebrowUp: 0,
      cheekPuff: 0
    }

    const intensityFactor = Math.min(intensity / 2, 1)

    switch (emotion) {
      case 'happy':
        baseExpressions.mouthSmile = 0.8 * intensityFactor
        baseExpressions.eyeBlinkLeft = 0.3 * intensityFactor
        baseExpressions.eyeBlinkRight = 0.3 * intensityFactor
        break
      
      case 'sad':
        baseExpressions.mouthSmile = -0.5 * intensityFactor
        baseExpressions.eyeBlinkLeft = 0.4 * intensityFactor
        baseExpressions.eyeBlinkRight = 0.4 * intensityFactor
        break
      
      case 'surprised':
        baseExpressions.eyebrowUp = 0.9 * intensityFactor
        baseExpressions.mouthOpen = 0.6 * intensityFactor
        break
      
      case 'angry':
        baseExpressions.eyebrowUp = -0.4 * intensityFactor
        baseExpressions.mouthSmile = -0.3 * intensityFactor
        break
      
      case 'thinking':
        baseExpressions.eyebrowUp = 0.3 * intensityFactor
        baseExpressions.mouthSmile = 0.2 * intensityFactor
        break
      
      case 'excited':
        baseExpressions.mouthOpen = 0.5 * intensityFactor
        baseExpressions.mouthSmile = 0.6 * intensityFactor
        baseExpressions.eyebrowUp = 0.4 * intensityFactor
        break
      
      case 'confused':
        baseExpressions.eyebrowUp = 0.5 * intensityFactor
        baseExpressions.mouthSmile = -0.2 * intensityFactor
        break
    }

    return baseExpressions
  }

  // リアルタイム感情分析（音声の感情も考慮）
  analyzeVoiceEmotion(audioData: Float32Array): EmotionType {
    // 音声の周波数分析による感情推定（簡易版）
    let avgFreq = 0
    let maxAmplitude = 0
    
    for (let i = 0; i < audioData.length; i++) {
      const amplitude = Math.abs(audioData[i])
      maxAmplitude = Math.max(maxAmplitude, amplitude)
      avgFreq += amplitude * i
    }
    
    avgFreq /= audioData.length

    // 簡易的な判定ロジック
    if (maxAmplitude > 0.8) {
      return avgFreq > 1000 ? 'excited' : 'angry'
    } else if (maxAmplitude < 0.2) {
      return 'sad'
    } else if (avgFreq > 800) {
      return 'happy'
    } else {
      return 'neutral'
    }
  }
}

// シングルトンインスタンス
export const emotionAnalyzer = new AdvancedEmotionAnalyzer()