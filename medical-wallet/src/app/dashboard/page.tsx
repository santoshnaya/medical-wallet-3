'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, UserCircle, Loader2, Download } from 'lucide-react'
import Cookies from 'js-cookie'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'

interface PatientForm {
  fullName: string
  age: string
  gender: string
  bloodType: string
  height: string
  weight: string
  bloodPressure: string
  heartRate: string
  allergies: string
  medications: string
  medicalHistory: string
  existingConditions: string
  pastSurgeries: string
  familyMedicalHistory: string
  visitInfo: {
    date: string
    doctor: string
    reason: string
    diagnosis: string
    prescribedTreatment: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrData, setQrData] = useState<string>('')
  const [formData, setFormData] = useState<PatientForm>({
    fullName: '',
    age: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    bloodPressure: '',
    heartRate: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    existingConditions: '',
    pastSurgeries: '',
    familyMedicalHistory: '',
    visitInfo: {
      date: '',
      doctor: '',
      reason: '',
      diagnosis: '',
      prescribedTreatment: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  })

  useEffect(() => {
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true'
    const email = Cookies.get('userEmail')
    
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      setUserEmail(email || null)
    }
  }, [router])

  const handleSignOut = () => {
    Cookies.remove('isAuthenticated')
    Cookies.remove('userRole')
    Cookies.remove('userEmail')
    router.push('/login')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '')
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }))
    } else if (name.startsWith('visit_')) {
      const field = name.replace('visit_', '')
      setFormData(prev => ({
        ...prev,
        visitInfo: {
          ...prev.visitInfo,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const patientsRef = collection(db, 'patients2')
      const docRef = await addDoc(patientsRef, {
        ...formData,
        userEmail,
        createdAt: new Date().toISOString()
      })

      // Generate QR code data
      const qrDataString = JSON.stringify({
        id: docRef.id,
        ...formData,
        userEmail,
        createdAt: new Date().toISOString()
      })
      setQrData(qrDataString)
      setShowQRCode(true)

      toast.success('Patient information saved successfully!')
      // Reset form
      setFormData({
        fullName: '',
        age: '',
        gender: '',
        bloodType: '',
        height: '',
        weight: '',
        bloodPressure: '',
        heartRate: '',
        allergies: '',
        medications: '',
        medicalHistory: '',
        existingConditions: '',
        pastSurgeries: '',
        familyMedicalHistory: '',
        visitInfo: {
          date: '',
          doctor: '',
          reason: '',
          diagnosis: '',
          prescribedTreatment: ''
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      })
    } catch (error) {
      console.error('Error saving patient data:', error)
      toast.error('Failed to save patient information. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `patient-qr-${formData.fullName}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">User Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, {userEmail || 'User'}</span>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Patient Information Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    placeholder="25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    placeholder="170"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    placeholder="70"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🩺 Vitals & Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="120/80"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="72"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Medical History</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Existing Medical Conditions</label>
                    <textarea
                      name="existingConditions"
                      value={formData.existingConditions}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="e.g., Diabetes, Hypertension..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Past Surgeries</label>
                    <textarea
                      name="pastSurgeries"
                      value={formData.pastSurgeries}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="List any past surgeries..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                    <textarea
                      name="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="List current medications..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Family Medical History</label>
                    <textarea
                      name="familyMedicalHistory"
                      value={formData.familyMedicalHistory}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="Describe family medical history..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="List any allergies..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📆 Appointment or Visit Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Visit</label>
                    <input
                      type="date"
                      name="visit_date"
                      value={formData.visitInfo.date}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor Assigned</label>
                    <input
                      type="text"
                      name="visit_doctor"
                      value={formData.visitInfo.doctor}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="Dr. Smith"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Reason for Visit / Symptoms</label>
                    <textarea
                      name="visit_reason"
                      value={formData.visitInfo.reason}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="Describe symptoms or reason for visit..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                    <textarea
                      name="visit_diagnosis"
                      value={formData.visitInfo.diagnosis}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="Doctor's diagnosis..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Prescribed Treatment / Medication</label>
                    <textarea
                      name="visit_prescribedTreatment"
                      value={formData.visitInfo.prescribedTreatment}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={3}
                      placeholder="List prescribed treatments and medications..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      name="emergency_name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="Emergency contact name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <input
                      type="text"
                      name="emergency_relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="e.g., Parent, Spouse"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      type="tel"
                      name="emergency_phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="Emergency contact phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Information'
                  )}
                </button>
              </div>
            </form>

            {showQRCode && (
              <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient QR Code</h3>
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white border rounded-lg">
                    <QRCode
                      id="qr-code"
                      value={qrData}
                      size={256}
                      level="H"
                      className="mb-4"
                    />
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}