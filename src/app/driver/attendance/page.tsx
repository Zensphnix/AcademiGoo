"use client";

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceQRCodeDisplay from '@/components/driver/attendance-scanner'; // Renamed import

const AttendancePage: FC = () => {
  const router = useRouter();

  // Handler to navigate back to the driver dashboard
  const handleBack = () => {
    router.push('/driver/dashboard');
  };

  return (
    // Container removed, component handles its own layout
    // Pass necessary data for QR code generation (e.g., tripId, busNumber)
    // For now, using mock data within the component itself.
    <AttendanceQRCodeDisplay onBack={handleBack} />
  );
};

export default AttendancePage;
