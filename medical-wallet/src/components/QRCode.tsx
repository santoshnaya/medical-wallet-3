import QRCodeReact from 'qrcode.react';
import { Patient } from '@/lib/firebaseService';

interface QRCodeProps {
  patient: Patient;
  size?: number;
}

export function QRCode({ patient, size = 128 }: QRCodeProps) {
  // Create a string of essential patient info for the QR code
  const patientInfo = JSON.stringify({
    id: patient.userId,
    name: patient.name,
    bloodType: patient.bloodType,
    age: patient.age,
    gender: patient.gender,
  });

  return (
    <div className="bg-white p-2 rounded-lg">
      <QRCodeReact
        value={patientInfo}
        size={size}
        level="H"
        includeMargin={true}
        className="rounded-lg"
      />
    </div>
  );
} 