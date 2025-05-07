"use client"; // Required for usePathname

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DriverLayoutComponent from '@/components/common/layout/driver-layout'; // Renamed to avoid conflict

// Helper function to get title based on path, matching wireframe structure
const getTitle = (pathname: string): string => {
  if (pathname.endsWith('/dashboard')) return "Today's Duty"; // Matches Duty Dashboard header
  if (pathname.endsWith('/attendance')) return "Attendance QR Code"; // Updated Title
  if (pathname.endsWith('/sos-navigation')) return "SOS & Navigation"; // Matches SOS/Nav header
  return "Driver Portal"; // Default fallback title
};

export default function DriverLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  // Exclude layout for the login page (assuming it's NOT in a separate route group)
  // **Best Practice:** Move login to `src/app/(auth)/driver/login/page.tsx`
  // If using route groups, this check becomes unnecessary.
  if (pathname === '/driver/login') {
    return <>{children}</>;
  }

  // Apply layout to other driver pages
  return <DriverLayoutComponent title={title}>{children}</DriverLayoutComponent>;
}
