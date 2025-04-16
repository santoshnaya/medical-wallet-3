'use client'

import dynamic from 'next/dynamic'

// Dynamically import OCRReader to ensure it only loads on the client side
const OCRReader = dynamic(
  () => import('../../components/OCRReader'),
  { ssr: false }
)

const OCRReaderPage = () => {
  return <OCRReader />
}

export default OCRReaderPage 