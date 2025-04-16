import Image from 'next/image';
import { Patient } from '@/lib/firebaseService';

interface HealthIDCardProps {
  patient: Patient;
}

export const HealthIDCard = ({ patient }: HealthIDCardProps) => {
  return (
    <div className="w-96 h-56 bg-white rounded-xl shadow-lg p-6 relative">
      {/* Logo and Title */}
      <div className="flex items-center mb-4">
        <Image
          src="/health-authority-logo.svg"
          alt="Health Authority Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <h2 className="text-xl font-semibold text-gray-800">National Health ID</h2>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium">{patient.name}</p>
          
          <p className="text-sm text-gray-600 mt-2">Age</p>
          <p className="font-medium">{patient.age}</p>
          
          <p className="text-sm text-gray-600 mt-2">Blood Type</p>
          <p className="font-medium">{patient.bloodType}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-end">
          <Image
            src="/qr-placeholder.svg"
            alt="QR Code"
            width={100}
            height={100}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Card Number */}
      <div className="absolute bottom-4 left-6">
        <p className="text-xs text-gray-500">ID: {patient.userId?.slice(0, 8)}</p>
      </div>
    </div>
  );
}; 