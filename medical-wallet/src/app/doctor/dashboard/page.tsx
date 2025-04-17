'use client';

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, UserCircle, Upload, Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

interface PatientData {
  personalInfo: {
    fullName: string
    age: string
    phoneNumber: string
    email: string
    aadharNumber: string
  }
  vitals: {
    height: string
    weight: string
    bloodPressure: string
    heartRate: string
  }
  medicalHistory: {
    existingConditions: string
    pastSurgeries: string
    familyMedicalHistory: string
    allergies: string
    medications: string
  }
  visitInfo: {
    date: string
    doctor: string
    reason: string
    diagnosis: string
    prescribedTreatment: string
  }
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [scanner, setScanner] = useState<any>(null)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true'
    const email = Cookies.get('userEmail')
    
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      setUserEmail(email || null)
    }
  }, [router])

  useEffect(() => {
    if (!scanner && !patientData) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )

      html5QrcodeScanner.render(onScanSuccess, onScanError)
      setScanner(html5QrcodeScanner)
    }

    return () => {
      if (scanner) {
        scanner.clear()
      }
    }
  }, [scanner, patientData])

  const handleSignOut = () => {
    Cookies.remove('isAuthenticated')
    Cookies.remove('userRole')
    Cookies.remove('userEmail')
    router.push('/login')
  }

  const onScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText)
      setPatientData(data)
      setIsScanning(false)
      if (scanner) {
        scanner.clear()
      }
      toast.success('Patient data retrieved successfully!')
    } catch (error) {
      console.error('Error parsing QR code data:', error)
      toast.error('Invalid QR code format')
    }
  }

  const onScanError = (error: any) => {
    console.warn(`QR code scan error: ${error}`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // You would need to implement QR code reading from image
      // This is a placeholder for the functionality
      toast.error('QR code image upload feature coming soon!')
    } catch (error) {
      console.error('Error reading QR code from image:', error)
      toast.error('Failed to read QR code from image')
    }
  }

  const startNewScan = () => {
    setPatientData(null)
    setIsScanning(true)
    if (scanner) {
      scanner.clear()
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )
    html5QrcodeScanner.render(onScanSuccess, onScanError)
    setScanner(html5QrcodeScanner)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, Dr. {userEmail || 'User'}</span>
              <UserCircle className="h-8 w-8 text-gray-500" />
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Patient QR Scanner</h2>
              <p className="mt-1 text-sm text-gray-500">Scan a patient's QR code or upload a QR code image to view their information.</p>
            </div>

            {!patientData && (
              <div className="space-y-6">
                <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
                
                <div className="flex justify-center">
                  <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span>Upload QR Code</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            )}

            {patientData && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {patientData.personalInfo.fullName}</p>
                        <p><span className="font-medium">Age:</span> {patientData.personalInfo.age}</p>
                        <p><span className="font-medium">Phone:</span> {patientData.personalInfo.phoneNumber}</p>
                        <p><span className="font-medium">Email:</span> {patientData.personalInfo.email}</p>
                        <p><span className="font-medium">Aadhar:</span> {patientData.personalInfo.aadharNumber}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Vitals</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Height:</span> {patientData.vitals.height} cm</p>
                        <p><span className="font-medium">Weight:</span> {patientData.vitals.weight} kg</p>
                        <p><span className="font-medium">Blood Pressure:</span> {patientData.vitals.bloodPressure}</p>
                        <p><span className="font-medium">Heart Rate:</span> {patientData.vitals.heartRate} bpm</p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Medical History</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Existing Conditions:</span> {patientData.medicalHistory.existingConditions}</p>
                        <p><span className="font-medium">Past Surgeries:</span> {patientData.medicalHistory.pastSurgeries}</p>
                        <p><span className="font-medium">Family History:</span> {patientData.medicalHistory.familyMedicalHistory}</p>
                        <p><span className="font-medium">Allergies:</span> {patientData.medicalHistory.allergies}</p>
                        <p><span className="font-medium">Medications:</span> {patientData.medicalHistory.medications}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Last Visit Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Date:</span> {patientData.visitInfo.date}</p>
                        <p><span className="font-medium">Doctor:</span> {patientData.visitInfo.doctor}</p>
                        <p><span className="font-medium">Reason:</span> {patientData.visitInfo.reason}</p>
                        <p><span className="font-medium">Diagnosis:</span> {patientData.visitInfo.diagnosis}</p>
                        <p><span className="font-medium">Treatment:</span> {patientData.visitInfo.prescribedTreatment}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={startNewScan}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Scan New QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 