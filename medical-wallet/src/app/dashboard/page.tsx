'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, Settings, UserCircle } from 'lucide-react'
import Image from 'next/image'
import { firebaseService, Patient } from '@/lib/firebaseService'
import PatientForm from '@/components/PatientForm'
import { toast } from 'react-hot-toast'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDemoUser, setIsDemoUser] = useState(false)
  const [demoUserId, setDemoUserId] = useState<string | null>(null)
  const [demoUserName, setDemoUserName] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<Patient | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const demoLoggedIn = sessionStorage.getItem('isDemoUserLoggedIn') === 'true'
    const storedDemoUserId = sessionStorage.getItem('demoUserId')
    const storedDemoUserName = sessionStorage.getItem('demoUserName')

    setIsDemoUser(demoLoggedIn)
    setDemoUserId(storedDemoUserId)
    setDemoUserName(storedDemoUserName)

    if (!demoLoggedIn && status === 'unauthenticated') {
      router.push('/login')
    } else if (demoLoggedIn && storedDemoUserId) {
      const fetchDemoData = async () => {
        setIsLoadingData(true)
        try {
          const patients = await firebaseService.getPatientsByUserId(storedDemoUserId)
          if (patients.length > 0) {
            setPatientData(patients[0])
          } else {
            setPatientData(null)
          }
        } catch (error) {
          console.error('Error fetching demo patient data:', error)
          toast.error('Failed to fetch demo patient data.')
          setPatientData(null)
        } finally {
          setIsLoadingData(false)
        }
      }
      fetchDemoData()
    } else if (status === 'authenticated') {
      setIsLoadingData(false)
    }

  }, [status, router])

  const handleSignOut = async () => {
    if (isDemoUser) {
      sessionStorage.removeItem('isDemoUserLoggedIn')
      sessionStorage.removeItem('demoUserId')
      sessionStorage.removeItem('demoUserName')
      setIsDemoUser(false)
      toast.success('Demo user signed out.')
      router.push('/')
    } else {
      await signOut({ callbackUrl: '/' })
      toast.success('Signed out successfully.')
    }
  }

  if (status === 'loading' || (!isDemoUser && status === 'unauthenticated')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const userName = isDemoUser ? demoUserName : session?.user?.name
  const userImage = isDemoUser ? null : session?.user?.image

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">User Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, {userName || 'User'}</span>
              {userImage ? (
                <Image src={userImage} alt={userName || 'User'} width={32} height={32} className="rounded-full" />
              ) : (
                <UserCircle className="h-8 w-8 text-gray-500" />
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {isDemoUser ? 'Demo Patient Information' : 'Your Patient Information'}
            </h2>
            {isLoadingData ? (
              <p>Loading patient data...</p>
            ) : patientData ? (
              <div className="space-y-3 text-gray-700">
                <p><strong>Name:</strong> {patientData.name}</p>
                <p><strong>Age:</strong> {patientData.age}</p>
                <p><strong>Gender:</strong> {patientData.gender}</p>
                <p><strong>Blood Type:</strong> {patientData.bloodType}</p>
                {patientData.height && <p><strong>Height:</strong> {patientData.height} cm</p>}
                {patientData.weight && <p><strong>Weight:</strong> {patientData.weight} kg</p>}
                {patientData.allergies && <p><strong>Allergies:</strong> {patientData.allergies}</p>}
                {patientData.medications && <p><strong>Medications:</strong> {patientData.medications}</p>}
                {patientData.medicalHistory && <p><strong>Medical History:</strong> {patientData.medicalHistory}</p>}
                {patientData.emergencyContact && (
                  <div>
                    <strong>Emergency Contact:</strong>
                    <ul className="list-disc list-inside ml-4">
                      <li>Name: {patientData.emergencyContact.name}</li>
                      <li>Relationship: {patientData.emergencyContact.relationship}</li>
                      <li>Phone: {patientData.emergencyContact.phone}</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                {isDemoUser
                  ? 'No patient data found for the demo user. Fill out the form below to add data.'
                  : 'No patient data found. Please add your information using the form below.'}
              </p>
            )}
          </div>

          <div className="mt-6">
            <PatientForm 
              redirectPath="/dashboard"
              showTitle={true}
              className="shadow-lg"
              demoUserId={isDemoUser ? demoUserId : undefined}
            />
          </div>
        </div>
      </main>
    </div>
  )
}