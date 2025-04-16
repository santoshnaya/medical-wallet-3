'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { 
  Upload, FileText, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, RotateCw, Copy, Download
} from 'lucide-react'

// Dynamically import the react-pdf components to avoid SSR issues
const PDFViewer = dynamic(
  () => import('../../components/PDFViewer'),
  { ssr: false }
);

const PDFReader = () => {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      setIsLoading(true)
      
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(selectedFile)
      setFileUrl(fileUrl)
      
      // Reset to first page and default scale
      setPageNumber(1)
      setScale(1.0)
      setRotation(0)
      setIsLoading(false)
    }
  }

  const resetFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl)
    }
    setFile(null)
    setFileUrl(null)
    setNumPages(0)
    setPageNumber(1)
    setScale(1.0)
    setRotation(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset
      return newPage >= 1 && newPage <= numPages ? newPage : prevPageNumber
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3))
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5))
  const rotate = () => setRotation(prevRotation => (prevRotation + 90) % 360)

  const downloadPdf = () => {
    if (fileUrl) {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = file?.name || 'document.pdf'
      a.click()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">PDF Reader</h1>
        
        {/* File upload section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-black">Upload a PDF document</h2>
              <p className="text-black mt-1">View and navigate through your PDF files</p>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Select PDF</span>
                <input 
                  type="file" 
                  accept=".pdf" 
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
        
        {/* PDF Viewer */}
        {fileUrl && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Controls */}
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-black">
                  Page {pageNumber} of {numPages}
                </span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button 
                    onClick={previousPage} 
                    disabled={pageNumber <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={nextPage} 
                    disabled={pageNumber >= numPages}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={zoomOut}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-black min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
                <button 
                  onClick={zoomIn}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button 
                  onClick={rotate}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Rotate"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
                <button 
                  onClick={downloadPdf}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* PDF Renderer */}
            <div className="flex justify-center bg-gray-100 min-h-[600px] p-4 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <PDFViewer 
                  file={fileUrl}
                  pageNumber={pageNumber}
                  scale={scale}
                  rotation={rotation}
                  onLoadSuccess={onDocumentLoadSuccess}
                />
              )}
            </div>
          </div>
        )}
        
        {!fileUrl && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No PDF file selected</h3>
            <p className="text-black mb-6">Upload a PDF document to view it here</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="h-5 w-5" />
              <span>Select PDF</span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFReader 