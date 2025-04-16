'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Stethoscope, UserCog, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'

const DEMO_CREDENTIALS = {
  user: { email: 'user@demo.com', password: 'user123' },
  doctor: { email: 'doctor@demo.com', password: 'doctor123' },
  admin: { email: 'admin@demo.com', password: 'admin123' }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'user'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true'
    if (isAuthenticated) {
      const userRole = Cookies.get('userRole')
      const dashboardPath = userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard'
      router.push(dashboardPath)
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Check credentials based on role
      const credentials = DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS]
      if (email === credentials.email && password === credentials.password) {
        // Set cookies for authentication
        Cookies.set('isAuthenticated', 'true', { expires: 7 })
        Cookies.set('userRole', role, { expires: 7 })
        Cookies.set('userEmail', email, { expires: 7 })
        
        // Redirect based on role
        const dashboardPath = role === 'doctor' ? '/doctor/dashboard' : '/dashboard'
        await router.push(dashboardPath)
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'user':
        return <User className="h-8 w-8" />
      case 'doctor':
        return <Stethoscope className="h-8 w-8" />
      case 'admin':
        return <UserCog className="h-8 w-8" />
      default:
        return <User className="h-8 w-8" />
    }
  }

  const getRoleTitle = () => {
    switch (role) {
      case 'user':
        return 'User Login'
      case 'doctor':
        return 'Doctor Login'
      case 'admin':
        return 'Admin Login'
      default:
        return 'Login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            {getRoleIcon()}
            <h1 className="text-2xl font-bold text-gray-900">{getRoleTitle()}</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder={DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS].email}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder={DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS].password}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>Demo Credentials:</p>
          <p>Email: {DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS].email}</p>
          <p>Password: {DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS].password}</p>
        </div>
      </motion.div>
    </div>
  )
} 