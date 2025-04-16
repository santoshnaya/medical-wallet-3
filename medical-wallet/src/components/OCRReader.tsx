'use client'

import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { Upload, FileText, Loader2 } from 'lucide-react'

const OCRReader = () => {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFile(files[0])
      setLoading(true)
      setProgress(0)
      
      try {
        // Create worker with language specified in constructor
        const worker = await createWorker('eng');
        
        // Recognize text directly
        const { data } = await worker.recognize(files[0]);
        setText(data.text);
        
        await worker.terminate();
      } catch (error) {
        console.error('Error processing image:', error)
        setText('Error processing image. Please try another file.')
      } finally {
        setLoading(false)
        setProgress(100) // Just set to 100% when done
      }
    }
  }

  const resetFile = () => {
    setFile(null)
    setText('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">OCR Reader</h1>
        
        {/* File upload section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-black">Upload an image</h2>
              <p className="text-black mt-1">Supported formats: JPG, PNG, TIFF</p>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Select File</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              
              {file && (
                <button 
                  onClick={resetFile}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-black truncate max-w-md">{file.name}</span>
                <span className="text-sm text-black">({Math.round(file.size / 1024)} KB)</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Progress and result */}
        {loading && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-black mt-2">Processing image... {progress}%</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Extracted text */}
        {text && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Extracted Text</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-black">{text}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OCRReader 