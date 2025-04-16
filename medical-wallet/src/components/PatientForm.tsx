'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { firebaseService, Patient } from '@/lib/firebaseService';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X } from 'lucide-react';

interface PatientFormProps {
  redirectPath?: string;
  showTitle?: boolean;
  className?: string;
  demoUserId?: string | null;
  initialData?: Partial<Patient>;
}

export default function PatientForm({ 
  redirectPath = '/user/dashboard', 
  showTitle = true,
  className = '',
  demoUserId = null,
  initialData
}: PatientFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [savedPatientData, setSavedPatientData] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    gender: initialData?.gender || '',
    bloodType: initialData?.bloodType || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
    allergies: initialData?.allergies || '',
    medications: initialData?.medications || '',
    medicalHistory: initialData?.medicalHistory || '',
    emergencyContact: {
      name: initialData?.emergencyContact?.name || '',
      relationship: initialData?.emergencyContact?.relationship || '',
      phone: initialData?.emergencyContact?.phone || ''
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        age: initialData.age || '',
        gender: initialData.gender || '',
        bloodType: initialData.bloodType || '',
        height: initialData.height || '',
        weight: initialData.weight || '',
        allergies: initialData.allergies || '',
        medications: initialData.medications || '',
        medicalHistory: initialData.medicalHistory || '',
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          relationship: initialData.emergencyContact?.relationship || '',
          phone: initialData.emergencyContact?.phone || ''
        }
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = demoUserId || session?.user?.email;

    if (!userId) {
      toast.error('You must be logged in to save patient data');
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.gender || !formData.bloodType) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      // Create patient data
      const patientData: Patient = {
        userId: userId,
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        bloodType: formData.bloodType,
        height: formData.height || '',
        weight: formData.weight || '',
        allergies: formData.allergies || '',
        medications: formData.medications || '',
        medicalHistory: formData.medicalHistory || '',
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Generate a unique ID for the patient
      const patientId = crypto.randomUUID();
      
      // Save patient data
      await firebaseService.savePatient(patientId, patientData);
      
      // Set the saved data for QR code
      setSavedPatientData({ ...patientData, id: patientId });
      setShowQRCode(true);
      
      toast.success('Patient data saved successfully');
    } catch (error) {
      console.error('Error saving patient data:', error);
      toast.error('Failed to save patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!savedPatientData) return;

    // Find the SVG element
    const svg = document.querySelector('.qr-code-svg');
    if (!svg) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match SVG
    canvas.width = 256;
    canvas.height = 256;

    // Create an image from the SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Draw image on canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to PNG and download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `medical-qr-${savedPatientData.name}.png`;
      link.href = pngUrl;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const closeQRModal = () => {
    setShowQRCode(false);
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  return (
    <>
      <div className={`bg-white shadow sm:rounded-lg ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          {showTitle && (
            <>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Please fill in your medical information below.</p>
              </div>
            </>
          )}
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="age"
                    id="age"
                    required
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                  Blood Type <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="bloodType"
                    name="bloodType"
                    required
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="height"
                    id="height"
                    min="0"
                    max="300"
                    value={formData.height}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    min="0"
                    max="500"
                    value={formData.weight}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                Allergies
              </label>
              <div className="mt-1">
                <textarea
                  id="allergies"
                  name="allergies"
                  rows={3}
                  value={formData.allergies}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-gray-700">
                Current Medications
              </label>
              <div className="mt-1">
                <textarea
                  id="medications"
                  name="medications"
                  rows={3}
                  value={formData.medications}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                Medical History
              </label>
              <div className="mt-1">
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows={3}
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Emergency Contact</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Please provide emergency contact information.</p>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="emergencyContact.name"
                      id="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700">
                    Relationship
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      id="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      id="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={closeQRModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Your Medical Information QR Code
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Scan this QR code to access your medical information. Keep it safe and share only with trusted healthcare providers.
            </p>
            
            <div className="flex justify-center mb-4">
              {savedPatientData && (
                <QRCodeSVG
                  value={JSON.stringify({
                    id: savedPatientData.id,
                    name: savedPatientData.name,
                    age: savedPatientData.age,
                    gender: savedPatientData.gender,
                    bloodType: savedPatientData.bloodType,
                    emergencyContact: savedPatientData.emergencyContact
                  })}
                  size={256}
                  level="H"
                  includeMargin={true}
                  className="qr-code-svg"
                />
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
              <button
                type="button"
                onClick={closeQRModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 