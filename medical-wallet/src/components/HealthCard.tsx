'use client';

import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface HealthCardProps {
  patient: {
    id: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactInfo: {
      phoneNumber: string;
    };
  };
}

const HealthCard = ({ patient }: HealthCardProps) => {
  // Generate health ID from patient id
  const healthId = `xx-${patient.id.substring(0, 4)}-${patient.id.substring(4, 8)}-${patient.id.substring(8, 12)}`;
  
  // Generate PHR address
  const phrAddress = `${patient.fullName.toLowerCase().replace(/\s+/g, '')}@ndhm`;

  return (
    <div className="w-[800px] h-[500px] relative bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header with geometric pattern */}
      <div className="bg-[#1a237e] h-[120px] flex items-center justify-between px-8 text-white relative">
        {/* Left side - Logo and text */}
        <div className="flex items-center gap-4">
          <Image
            src="/emblem.png"
            alt="National Emblem"
            width={80}
            height={80}
            className="object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold uppercase">national health authority</h1>
            <p className="text-sm">Ministry of Health and Family Welfare</p>
            <p className="text-sm">Government of India</p>
          </div>
        </div>
        
        {/* Right side - Health ID logo */}
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center">
            <Image
              src="/health-id-logo.png"
              alt="Health ID"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <p className="text-center mt-1 text-sm">Health ID</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex">
        {/* Left side - Photo */}
        <div className="w-[200px] h-[250px] bg-gray-100 mr-8">
          <Image
            src={patient.photoUrl || '/default-avatar.png'}
            alt={patient.fullName}
            width={200}
            height={250}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right side - Information */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6">{patient.fullName}</h2>
          
          <div className="space-y-5 text-lg">
            <p>
              <span className="font-semibold">Health ID Number:</span> {healthId}
            </p>
            <p>
              <span className="font-semibold">PHR Address:</span> {phrAddress}
            </p>
            <p>
              <span className="font-semibold">Date of Birth:</span> {patient.dateOfBirth}
            </p>
            <p>
              <span className="font-semibold">Gender:</span> {patient.gender.toLowerCase()}
            </p>
            <p>
              <span className="font-semibold">Mobile:</span> {patient.contactInfo.phoneNumber || 'XXXXXXXXXX'}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="absolute right-8 top-40">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <QRCodeSVG
              value={JSON.stringify({
                id: patient.id,
                name: patient.fullName,
                dob: patient.dateOfBirth,
                gender: patient.gender,
                phr: phrAddress
              })}
              size={150}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center text-gray-500">
        For representation purpose only
      </div>
    </div>
  );
};

export default HealthCard; 