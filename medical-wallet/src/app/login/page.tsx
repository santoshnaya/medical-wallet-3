'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'user'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Demo credentials for testing
  const demoCredentials = {
    user: {
      email: 'demo.user@example.com',
      password: 'demo123',
      role: 'user'
    },
    doctor: {
      email: 'demo.doctor@example.com',
      password: 'demo123',
      role: 'doctor'
    },
    admin: {
      email: 'demo.admin@example.com',
      password: 'demo123',
      role: 'admin'
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const result = await loginUser(formData.email, formData.password)
      
      if (result.success && result.role) {
        toast.success(result.message)
        
        // Redirect based on role
        switch (result.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'doctor':
            router.push('/doctor/dashboard')
            break
          case 'user':
            router.push('/user/fields')
            break
          default:
            toast.error('Invalid user role')
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Determine callback URL based on role
      let callbackUrl = '/dashboard' // Default for user
      if (role === 'admin') {
        callbackUrl = '/admin/dashboard'
      } else if (role === 'doctor') {
        // Add doctor dashboard path when available
        callbackUrl = '/doctor/dashboard' // Placeholder
      }

      const result = await signIn('google', { callbackUrl: callbackUrl, redirect: false })

      if (result?.error) {
        setError('Failed to sign in with Google. Please try again.')
        toast.error('Google Sign-in Failed: ' + result.error) // Show toast error
      } else if (result?.url) {
        router.push(result.url) // Redirect on success
        toast.success('Signed in successfully!') // Show toast success
      }
    } catch (err) {
      setError('An unexpected error occurred during sign-in.')
      toast.error('An unexpected error occurred.') // Show toast error
      console.error('Sign-in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.email === demoCredentials[role].email && formData.password === demoCredentials[role].password) {
      // Simulate successful login for demo user
      try {
        // Store demo user info in sessionStorage for dashboard use
        sessionStorage.setItem('isDemoUserLoggedIn', 'true')
        sessionStorage.setItem('demoUserId', formData.email)
        sessionStorage.setItem('demoUserName', 'Demo User') // Store a demo name

        toast.success('Demo login successful!')
        router.push('/dashboard') // Redirect to user dashboard
      } catch (storageError) {
        setError('Failed to initialize demo session. Please try again.')
        toast.error('Demo login failed due to storage issue.')
        console.error("SessionStorage error:", storageError)
        setIsLoading(false)
      }
    } else {
      setError('Invalid demo credentials.')
      toast.error('Invalid demo credentials.')
      setIsLoading(false)
    }
  }

  // Redirect if trying to demo login for admin/doctor roles
  useEffect(() => {
    if (role !== 'user' && (formData.email || formData.password)) {
      // Clear potential demo creds if role changes
      setFormData({
        email: '',
        password: ''
      })
    }
  }, [role, formData.email, formData.password])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {role === 'user' ? (
          // Demo Login Form for User Role
          <form className="mt-8 space-y-6" onSubmit={handleDemoLogin}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address (use demo@example.com)"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password (use password)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Display Demo Credentials */}
            <div className="text-xs text-center text-gray-500">
              <p>Use demo credentials:</p>
              <p>Email: <span className="font-medium">demo.user@example.com</span></p>
              <p>Password: <span className="font-medium">demo123</span></p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in with Demo Credentials'}
              </button>
            </div>
            <div className="text-sm text-center">
              <p className="text-gray-600">Or login as another role:</p>
              <Link href="/login?role=doctor" className="font-medium text-indigo-600 hover:text-indigo-500 mr-2">
                Doctor Login
              </Link>
              |
              <Link href="/login?role=admin" className="font-medium text-indigo-600 hover:text-indigo-500 ml-2">
                Admin Login
              </Link>
            </div>
          </form>
        ) : (
          // Google Sign-in for Admin/Doctor Roles
          <div className="mt-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Image src="/google.svg" alt="Google" width={20} height={20} className="mr-2" />
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            <div className="text-sm text-center mt-4">
              <p className="text-gray-600">Or login as another role:</p>
              <Link href="/login?role=user" className="font-medium text-indigo-600 hover:text-indigo-500 mr-2">
                User Login (Demo)
              </Link>
              |
              <Link href={role === 'admin' ? "/login?role=doctor" : "/login?role=admin"} className="font-medium text-indigo-600 hover:text-indigo-500 ml-2">
                {role === 'admin' ? "Doctor Login" : "Admin Login"}
              </Link>
            </div>
          </div>
        )}

        <div className="text-sm text-center">
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
}