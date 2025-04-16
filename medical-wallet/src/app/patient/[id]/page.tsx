'use client';

import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient';
import { firebaseService } from '@/lib/firebaseService';
import HealthCard from '@/components/HealthCard';

export default function PatientDetails({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientData = await firebaseService.getPatient(params.id);
        if (patientData) {
          setPatient(patientData as Patient);
        } else {
          setError('Patient not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [params.id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!patient) return <div className="p-4">Patient not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Health Card */}
      <div className="mb-8 flex justify-center">
        <HealthCard patient={patient} />
      </div>

      {/* Detailed Information */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Detailed Medical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medical History */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Medical History</h3>
            <div className="space-y-2">
              <p>{patient.medicalHistory?.familyMedicalHistory}</p>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Allergies</h3>
            <ul className="list-disc list-inside">
              {patient.medicalHistory?.allergies.map((allergy, index) => (
                <li key={index}>{allergy}</li>
              ))}
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Emergency Contact</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {patient.contactInfo.emergencyContact.name}</p>
              <p><span className="font-medium">Phone:</span> {patient.contactInfo.emergencyContact.phone}</p>
              <p><span className="font-medium">Relationship:</span> {patient.contactInfo.emergencyContact.relationship}</p>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Additional Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Height:</span> {patient.height || 'Not specified'}</p>
              <p><span className="font-medium">Weight:</span> {patient.weight || 'Not specified'}</p>
              <p><span className="font-medium">Blood Pressure:</span> {patient.bloodPressure || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 