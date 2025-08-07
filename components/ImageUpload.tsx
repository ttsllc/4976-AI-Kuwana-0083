'use client'

import { useState, useRef } from 'react'
import { Upload, X, User, Camera } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, fileName: string) => void
  currentImage?: string
  title?: string
  description?: string
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  title = "顔写真をアップロード",
  description = "あなたの顔写真をアップロードしてアバターを作成します"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // ファイルタイプの事前チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('JPG、PNG、WebP形式の画像のみアップロード可能です')
      return
    }

    // プレビューの表示
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // ファイルのアップロード
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'アップロードに失敗しました')
      }

      const data = await response.json()
      onImageUpload(data.fileUrl, data.fileName)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'アップロードに失敗しました')
      setPreviewUrl(currentImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {previewUrl ? (
          <div className="relative">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={previewUrl}
                alt="アップロードされた画像"
                fill
                className="object-cover rounded-full border-4 border-white shadow-lg"
              />
            </div>
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              title="画像を削除"
            >
              <X size={16} />
            </button>
            <p className="text-sm text-green-600 font-medium">画像がアップロードされました</p>
          </div>
        ) : (
          <div>
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-gray-600">
                {isUploading ? 'アップロード中...' : 'ここに画像をドロップするか、'}
              </p>
              {!isUploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  ファイルを選択
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>対応形式: JPG, PNG, WebP</p>
        <p>最大ファイルサイズ: 5MB</p>
        <p>最適な画像: 正面向き、明るい場所で撮影された顔写真</p>
      </div>
    </div>
  )
}