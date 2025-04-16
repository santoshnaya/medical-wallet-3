'use client';

import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface PatientCardProps {
  patient: {
    id: string;
    fullName: string;
    age: string;
    gender: string;
    bloodType: string;
  };
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const handleDownload = async () => {
    const cardElement = document.getElementById('patient-card');
    if (cardElement) {
      const canvas = await html2canvas(cardElement);
      const link = document.createElement('a');
      link.download = `${patient.fullName}-health-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="patient-card"
        className="w-[400px] h-[250px] bg-white rounded-xl shadow-lg p-6 flex justify-between items-center"
      >
        {/* Left side - Patient Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{patient.fullName}</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Age:</span> {patient.age}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Gender:</span> {patient.gender}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Blood Type:</span> {patient.bloodType}
            </p>
          </div>
        </div>

        {/* Right side - QR Code */}
        <div className="bg-white p-2 rounded-lg shadow-md">
          <QRCodeSVG
            value={JSON.stringify({
              id: patient.id,
              name: patient.fullName,
              age: patient.age,
              gender: patient.gender,
              bloodType: patient.bloodType
            })}
            size={120}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Download Card
      </button>
    </div>
  );
};

export default PatientCard; 