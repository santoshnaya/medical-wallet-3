'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// This component will initialize PDF.js library
const PDFJSWrapper = () => {
  useEffect(() => {
    // Initialize PDF.js when the component mounts
    const initPDFJS = () => {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        // Set worker source
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${window.pdfjsLib.version}/pdf.worker.min.js`
      }
    }

    // Initialize if PDF.js is already loaded
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      initPDFJS()
    }
  }, [])

  return (
    <>
      {/* Load PDF.js from CDN */}
      <Script 
        src="//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
          }
        }}
      />
    </>
  )
}

export default PDFJSWrapper

// Add this to make TypeScript happy
declare global {
  interface Window {
    pdfjsLib: any
  }
} 