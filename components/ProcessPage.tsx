'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { R2 } from '@/lib/config'

interface ProcessPageProps {
  operation: 'background' | 'watermark' | 'upscale' | 'compliance'
  userId: string
  remainingPoints: number
}

type OperationType = ProcessPageProps['operation']

const getOperationLabel = (operation: OperationType) => {
  switch (operation) {
    case 'background': return 'AI White Background'
    case 'watermark': return 'Remove Watermark / Text / Logo'
    case 'upscale': return 'AI Upscale & Enhance'
    case 'compliance': return 'Amazon Compliance Check'
  }
}

export default function ProcessPage({ operation, userId, remainingPoints }: ProcessPageProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [processedUrls, setProcessedUrls] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [watermarkSelection, setWatermarkSelection] = useState<{x: number, y: number, width: number, height: number} | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 10) {
      setError('Maximum 10 files at once')
      return
    }

    // Check points
    if (files.length > remainingPoints) {
      setError(`You only have ${remainingPoints} points left. Please buy more points.`)
      return
    }

    setSelectedFiles(files)
    setError('')
    setProcessedUrls([])
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
  }

  const processImage = async (file: File, index: number): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('operation', operation)
    formData.append('userId', userId)

    if (operation === 'watermark' && watermarkSelection) {
      formData.append('selection', JSON.stringify(watermarkSelection))
    }

    const response = await fetch('/api/process', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Processing failed')
    }

    const data = await response.json()
    return data.processedUrl
  }

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image')
      return
    }

    if (selectedFiles.length > remainingPoints && operation !== 'compliance') {
      setError(`Not enough points. You need ${selectedFiles.length} points but only have ${remainingPoints}.`)
      return
    }

    setProcessing(true)
    setError('')
    setProcessedUrls([])

    try {
      const urls: string[] = []
      for (let i = 0; i < selectedFiles.length; i++) {
        const url = await processImage(selectedFiles[i], i)
        urls.push(url)
      }
      setProcessedUrls(urls)
      
      // Deduct points handled in API, but we can refresh the page to update
      window.setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadAll = () => {
    processedUrls.forEach((url, index) => {
      const a = document.createElement('a')
      a.href = url
      a.download = `processed-${selectedFiles[index].name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {getOperationLabel(operation)}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Images (max 10)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300"
        />
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watermark selection canvas for single image */}
      {operation === 'watermark' && previews.length === 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Draw a box over the watermark/text you want to remove
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg inline-block">
            <img
              ref={imageRef}
              src={previews[0]}
              alt="To process"
              className="max-w-full h-auto rounded"
              onLoad={() => {
                // Canvas setup for selection
                if (canvasRef.current && imageRef.current) {
                  canvasRef.current.width = imageRef.current.naturalWidth
                  canvasRef.current.height = imageRef.current.naturalHeight
                }
              }}
            />
          </div>
          {watermarkSelection && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Selection created. You can adjust by drawing again.
            </p>
          )}
        </div>
      )}

      {/* Process Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleProcess}
          disabled={processing || selectedFiles.length === 0}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Process ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''} (${selectedFiles.length} point${selectedFiles.length !== 1 ? 's' : ''})`}
        </button>
        {operation !== 'compliance' && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {remainingPoints} points remaining
          </span>
        )}
      </div>

      {/* Processed Results */}
      {processedUrls.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Processed Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {processedUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Processed ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <a
                  href={url}
                  download={`processed-${selectedFiles[index].name}`}
                  className="absolute bottom-1 right-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
          {processedUrls.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Download All
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
          Instructions
        </h3>
        {operation === 'background' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Upload your product image, and we will automatically remove the background and replace it with pure white (RGB 255,255,255) that meets Amazon's requirements.
          </p>
        )}
        {operation === 'watermark' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Upload your image, draw a box over the watermark, text, or logo you want to remove, and AI will automatically remove it and repair the background.
          </p>
        )}
        {operation === 'upscale' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Upscale your image by 2x or 4x with AI enhancement to meet Amazon's 1000px minimum requirement for zoom functionality.
          </p>
        )}
        {operation === 'compliance' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Check if your main image meets Amazon's policies. We check for pure background, extra text/watermark, size requirement, and other common violations. Compliance check is free!
          </p>
        )}
      </div>
    </div>
  )
}
