'use client'

import { useState, useRef } from 'react'
import { Upload, Mic, Play, Pause, Trash2, CheckCircle } from 'lucide-react'

interface VoiceUploadProps {
  onVoiceSamplesUpload: (samples: File[]) => void
  currentSamples?: File[]
  maxSamples?: number
}

export default function VoiceUpload({ 
  onVoiceSamplesUpload, 
  currentSamples = [], 
  maxSamples = 5 
}: VoiceUploadProps) {
  const [samples, setSamples] = useState<File[]>(currentSamples)
  const [isRecording, setIsRecording] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') && file.size <= 10 * 1024 * 1024 // 10MB制限
    )

    if (audioFiles.length + samples.length > maxSamples) {
      alert(`音声サンプルは最大${maxSamples}個までです`)
      return
    }

    const newSamples = [...samples, ...audioFiles].slice(0, maxSamples)
    setSamples(newSamples)
    onVoiceSamplesUpload(newSamples)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        
        if (samples.length < maxSamples) {
          const newSamples = [...samples, audioFile]
          setSamples(newSamples)
          onVoiceSamplesUpload(newSamples)
        } else {
          alert(`音声サンプルは最大${maxSamples}個までです`)
        }
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      alert('録音の開始に失敗しました')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = (index: number, file: File) => {
    if (playingIndex === index) {
      // 停止
      audioRefs.current[index]?.pause()
      setPlayingIndex(null)
      return
    }

    // 他の音声を停止
    audioRefs.current.forEach(audio => audio?.pause())
    
    const audio = new Audio(URL.createObjectURL(file))
    audioRefs.current[index] = audio
    
    audio.onended = () => setPlayingIndex(null)
    audio.play()
    setPlayingIndex(index)
  }

  const removeSample = (index: number) => {
    const newSamples = samples.filter((_, i) => i !== index)
    setSamples(newSamples)
    onVoiceSamplesUpload(newSamples)
    
    // 音声を停止
    if (playingIndex === index) {
      audioRefs.current[index]?.pause()
      setPlayingIndex(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">音声サンプル</h3>
        <p className="text-sm text-gray-600 mb-4">
          あなたの声を学習するため、5〜15秒程度の音声サンプルを{maxSamples}個アップロードしてください。
          より良い結果を得るには、異なる文章や感情で録音することをお勧めします。
        </p>
      </div>

      {/* アップロード・録音ボタン */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={samples.length >= maxSamples}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={16} className="mr-2" />
          ファイル選択
        </button>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isRecording && samples.length >= maxSamples}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <Mic size={16} className="mr-2" />
          {isRecording ? '録音停止' : '録音開始'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* サンプル一覧 */}
      <div className="space-y-3">
        {samples.map((sample, index) => (
          <VoiceSampleItem
            key={`${sample.name}-${index}`}
            file={sample}
            index={index}
            isPlaying={playingIndex === index}
            onPlay={() => playAudio(index, sample)}
            onRemove={() => removeSample(index)}
          />
        ))}
      </div>

      {samples.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Mic className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            音声ファイルをアップロードするか、録音してください
          </p>
        </div>
      )}

      {/* プログレス表示 */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>音声サンプル</span>
          <span>{samples.length} / {maxSamples}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(samples.length / maxSamples) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 録音のコツ */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">🎙️ 良い音声サンプルのコツ</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 静かな環境で録音する</li>
          <li>• 自然な話し方で、普段通りの声で話す</li>
          <li>• 1サンプルあたり5〜15秒程度</li>
          <li>• 異なる文章や感情で複数録音する</li>
          <li>• マイクから適切な距離を保つ</li>
        </ul>
      </div>
    </div>
  )
}

// 個別の音声サンプルアイテムコンポーネント
function VoiceSampleItem({ 
  file, 
  index, 
  isPlaying, 
  onPlay, 
  onRemove 
}: {
  file: File
  index: number
  isPlaying: boolean
  onPlay: () => void
  onRemove: () => void
}) {
  const [duration, setDuration] = useState<string>('')

  useState(() => {
    const audio = new Audio(URL.createObjectURL(file))
    audio.onloadedmetadata = () => {
      const dur = Math.round(audio.duration)
      const minutes = Math.floor(dur / 60)
      const seconds = dur % 60
      setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
      <button
        onClick={onPlay}
        className="mr-3 p-2 bg-white border rounded-full hover:bg-gray-100 transition-colors"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-gray-500">
          {formatFileSize(file.size)} {duration && `• ${duration}`}
        </div>
      </div>
      
      <button
        onClick={onRemove}
        className="ml-3 p-2 text-red-500 hover:text-red-700 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}