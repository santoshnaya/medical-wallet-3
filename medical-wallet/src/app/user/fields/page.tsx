'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { firebaseService, Patient } from '@/lib/firebaseService';
import { toast } from 'react-hot-toast';

export default function UserFieldsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

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
    
    if (!session?.user?.email) {
      toast.error('You must be logged in to save patient data');
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
        userId: session.user.email,
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        bloodType: formData.bloodType,
        height: formData.height,
        weight: formData.weight,
        allergies: formData.allergies,
        medications: formData.medications,
        medicalHistory: formData.medicalHistory,
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Generate a unique ID for the patient
      const patientId = crypto.randomUUID();
      
      // Save patient data
      await firebaseService.savePatient(patientId, patientData);
      
      toast.success('Patient data saved successfully');
      router.push('/user/dashboard');
    } catch (error) {
      console.error('Error saving patient data:', error);
      toast.error('Failed to save patient data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Please fill in your medical information below.</p>
            </div>
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
      </div>
    </div>
  );
} 