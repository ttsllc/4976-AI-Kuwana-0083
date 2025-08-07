'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setIsProcessing(true)
        
        // 音声認識処理
        await processAudio(audioBlob)
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      alert('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Speech recognition failed')
      }

      const data = await response.json()
      if (data.text) {
        onTranscript(data.text)
      }
    } catch (error) {
      console.error('Speech recognition error:', error)
      alert('音声認識に失敗しました。もう一度お試しください。')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`px-6 py-3 rounded-lg transition-colors ${
        isRecording
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isProcessing ? (
        <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full" />
      ) : isRecording ? (
        <Square size={20} />
      ) : (
        <Mic size={20} />
      )}
    </button>
  )
}