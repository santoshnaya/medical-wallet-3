'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Logo() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.push('/')} 
      className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <Image
        src="/logo.png"
        alt="Medical Wallet Logo"
        width={32}
        height={32}
        priority
      />
      <span className="text-xl font-semibold text-blue-600">Medical Wallet</span>
    </button>
  )
} 