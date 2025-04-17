'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { LogOut, UserCircle, Loader2, Download, Upload, X } from 'lucide-react'
import Cookies from 'js-cookie'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import Logo from '@/components/Logo'

interface Document {
  name: string
  url: string
  type: string
  size: number
}

interface PatientForm {
  fullName: string
  age: string
  gender: string
  bloodType: string
  phoneNumber: string
  email: string
  aadharNumber: string
  passportPhoto: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
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
  documents: Document[]
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
  const [isUploading, setIsUploading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrData, setQrData] = useState<string>('')
  const [showHealthCard, setShowHealthCard] = useState(false)
  const [formData, setFormData] = useState<PatientForm>({
    fullName: '',
    age: '',
    gender: '',
    bloodType: '',
    phoneNumber: '',
    email: '',
    aadharNumber: '',
    passportPhoto: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
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
    documents: [],
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
    } else if (name.startsWith('address_')) {
      const field = name.replace('address_', '')
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const storageRef = ref(storage, `patient-documents/${userEmail}/${file.name}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        
        return {
          name: file.name,
          url,
          type: file.type,
          size: file.size
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error(`Failed to upload ${file.name}`)
        return null
      }
    })

    try {
      const uploadedDocs = (await Promise.all(uploadPromises)).filter(Boolean) as Document[]
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs]
      }))
      toast.success('Documents uploaded successfully!')
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error('Failed to upload some documents')
    } finally {
      setIsUploading(false)
    }
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const generatePDF = async (patientData: any) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - (2 * margin)
    
    // Helper function to handle text wrapping
    const addWrappedText = (text: string, y: number, fontSize: number = 12) => {
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line: string) => {
        doc.text(line, margin, y)
        y += 7
      })
      return y
    }
    
    // Add title
    let y = 20
    doc.setFontSize(20)
    doc.text('Patient Medical Record', margin, y)
    y += 20
    
    // Add personal information
    doc.setFontSize(16)
    doc.text('Personal Information', margin, y)
    y += 10
    doc.setFontSize(12)
    y = addWrappedText(`Name: ${patientData.personalInfo.fullName}`, y)
    y = addWrappedText(`Age: ${patientData.personalInfo.age}`, y)
    y = addWrappedText(`Gender: ${patientData.personalInfo.gender}`, y)
    y = addWrappedText(`Blood Type: ${patientData.personalInfo.bloodType}`, y)
    y = addWrappedText(`Phone: ${patientData.personalInfo.phoneNumber}`, y)
    y = addWrappedText(`Email: ${patientData.personalInfo.email}`, y)
    y = addWrappedText(`Aadhar: ${patientData.personalInfo.aadharNumber}`, y)
    y += 10
    
    // Add address
    y = addWrappedText('Address:', y)
    y = addWrappedText(patientData.personalInfo.address.street, y)
    y = addWrappedText(`${patientData.personalInfo.address.city}, ${patientData.personalInfo.address.state}`, y)
    y = addWrappedText(`PIN: ${patientData.personalInfo.address.pincode}`, y)
    y += 10
    
    // Add vitals
    doc.setFontSize(16)
    y = addWrappedText('Vitals & Measurements', y)
    y += 10
    doc.setFontSize(12)
    y = addWrappedText(`Height: ${patientData.vitals.height} cm`, y)
    y = addWrappedText(`Weight: ${patientData.vitals.weight} kg`, y)
    y = addWrappedText(`Blood Pressure: ${patientData.vitals.bloodPressure}`, y)
    y = addWrappedText(`Heart Rate: ${patientData.vitals.heartRate} bpm`, y)
    y += 10
    
    // Add medical history
    doc.setFontSize(16)
    y = addWrappedText('Medical History', y)
    y += 10
    doc.setFontSize(12)
    y = addWrappedText(`Existing Conditions: ${patientData.medicalHistory.existingConditions}`, y)
    y = addWrappedText(`Past Surgeries: ${patientData.medicalHistory.pastSurgeries}`, y)
    y = addWrappedText(`Family History: ${patientData.medicalHistory.familyMedicalHistory}`, y)
    y = addWrappedText(`Allergies: ${patientData.medicalHistory.allergies}`, y)
    y = addWrappedText(`Medications: ${patientData.medicalHistory.medications}`, y)
    y += 10
    
    // Add visit information
    doc.setFontSize(16)
    y = addWrappedText('Visit Information', y)
    y += 10
    doc.setFontSize(12)
    y = addWrappedText(`Date: ${patientData.visitInfo.date}`, y)
    y = addWrappedText(`Doctor: ${patientData.visitInfo.doctor}`, y)
    y = addWrappedText(`Reason: ${patientData.visitInfo.reason}`, y)
    y = addWrappedText(`Diagnosis: ${patientData.visitInfo.diagnosis}`, y)
    y = addWrappedText(`Treatment: ${patientData.visitInfo.prescribedTreatment}`, y)
    y += 10
    
    // Add emergency contact
    doc.setFontSize(16)
    y = addWrappedText('Emergency Contact', y)
    y += 10
    doc.setFontSize(12)
    y = addWrappedText(`Name: ${patientData.emergencyContact.name}`, y)
    y = addWrappedText(`Relationship: ${patientData.emergencyContact.relationship}`, y)
    y = addWrappedText(`Phone: ${patientData.emergencyContact.phone}`, y)
    
    // Save the PDF
    doc.save(`patient-record-${patientData.personalInfo.fullName}.pdf`)
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

  const downloadHealthCard = async () => {
    const cardElement = document.getElementById('health-card');
    if (!cardElement) {
      toast.error('Could not find the health card element');
      return;
    }

    try {
      toast.loading('Generating health card...', { id: 'download' });

      // Wait for QR code to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('health-card');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
          }
        }
      });

      // Create a download link
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `health-card-${formData.fullName || 'patient'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss('download');
      toast.success('Health Card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading health card:', error);
      toast.dismiss('download');
      toast.error('Failed to download health card. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Structure the patient data
      const patientData = {
        personalInfo: {
          fullName: formData.fullName,
          age: formData.age,
          gender: formData.gender,
          bloodType: formData.bloodType,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          aadharNumber: formData.aadharNumber,
          passportPhoto: formData.passportPhoto,
          address: formData.address,
          createdAt: new Date().toISOString()
        },

        // Vitals & Measurements
        vitals: {
          height: formData.height,
          weight: formData.weight,
          bloodPressure: formData.bloodPressure,
          heartRate: formData.heartRate,
          lastUpdated: new Date().toISOString()
        },

        // Medical History
        medicalHistory: {
          existingConditions: formData.existingConditions,
          pastSurgeries: formData.pastSurgeries,
          familyMedicalHistory: formData.familyMedicalHistory,
          allergies: formData.allergies,
          medications: formData.medications
        },

        // Visit Information
        visitInfo: {
          date: formData.visitInfo.date,
          doctor: formData.visitInfo.doctor,
          reason: formData.visitInfo.reason,
          diagnosis: formData.visitInfo.diagnosis,
          prescribedTreatment: formData.visitInfo.prescribedTreatment
        },

        // Emergency Contact
        emergencyContact: {
          name: formData.emergencyContact.name,
          relationship: formData.emergencyContact.relationship,
          phone: formData.emergencyContact.phone
        },

        // Documents
        documents: formData.documents.map(doc => ({
          name: doc.name,
          url: doc.url,
          type: doc.type,
          size: doc.size,
          uploadedAt: new Date().toISOString()
        })),

        // Metadata
        metadata: {
          lastUpdated: new Date().toISOString(),
          createdBy: userEmail,
          status: 'active'
        }
      }

      // Save to Firebase
      const patientsRef = collection(db, 'patients')
      const docRef = await addDoc(patientsRef, patientData)

      // Generate QR code data
      const qrDataString = JSON.stringify({
        id: docRef.id,
        ...patientData
      })
      setQrData(qrDataString)
      setShowQRCode(true)
      setShowHealthCard(true)

      // Generate and download PDF
      await generatePDF(patientData)

      toast.success('Patient information saved successfully! PDF and QR code generated.')
      
      // Reset form
      setFormData({
        fullName: '',
        age: '',
        gender: '',
        bloodType: '',
        phoneNumber: '',
        email: '',
        aadharNumber: '',
        passportPhoto: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: ''
        },
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
        documents: [],
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                    placeholder="+91 1234567890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                    placeholder="patient@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Aadhar Card Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                    placeholder="XXXX XXXX XXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Passport Photo</label>
                  <input
                    type="file"
                    name="passportPhoto"
                    accept="image/*"
                    onChange={handleChange}
                    className="mt-1 block w-full text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                      placeholder="Emergency contact phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📍 Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="address_city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="address_state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                      placeholder="State"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                    <input
                      type="text"
                      name="address_pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-gray-900"
                      placeholder="PIN Code"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📄 Medical Documents</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {isUploading && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-sm text-gray-500">Uploading documents...</span>
                    </div>
                  )}

                  {formData.documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {formData.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white border rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{doc.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </a>
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                )}
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
                    'Save and Download PDF'
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

            {showHealthCard && (
              <div className="mt-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Health Card</h3>
                  
                  {/* Health Card Design */}
                  <div className="flex justify-center">
                    <div 
                      id="health-card" 
                      className="bg-white border-2 border-blue-500 rounded-lg p-6 mb-4" 
                      style={{ 
                        width: '600px', 
                        minHeight: '220px',
                        transform: 'scale(1)', // Ensure proper rendering
                        transformOrigin: 'top left'
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Left: Profile Photo */}
                        <div className="w-32 h-32 flex-shrink-0">
                          {formData.passportPhoto ? (
                            <img
                              src={URL.createObjectURL(formData.passportPhoto)}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-lg"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                              <UserCircle className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Middle: Patient Information */}
                        <div className="flex-grow py-2">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {formData.fullName || 'Name not provided'}
                          </h2>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-600">
                              <span className="font-semibold">Name:</span> {formData.fullName || 'Not provided'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Age:</span> {formData.age ? `${formData.age} years` : 'Not provided'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Phone:</span> {formData.phoneNumber || 'Not provided'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Email:</span> {formData.email || 'Not provided'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Aadhar:</span> {formData.aadharNumber || 'Not provided'}
                            </p>
                          </div>
          </div>

                        {/* Right: QR Code */}
                        <div className="w-32 h-32 flex-shrink-0 bg-white">
                          <QRCode
                            value={qrData || JSON.stringify(formData)}
                            size={128}
                            level="H"
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Card Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={downloadHealthCard}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download Health Card
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