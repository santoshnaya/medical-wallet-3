'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, FileText, Upload, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nationalId: string;
  profilePhoto: string;
  contactInfo: {
    phoneNumber: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  medicalHistory: {
    pastIllnesses: string[];
    surgeries: { name: string; date: string }[];
    allergies: string[];
    chronicDiseases: string[];
    familyMedicalHistory: string;
    smoking: { status: boolean; frequency: string };
    alcohol: { status: boolean; frequency: string };
    disabilities: string[];
    geneticConditions: string[];
  };
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true';
    const userRole = Cookies.get('userRole');
    
    if (!isAuthenticated || userRole !== 'doctor') {
      router.push('/login?role=doctor');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (showCamera && qrReaderRef.current && !scanner) {
      setLoading(true);
      // Create a new scanner
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      // Render the scanner
      qrScanner.render(
        (decodedText) => {
          try {
            const patientData = JSON.parse(decodedText);
            
            // Verify the data structure
            if (!patientData.basicInfo || !patientData.contactInfo || !patientData.medicalHistory) {
              throw new Error('Invalid QR code data');
            }

            // Format the data into Patient interface
            const formattedPatient: Patient = {
              id: patientData.basicInfo.id || '',
              fullName: patientData.basicInfo.fullName,
              dateOfBirth: patientData.basicInfo.dateOfBirth,
              gender: patientData.basicInfo.gender,
              bloodGroup: patientData.basicInfo.bloodGroup,
              maritalStatus: patientData.basicInfo.maritalStatus,
              nationalId: patientData.basicInfo.nationalId,
              profilePhoto: patientData.basicInfo.profilePhoto,
              contactInfo: patientData.contactInfo,
              medicalHistory: patientData.medicalHistory
            };

            setPatient(formattedPatient);
            qrScanner.clear();
            setScanner(null);
            setShowCamera(false);
            toast.success('Patient data retrieved successfully!');
          } catch (error) {
            setError('Failed to read QR code. Please try again.');
            console.error('Error parsing QR code:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setError('Failed to scan QR code. Please try again.');
          console.error('Error scanning QR code:', error);
          setLoading(false);
        }
      );
      
      setScanner(qrScanner);
      setLoading(false);
    }

    return () => {
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
    };
  }, [showCamera]);

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imageUrl = event.target?.result as string;
          
          // Create a temporary image element
          const img = new Image();
          img.src = imageUrl;
          
          img.onload = async () => {
            try {
              // Create a canvas to draw the image
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('Failed to create canvas context');
              
              ctx.drawImage(img, 0, 0);
              
              // Get image data
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              // Scan for QR code
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              
              if (code) {
                try {
                  const patientData = JSON.parse(code.data);
                  
                  // Verify the data structure
                  if (!patientData.basicInfo || !patientData.contactInfo || !patientData.medicalHistory) {
                    throw new Error('Invalid QR code data');
                  }

                  // Format the data into Patient interface
                  const formattedPatient: Patient = {
                    id: patientData.basicInfo.id || '',
                    fullName: patientData.basicInfo.fullName,
                    dateOfBirth: patientData.basicInfo.dateOfBirth,
                    gender: patientData.basicInfo.gender,
                    bloodGroup: patientData.basicInfo.bloodGroup,
                    maritalStatus: patientData.basicInfo.maritalStatus,
                    nationalId: patientData.basicInfo.nationalId,
                    profilePhoto: patientData.basicInfo.profilePhoto,
                    contactInfo: patientData.contactInfo,
                    medicalHistory: patientData.medicalHistory
                  };

                  setPatient(formattedPatient);
                  toast.success('Patient data retrieved successfully!');
                } catch (error) {
                  setError('Failed to read QR code. Please try again.');
                  console.error('Error parsing QR code:', error);
                }
              } else {
                setError('No QR code found in the image. Please try again.');
              }
            } catch (error) {
              setError('Failed to process image. Please try again.');
              console.error('Error processing image:', error);
            } finally {
              setLoading(false);
            }
          };
        } catch (error) {
          setError('Failed to read image. Please try again.');
          console.error('Error reading image:', error);
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Failed to process QR code. Please try again.');
      setLoading(false);
      console.error('Error processing QR code:', error);
    }
  };

  const renderScanOptions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setShowCamera(true)}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
        >
          <QrCode className="h-12 w-12 text-gray-400 mb-2" />
          <span className="text-gray-700">Scan with Camera</span>
        </button>
        
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <span className="text-gray-700">Upload QR Code Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleQRUpload}
            className="hidden"
          />
        </label>
      </div>
      
      {showCamera && (
        <div ref={qrReaderRef} id="qr-reader" className="w-full max-w-md mx-auto"></div>
      )}
    </div>
  );

  const renderPatientInfo = () => {
    if (!patient) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.dateOfBirth}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.bloodGroup}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {`${patient.contactInfo.address.street}, ${patient.contactInfo.address.city}, ${patient.contactInfo.address.state} ${patient.contactInfo.address.zip}`}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.emergencyContact.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.emergencyContact.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.emergencyContact.relationship}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Past Illnesses</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.medicalHistory.pastIllnesses.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.medicalHistory.allergies.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Chronic Diseases</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.medicalHistory.chronicDiseases.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Family Medical History</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.medicalHistory.familyMedicalHistory}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => {
              setPatient(null);
              setShowCamera(false);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Scan New Patient
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <button
            onClick={() => {
              Cookies.remove('isAuthenticated');
              Cookies.remove('userRole');
              router.push('/login?role=doctor');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
              <button
                onClick={() => {
                  setError(null);
                  setShowCamera(false);
                }}
                className="block mx-auto mt-4 text-blue-600 hover:text-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : patient ? (
            renderPatientInfo()
          ) : (
            renderScanOptions()
          )}
        </div>
      </div>
    </div>
  );
}