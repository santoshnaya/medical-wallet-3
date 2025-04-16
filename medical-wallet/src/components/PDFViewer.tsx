'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  file: string
  pageNumber: number
  scale: number
  rotation: number
  onLoadSuccess: ({ numPages }: { numPages: number }) => void
}

const PDFViewer = ({ file, pageNumber, scale, rotation, onLoadSuccess }: PDFViewerProps) => {
  const [error, setError] = useState<string | null>(null)

  const handleLoadError = (error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. The file might be corrupted or not a valid PDF.')
  }

  return (
    <div className="pdf-container">
      {error ? (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-red-500 mt-2">Please try a different PDF file.</p>
        </div>
      ) : (
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="flex items-center justify-center h-[600px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            loading={
              <div className="flex items-center justify-center h-[600px] w-[450px]">
                <div className="animate-pulse bg-gray-200 h-[600px] w-[450px] rounded"></div>
              </div>
            }
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="pdf-page"
          />
        </Document>
      )}
    </div>
  )
}

export default PDFViewer 