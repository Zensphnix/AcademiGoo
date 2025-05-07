
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import BusPassCard from '@/components/student/bus-pass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Import useRouter

// Mock pass data structure
interface BusPassData {
  studentName: string;
  validTill: string; // ISO date string or formatted string
  route: string;
  busNumber: string;
  qrCodeData: string; // Data to encode in QR
}

// Mock function to fetch pass data
const fetchPassData = async (): Promise<BusPassData> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  const validTillDate = new Date();
  validTillDate.setFullYear(validTillDate.getFullYear() + 1); // Example: Valid for 1 year
  const validTillString = validTillDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  // Fetch user name or use default
  const storedName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
  const studentName = storedName || 'Shashi Sharma';

  const passData = {
    studentName: studentName,
    validTill: validTillString, // Use the dynamic date
    route: 'Route 5 – North Campus Line',
    busNumber: 'DL 1A 4567',
  };

  // Construct QR code data (ensure this matches expected format for scanning)
   const qrCodeData = `AcademiGoPass:${passData.studentName.replace(/\s/g, '')}:${passData.route.replace(/\s/g, '_')}:${passData.busNumber.replace(/\s/g, '')}:ValidTill_${passData.validTill}`;


  return { ...passData, qrCodeData };
};

const BusPassPage: FC = () => {
  const [passData, setPassData] = useState<BusPassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    setIsLoading(true);
    fetchPassData()
      .then(setPassData)
       .catch(err => {
          console.error("Failed to fetch pass data:", err);
          toast({ title: "Error", description: "Could not load bus pass information.", variant: "destructive"});
       })
      .finally(() => setIsLoading(false));
  }, [toast]); // Add toast dependency

  const handleDownload = () => {
     console.log('Download Pass Clicked');
    // Implement PDF generation and download logic
     toast({ title: "Download Started", description: "Generating PDF..." });
     // Example: window.location.href = '/api/student/pass/download';
  };

  // Renew handler removed as button is removed
  // const handleRenew = () => {
  //   console.log('Renew Pass Clicked');
  //   // Navigate to renewal page
  //   router.push('/student/renew-pass');
  // };

  return (
    // Container removed, component handles its own layout and centering
    <div className="flex justify-center py-6"> {/* Keep flex justify-center */}
       {isLoading ? (
         // Skeleton loader for the pass card (without Card wrapper)
         <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden">
           <div className="text-center p-6 pb-4 border-b">
              <Skeleton className="h-6 w-48 mx-auto" />
           </div>
           <div className="p-6 pt-6 space-y-6">
              <div className="flex justify-center">
                 <Skeleton className="h-48 w-48 rounded-md" />
              </div>
              <div className="space-y-3 text-center">
                 <Skeleton className="h-5 w-3/4 mx-auto" />
                 <Skeleton className="h-4 w-1/2 mx-auto" />
                 <Skeleton className="h-4 w-2/3 mx-auto" />
                 <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
           </div>
            {/* Adjusted skeleton for single button */}
           <div className="grid grid-cols-1 gap-4 p-6 pt-6 border-t">
             <Skeleton className="h-10 w-full" />
             {/* <Skeleton className="h-10 w-full" /> */}
           </div>
         </div>
       ) : passData ? (
         // Render the actual pass card when data is loaded
         <BusPassCard
           studentName={passData.studentName}
           validTill={passData.validTill}
           route={passData.route}
           busNumber={passData.busNumber}
           qrCodeData={passData.qrCodeData}
           onDownload={handleDownload}
           // onRenew prop removed
         />
       ) : (
          // Show error message if loading failed
           <p className="text-destructive text-center">Failed to load bus pass data.</p>
       )}
    </div>
  );
};

export default BusPassPage;
