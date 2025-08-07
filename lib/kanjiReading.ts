// 音声読み上げ用の漢字読み仮名変換

interface ReadingDictionary {
  [key: string]: string
}

// よく使われる漢字の読み方辞書
const kanjiReadingDict: ReadingDictionary = {
  // 地名
  '桑名': 'くわな',
  '名古屋': 'なごや',
  '大阪': 'おおさか',
  '東京': 'とうきょう',
  '京都': 'きょうと',
  '広島': 'ひろしま',
  '福岡': 'ふくおか',
  '仙台': 'せんだい',
  '札幌': 'さっぽろ',
  
  // 人名でよく使われる漢字
  '田中': 'たなか',
  '佐藤': 'さとう',
  '高橋': 'たかはし',
  '小林': 'こばやし',
  '加藤': 'かとう',
  '山田': 'やまだ',
  '松本': 'まつもと',
  '井上': 'いのうえ',
  
  // 日常よく使う漢字
  '今日': 'きょう',
  '明日': 'あした',
  '昨日': 'きのう',
  '今年': 'ことし',
  '来年': 'らいねん',
  '先生': 'せんせい',
  '学生': 'がくせい',
  '会社': 'かいしゃ',
  '仕事': 'しごと',
  '時間': 'じかん',
  '場所': 'ばしょ',
  '電話': 'でんわ',
  '写真': 'しゃしん',
  '音楽': 'おんがく',
  '映画': 'えいが',
  '料理': 'りょうり',
  '天気': 'てんき',
  '気持': 'きもち',
  '気分': 'きぶん',
  '元気': 'げんき',
  '健康': 'けんこう',
  '安全': 'あんぜん',
  '大切': 'たいせつ',
  '重要': 'じゅうよう',
  '必要': 'ひつよう',
  '便利': 'べんり',
  '簡単': 'かんたん',
  '困難': 'こんなん',
  '問題': 'もんだい',
  '解決': 'かいけつ',
  '成功': 'せいこう',
  '失敗': 'しっぱい',
  '経験': 'けいけん',
  '練習': 'れんしゅう',
  '勉強': 'べんきょう',
  '教育': 'きょういく',
  '技術': 'ぎじゅつ',
  '科学': 'かがく',
  '医学': 'いがく',
  '法律': 'ほうりつ',
  '政治': 'せいじ',
  '経済': 'けいざい',
  '社会': 'しゃかい',
  '文化': 'ぶんか',
  '歴史': 'れきし',
  '将来': 'しょうらい',
  '過去': 'かこ',
  '現在': 'げんざい',
  '最近': 'さいきん',
  '普通': 'ふつう',
  '特別': 'とくべつ',
  '一般': 'いっぱん',
  '全部': 'ぜんぶ',
  '部分': 'ぶぶん',
  '最初': 'さいしょ',
  '最後': 'さいご',
  '途中': 'とちゅう',
  
  // 数字
  '一': 'いち',
  '二': 'に',
  '三': 'さん',
  '四': 'よん',
  '五': 'ご',
  '六': 'ろく',
  '七': 'なな',
  '八': 'はち',
  '九': 'きゅう',
  '十': 'じゅう',
  '百': 'ひゃく',
  '千': 'せん',
  '万': 'まん',
  
  // よく間違われる読み方
  '生': 'せい', // 先生、学生など
  '人': 'じん', // 日本人など（文脈による）
  '上': 'じょう', // 以上など（文脈による）
  '下': 'か', // 以下など（文脈による）
  '中': 'ちゅう', // 中国など（文脈による）
  '外': 'がい', // 海外など（文脈による）
  '前': 'まえ',
  '後': 'あと',
  '左': 'ひだり',
  '右': 'みぎ',
  '東': 'ひがし',
  '西': 'にし',
  '南': 'みなみ',
  '北': 'きた',
}

// 長い語句から短い語句の順にソート（部分一致を避けるため）
const sortedKeys = Object.keys(kanjiReadingDict).sort((a, b) => b.length - a.length)

/**
 * テキストの漢字を読み仮名に変換する
 */
export function convertKanjiToReading(text: string): string {
  let result = text
  
  // 辞書に登録されている語句を順次置換
  for (const kanji of sortedKeys) {
    const reading = kanjiReadingDict[kanji]
    // 全ての出現箇所を置換
    result = result.replace(new RegExp(kanji, 'g'), reading)
  }
  
  return result
}

/**
 * 読み仮名辞書に新しいエントリを追加
 */
export function addKanjiReading(kanji: string, reading: string): void {
  kanjiReadingDict[kanji] = reading
  // ソート済みキーを更新
  sortedKeys.length = 0
  sortedKeys.push(...Object.keys(kanjiReadingDict).sort((a, b) => b.length - a.length))
}

/**
 * 現在の辞書を取得
 */
export function getKanjiDictionary(): ReadingDictionary {
  return { ...kanjiReadingDict }
}

/**
 * 音声読み上げに最適化されたテキストに変換
 */
export function optimizeForTTS(text: string): string {
  let result = convertKanjiToReading(text)
  
  // 音声読み上げの改善（間延びを防ぐため最小限に）
  result = result
    // 不要な句読点後のスペースは追加しない（間延びの原因）
    // .replace(/。/g, '。 ') // ← これを削除
    // .replace(/、/g, '、 ') // ← これを削除
    
    // 感嘆符・疑問符の前後のスペースも削除（間延びの原因）
    // .replace(/！/g, ' ！ ') // ← これを削除
    // .replace(/？/g, ' ？ ') // ← これを削除
    
    // 不要なスペースを完全に削除
    .replace(/\s+/g, '')
    // 改行も削除
    .replace(/\n/g, '')
    // タブも削除
    .replace(/\t/g, '')
    .trim()
  
  return result
}

/**
 * より自然な読み上げのための軽い最適化版
 */
export function optimizeForTTSNatural(text: string): string {
  let result = convertKanjiToReading(text)
  
  // 必要最小限の調整のみ
  result = result
    // 連続するスペースのみ削除
    .replace(/\s+/g, ' ')
    // 前後の空白を削除
    .trim()
  
  return result
}

// 使用例とテスト用の関数
export function testKanjiReading(): void {
  const testTexts = [
    '桑名は素晴らしい場所です。',
    '今日の天気はとても良いですね。',
    '先生と学生が勉強しています。',
    '東京から大阪まで新幹線で行きました。',
  ]
  
  console.log('=== 漢字読み仮名変換テスト ===')
  testTexts.forEach((text, index) => {
    const converted = optimizeForTTS(text)
    console.log(`${index + 1}. 元: ${text}`)
    console.log(`   変換後: ${converted}`)
    console.log('')
  })
}