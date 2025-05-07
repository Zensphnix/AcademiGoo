"use client";

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import SosNavigation from '@/components/driver/sos-navigation';

// Mock data or fetch from context/API for the current route query
// Example based on driver dashboard wireframe
const currentRouteQuery = "South Campus Express Route, Example University";

const SosNavigationPage: FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/driver/dashboard'); // Navigate back to the driver dashboard
  };

  return (
    // Container removed, component handles its own layout
    <SosNavigation routeQuery={currentRouteQuery} onBack={handleBack} />
  );
};

export default SosNavigationPage;
