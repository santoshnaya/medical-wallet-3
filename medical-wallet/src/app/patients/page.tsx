'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Plus, X } from 'lucide-react';
import { loadCSVData } from '@/lib/dataService';
import { Patient } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PatientCard from '@/components/PatientCard';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  medicalCondition: string;
  dateOfAdmission: string;
  doctor: string;
  hospital: string;
  insuranceProvider: string;
  billingAmount: number;
  roomNumber: string;
  admissionType: string;
  dischargeDate: string;
  medication: string;
  testResults: string;
  photo: string;
  documents: string[];
  allergies: string[];
  chronicConditions: string[];
  familyHistory: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
  };
  labResults: {
    hemoglobin: number;
    wbc: number;
    rbc: number;
    platelets: number;
  };
  vaccinations: string[];
  lastCheckup: string;
  nextAppointment: string;
  dietaryRestrictions: string[];
  mobilityStatus: string;
  mentalStatus: string;
  painLevel: number;
  notes: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
      </div>
    </div>
  );
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    bloodType: '',
    medicalCondition: '',
    hospital: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: '',
    bloodType: '',
    medicalCondition: '',
    dateOfAdmission: new Date().toISOString().split('T')[0],
    doctor: '',
    hospital: '',
    insuranceProvider: '',
    billingAmount: 0,
    roomNumber: '',
    admissionType: '',
    dischargeDate: '',
    medication: '',
    testResults: '',
    photo: '',
    documents: [],
    allergies: [],
    chronicConditions: [],
    familyHistory: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    vitalSigns: {
      bloodPressure: '',
      heartRate: 0,
      temperature: 0,
      respiratoryRate: 0
    },
    labResults: {
      hemoglobin: 0,
      wbc: 0,
      rbc: 0,
      platelets: 0
    },
    vaccinations: [],
    lastCheckup: '',
    nextAppointment: '',
    dietaryRestrictions: [],
    mobilityStatus: '',
    mentalStatus: '',
    painLevel: 0,
    notes: ''
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [savedPatient, setSavedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, filters, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      // First try to load from Firestore
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const firestorePatients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];

      if (firestorePatients.length > 0) {
        setPatients(firestorePatients);
        setFilteredPatients(firestorePatients);
      } else {
        // If no data in Firestore, load from CSV
        const data = await loadCSVData();
        setPatients(data);
        setFilteredPatients(data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patient data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.medicalCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.gender) {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }
    if (filters.bloodType) {
      filtered = filtered.filter(patient => patient.bloodType === filters.bloodType);
    }
    if (filters.medicalCondition) {
      filtered = filtered.filter(patient => patient.medicalCondition === filters.medicalCondition);
    }
    if (filters.hospital) {
      filtered = filtered.filter(patient => patient.hospital === filters.hospital);
    }

    setFilteredPatients(filtered);
  };

  const uniqueValues = (key: keyof Patient) => {
    return Array.from(new Set(patients.map(patient => patient[key])));
  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!newPatient.name || !newPatient.age || !newPatient.gender || !newPatient.bloodType) {
        setError('Please fill in all required fields');
        return;
      }

      // Add patient to Firestore
      const docRef = await addDoc(collection(db, 'patients'), {
        ...newPatient,
        dateOfAdmission: new Date(newPatient.dateOfAdmission).toISOString(),
        createdAt: new Date().toISOString()
      });

      // Create patient object with Firestore ID
      const patientWithId = {
        ...newPatient,
        id: docRef.id,
      } as Patient;
      
      // Add new patient at the beginning of the arrays
      setPatients([patientWithId, ...patients]);
      setFilteredPatients([patientWithId, ...filteredPatients]);
      
      // Reset form and close modal
      setIsAddModalOpen(false);
      setNewPatient({
        name: '',
        age: 0,
        gender: '',
        bloodType: '',
        medicalCondition: '',
        dateOfAdmission: new Date().toISOString().split('T')[0],
        doctor: '',
        hospital: '',
        insuranceProvider: '',
        billingAmount: 0,
        roomNumber: '',
        admissionType: '',
        dischargeDate: '',
        medication: '',
        testResults: '',
        photo: '',
        documents: [],
        allergies: [],
        chronicConditions: [],
        familyHistory: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        vitalSigns: {
          bloodPressure: '',
          heartRate: 0,
          temperature: 0,
          respiratoryRate: 0
        },
        labResults: {
          hemoglobin: 0,
          wbc: 0,
          rbc: 0,
          platelets: 0
        },
        vaccinations: [],
        lastCheckup: '',
        nextAppointment: '',
        dietaryRestrictions: [],
        mobilityStatus: '',
        mentalStatus: '',
        painLevel: 0,
        notes: ''
      });

      toast.success('Patient added successfully!');
      setSavedPatient({
        id: docRef.id,
        ...patientWithId
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      setError('Failed to add patient. Please try again.');
      toast.error('Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleDownloadPDF = (patient: Patient) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Patient Medical Record', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Basic Information
    doc.setFontSize(16);
    doc.text('Basic Information', 20, 45);
    doc.setFontSize(12);
    const basicInfo = [
      ['Name', patient.name],
      ['Age', `${patient.age} years`],
      ['Gender', patient.gender],
      ['Blood Type', patient.bloodType]
    ];
    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: basicInfo,
      theme: 'grid'
    });

    // Medical History
    doc.setFontSize(16);
    doc.text('Medical History', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(12);
    const medicalHistory = [
      ['Medical Condition', patient.medicalCondition],
      ['Allergies', patient.allergies?.join(', ') || 'None'],
      ['Chronic Conditions', patient.chronicConditions?.join(', ') || 'None'],
      ['Family History', patient.familyHistory || 'Not specified']
    ];
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Field', 'Value']],
      body: medicalHistory,
      theme: 'grid'
    });

    // Hospital Information
    doc.setFontSize(16);
    doc.text('Hospital Information', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(12);
    const hospitalInfo = [
      ['Hospital', patient.hospital],
      ['Doctor', patient.doctor],
      ['Room Number', patient.roomNumber],
      ['Admission Type', patient.admissionType],
      ['Date of Admission', new Date(patient.dateOfAdmission).toLocaleDateString()],
      ['Discharge Date', patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString() : 'Not discharged']
    ];
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Field', 'Value']],
      body: hospitalInfo,
      theme: 'grid'
    });

    // Vital Signs
    doc.setFontSize(16);
    doc.text('Vital Signs', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(12);
    const vitalSigns = [
      ['Blood Pressure', patient.vitalSigns?.bloodPressure || 'Not recorded'],
      ['Heart Rate', patient.vitalSigns?.heartRate ? `${patient.vitalSigns.heartRate} bpm` : 'Not recorded'],
      ['Temperature', patient.vitalSigns?.temperature ? `${patient.vitalSigns.temperature}°C` : 'Not recorded'],
      ['Respiratory Rate', patient.vitalSigns?.respiratoryRate ? `${patient.vitalSigns.respiratoryRate} breaths/min` : 'Not recorded']
    ];
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Field', 'Value']],
      body: vitalSigns,
      theme: 'grid'
    });

    // Lab Results
    doc.setFontSize(16);
    doc.text('Lab Results', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(12);
    const labResults = [
      ['Hemoglobin', patient.labResults?.hemoglobin ? `${patient.labResults.hemoglobin} g/dL` : 'Not recorded'],
      ['WBC', patient.labResults?.wbc ? `${patient.labResults.wbc} ×10⁹/L` : 'Not recorded'],
      ['RBC', patient.labResults?.rbc ? `${patient.labResults.rbc} ×10¹²/L` : 'Not recorded'],
      ['Platelets', patient.labResults?.platelets ? `${patient.labResults.platelets} ×10⁹/L` : 'Not recorded']
    ];
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Field', 'Value']],
      body: labResults,
      theme: 'grid'
    });

    // Additional Information
    doc.setFontSize(16);
    doc.text('Additional Information', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(12);
    const additionalInfo = [
      ['Insurance Provider', patient.insuranceProvider],
      ['Billing Amount', `$${(patient.billingAmount || 0).toLocaleString()}`],
      ['Medication', patient.medication || 'None'],
      ['Test Results', patient.testResults || 'Not available'],
      ['Vaccinations', patient.vaccinations?.join(', ') || 'None'],
      ['Last Checkup', patient.lastCheckup ? new Date(patient.lastCheckup).toLocaleDateString() : 'Not recorded'],
      ['Next Appointment', patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'Not scheduled'],
      ['Dietary Restrictions', patient.dietaryRestrictions?.join(',') || 'None'],
      ['Mobility Status', patient.mobilityStatus || 'Not specified'],
      ['Mental Status', patient.mentalStatus || 'Not specified'],
      ['Pain Level', patient.painLevel !== undefined ? `${patient.painLevel}/10` : 'Not recorded']
    ];
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Field', 'Value']],
      body: additionalInfo,
      theme: 'grid'
    });

    // Emergency Contact
    doc.setFontSize(16);
    doc.text('Emergency Contact', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(12);
    const emergencyContact = [
      ['Contact Name', patient.emergencyContact?.name || 'Not specified'],
      ['Relationship', patient.emergencyContact?.relationship || 'Not specified'],
      ['Phone Number', patient.emergencyContact?.phone || 'Not specified']
    ];
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Field', 'Value']],
      body: emergencyContact,
      theme: 'grid'
    });

    // Notes
    if (patient.notes) {
      doc.setFontSize(16);
      doc.text('Additional Notes', 20, (doc as any).lastAutoTable.finalY + 20);
      doc.setFontSize(12);
      doc.text(patient.notes, 20, (doc as any).lastAutoTable.finalY + 25);
    }

    // Save the PDF
    doc.save(`${patient.name.replace(/\s+/g, '_')}_medical_record.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Patient
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Filter className="h-5 w-5" />
              Filters
              <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Add Patient Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Add New Patient</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="150"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                  >
                    <option value="">Select Blood Type</option>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.medicalCondition}
                    onChange={(e) => setNewPatient({ ...newPatient, medicalCondition: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.doctor}
                    onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.hospital}
                    onChange={(e) => setNewPatient({ ...newPatient, hospital: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.insuranceProvider}
                    onChange={(e) => setNewPatient({ ...newPatient, insuranceProvider: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Amount</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.billingAmount}
                    onChange={(e) => setNewPatient({ ...newPatient, billingAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.roomNumber}
                    onChange={(e) => setNewPatient({ ...newPatient, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Type</label>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.admissionType}
                    onChange={(e) => setNewPatient({ ...newPatient, admissionType: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Elective">Elective</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.medication}
                    onChange={(e) => setNewPatient({ ...newPatient, medication: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Results</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.testResults}
                    onChange={(e) => setNewPatient({ ...newPatient, testResults: e.target.value })}
                  />
                </div>

                {/* Photo Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Photo</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload to storage
                          // For now, just store the file name
                          setNewPatient({ ...newPatient, photo: file.name });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Documents Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Documents</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setNewPatient({ 
                          ...newPatient, 
                          documents: [...(newPatient.documents || []), ...files.map(f => f.name)]
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Medical History Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
                </div>

                {/* Allergies */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    placeholder="Enter allergies separated by commas"
                    value={newPatient.allergies?.join(', ') || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    })}
                  />
                </div>

                {/* Chronic Conditions */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    placeholder="Enter chronic conditions separated by commas"
                    value={newPatient.chronicConditions?.join(', ') || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      chronicConditions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    })}
                  />
                </div>

                {/* Family History */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family History</label>
                  <textarea
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    rows={3}
                    value={newPatient.familyHistory || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, familyHistory: e.target.value })}
                  />
                </div>

                {/* Emergency Contact Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.emergencyContact?.name || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      emergencyContact: { 
                        ...newPatient.emergencyContact, 
                        name: e.target.value 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.emergencyContact?.relationship || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      emergencyContact: { 
                        ...newPatient.emergencyContact, 
                        relationship: e.target.value 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.emergencyContact?.phone || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      emergencyContact: { 
                        ...newPatient.emergencyContact, 
                        phone: e.target.value 
                      }
                    })}
                  />
                </div>

                {/* Vital Signs Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    placeholder="e.g., 120/80"
                    value={newPatient.vitalSigns?.bloodPressure || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      vitalSigns: { 
                        ...newPatient.vitalSigns, 
                        bloodPressure: e.target.value 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.vitalSigns?.heartRate || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      vitalSigns: { 
                        ...newPatient.vitalSigns, 
                        heartRate: parseInt(e.target.value) 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.vitalSigns?.temperature || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      vitalSigns: { 
                        ...newPatient.vitalSigns, 
                        temperature: parseFloat(e.target.value) 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Rate (breaths/min)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.vitalSigns?.respiratoryRate || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      vitalSigns: { 
                        ...newPatient.vitalSigns, 
                        respiratoryRate: parseInt(e.target.value) 
                      }
                    })}
                  />
                </div>

                {/* Lab Results Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.labResults?.hemoglobin || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      labResults: { 
                        ...newPatient.labResults, 
                        hemoglobin: parseFloat(e.target.value) 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WBC (×10⁹/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.labResults?.wbc || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      labResults: { 
                        ...newPatient.labResults, 
                        wbc: parseFloat(e.target.value) 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RBC (×10¹²/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.labResults?.rbc || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      labResults: { 
                        ...newPatient.labResults, 
                        rbc: parseFloat(e.target.value) 
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platelets (×10⁹/L)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.labResults?.platelets || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      labResults: { 
                        ...newPatient.labResults, 
                        platelets: parseInt(e.target.value) 
                      }
                    })}
                  />
                </div>

                {/* Additional Information Section */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                </div>

                {/* Vaccinations */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vaccinations</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    placeholder="Enter vaccinations separated by commas"
                    value={newPatient.vaccinations?.join(', ') || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      vaccinations: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    })}
                  />
                </div>

                {/* Last Checkup */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Checkup</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.lastCheckup || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, lastCheckup: e.target.value })}
                  />
                </div>

                {/* Next Appointment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.nextAppointment || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, nextAppointment: e.target.value })}
                  />
                </div>

                {/* Dietary Restrictions */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    placeholder="Enter dietary restrictions separated by commas"
                    value={newPatient.dietaryRestrictions?.join(', ') || ''}
                    onChange={(e) => setNewPatient({ 
                      ...newPatient, 
                      dietaryRestrictions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    })}
                  />
                </div>

                {/* Mobility Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobility Status</label>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.mobilityStatus || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, mobilityStatus: e.target.value })}
                  >
                    <option value="">Select Status</option>
                    <option value="Independent">Independent</option>
                    <option value="Assisted">Assisted</option>
                    <option value="Dependent">Dependent</option>
                    <option value="Wheelchair">Wheelchair</option>
                    <option value="Bedridden">Bedridden</option>
                  </select>
                </div>

                {/* Mental Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mental Status</label>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.mentalStatus || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, mentalStatus: e.target.value })}
                  >
                    <option value="">Select Status</option>
                    <option value="Alert">Alert</option>
                    <option value="Confused">Confused</option>
                    <option value="Drowsy">Drowsy</option>
                    <option value="Unresponsive">Unresponsive</option>
                  </select>
                </div>

                {/* Pain Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pain Level (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={newPatient.painLevel || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, painLevel: parseInt(e.target.value) })}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    rows={4}
                    value={newPatient.notes || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Patient
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                >
                  <option value="">All</option>
                  {uniqueValues('gender').map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                  value={filters.bloodType}
                  onChange={(e) => setFilters({ ...filters, bloodType: e.target.value })}
                >
                  <option value="">All</option>
                  {uniqueValues('bloodType').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                  value={filters.medicalCondition}
                  onChange={(e) => setFilters({ ...filters, medicalCondition: e.target.value })}
                >
                  <option value="">All</option>
                  {uniqueValues('medicalCondition').map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                  value={filters.hospital}
                  onChange={(e) => setFilters({ ...filters, hospital: e.target.value })}
                >
                  <option value="">All</option>
                  {uniqueValues('hospital').map(hospital => (
                    <option key={hospital} value={hospital}>{hospital}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : (
            filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
                    <p className="text-sm text-gray-600">{patient.age} years old • {patient.gender}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {patient.bloodType}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium text-gray-900">{patient.medicalCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hospital</span>
                    <span className="font-medium text-gray-900">{patient.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor</span>
                    <span className="font-medium text-gray-900">{patient.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission</span>
                    <span className="font-medium text-gray-900">{new Date(patient.dateOfAdmission).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium text-gray-900">{patient.insuranceProvider}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Billing</span>
                    <span className="font-medium text-gray-900">
                      ${(patient.billingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewPatient(patient)}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {!loading && filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No patients found matching your criteria</p>
          </div>
        )}
      </div>

      {/* View Patient Modal */}
      {isViewModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Patient Details</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDownloadPDF(selectedPatient)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.age} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.bloodType}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medical Condition</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.medicalCondition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.allergies?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chronic Conditions</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.chronicConditions?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Family History</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.familyHistory || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Hospital Information */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hospital</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.hospital}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.doctor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Number</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.roomNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admission Type</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.admissionType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Admission</label>
                    <p className="mt-1 text-gray-900">{new Date(selectedPatient.dateOfAdmission).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discharge Date</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.dischargeDate ? new Date(selectedPatient.dischargeDate).toLocaleDateString() : 'Not discharged'}</p>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.vitalSigns?.bloodPressure || 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heart Rate</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.vitalSigns?.heartRate ? `${selectedPatient.vitalSigns.heartRate} bpm` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temperature</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.vitalSigns?.temperature ? `${selectedPatient.vitalSigns.temperature}°C` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Respiratory Rate</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.vitalSigns?.respiratoryRate ? `${selectedPatient.vitalSigns.respiratoryRate} breaths/min` : 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Lab Results */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hemoglobin</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.labResults?.hemoglobin ? `${selectedPatient.labResults.hemoglobin} g/dL` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WBC</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.labResults?.wbc ? `${selectedPatient.labResults.wbc} ×10⁹/L` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RBC</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.labResults?.rbc ? `${selectedPatient.labResults.rbc} ×10¹²/L` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platelets</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.labResults?.platelets ? `${selectedPatient.labResults.platelets} ×10⁹/L` : 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.insuranceProvider}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Billing Amount</label>
                    <p className="mt-1 text-gray-900">${(selectedPatient.billingAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medication</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.medication || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Test Results</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.testResults || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vaccinations</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.vaccinations?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Checkup</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.lastCheckup ? new Date(selectedPatient.lastCheckup).toLocaleDateString() : 'Not recorded'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Next Appointment</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.nextAppointment ? new Date(selectedPatient.nextAppointment).toLocaleDateString() : 'Not scheduled'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.dietaryRestrictions?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobility Status</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.mobilityStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mental Status</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.mentalStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pain Level</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.painLevel !== undefined ? `${selectedPatient.painLevel}/10` : 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.emergencyContact?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.emergencyContact?.relationship || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-gray-900">{selectedPatient.emergencyContact?.phone || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPatient.notes && (
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPatient.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 