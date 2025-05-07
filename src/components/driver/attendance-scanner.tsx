"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AttendanceQRCodeDisplayProps {
  onBack: () => void;
  // Future props: tripId, busNumber, route etc. to generate dynamic QR data
}

// Function to generate QR code data (replace with actual logic)
const generateQRCodeData = (): string => {
    const tripId = `Trip_${Date.now().toString().slice(-6)}`; // Simple unique ID
    const busNumber = "HR 26 B 7890"; // Replace with actual bus number from props/context
    const timestamp = new Date().toISOString();
    // Example Data: Identify the system, trip, bus, and time
    return `AcademiGoAttend:${tripId}:${busNumber}:${timestamp}`;
};

const AttendanceQRCodeDisplay: FC<AttendanceQRCodeDisplayProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateAndSetQRCode = () => {
    setIsLoading(true);
    try {
        const data = generateQRCodeData();
        setQrCodeData(data);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}&format=png`;
        setQrCodeUrl(url);
        console.log("Generated QR Code URL:", url);
         // toast({ title: "QR Code Updated", description: "Ready for student scans." });
    } catch (error) {
         console.error("Error generating QR code:", error);
         toast({ title: "Error", description: "Could not generate QR Code.", variant: "destructive" });
         setQrCodeUrl(null);
    } finally {
         // Add a small delay before setting loading false to allow image to potentially load
         setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Generate QR code on initial mount
  useEffect(() => {
    generateAndSetQRCode();
    // Optional: Set interval to refresh QR code periodically (e.g., every 5 minutes)
    const intervalId = setInterval(generateAndSetQRCode, 5 * 60 * 1000); // Refresh every 5 mins
    return () => clearInterval(intervalId); // Cleanup interval on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount


  const handleRefreshClick = () => {
     generateAndSetQRCode();
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg border bg-card text-card-foreground shadow-lg">
      {/* Header */}
      <div className="p-6 space-y-1.5 border-b">
        <h2 className="text-xl text-primary font-semibold flex items-center gap-2">
          <QrCode className="h-5 w-5" /> Attendance QR Code
        </h2>
        <p className="text-sm text-muted-foreground">
          Students scan this code to mark their attendance.
        </p>
      </div>
      {/* Content: QR Code Display */}
      <div className="p-6 pt-6 space-y-4 flex flex-col items-center">
        {isLoading || !qrCodeUrl ? (
           <Skeleton className="h-[250px] w-[250px] rounded-md" />
        ) : (
           <Image
             src={qrCodeUrl}
             alt="Attendance QR Code"
             width={250}
             height={250}
             className="rounded-md border shadow-sm"
             unoptimized // Important for dynamic external images
             onError={(e) => {
                console.error("Failed to load QR code image:", e);
                toast({ title: "QR Load Error", description: "Could not display QR code image.", variant: "destructive" });
                setQrCodeUrl(null); // Clear URL on error
                setIsLoading(false); // Ensure loading stops
             }}
           />
        )}
         {/* Optional: Display Bus Number/Route */}
         <div className="text-center text-muted-foreground text-sm mt-2">
             <p>Bus: HR 26 B 7890</p> {/* Replace with dynamic data */}
             <p>Route: South Campus Express</p>
         </div>
          {/* Refresh Button */}
         <Button onClick={handleRefreshClick} variant="outline" size="sm" disabled={isLoading} className="mt-4">
             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             {isLoading ? 'Generating...' : 'Refresh Code'}
         </Button>
      </div>
      {/* Footer: Back Button */}
      <div className="flex items-center p-6 pt-6 border-t">
        <Button onClick={onBack} variant="outline" className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default AttendanceQRCodeDisplay; // Export renamed component
