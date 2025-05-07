"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, ArrowLeft, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


const StudentAttendanceScanPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null = checking, true = granted, false = denied
  const [isScanning, setIsScanning] = useState(false); // To show scanning indicator

  useEffect(() => {
    const getCameraPermission = async () => {
       setHasCameraPermission(null); // Start checking
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // Prefer back camera
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
           videoRef.current.onloadedmetadata = () => { // Ensure video is ready before playing
              videoRef.current?.play();
              setIsScanning(true); // Start scanning indication once stream is playing
            };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to scan QR codes.',
        });
         setIsScanning(false);
      }
    };

    getCameraPermission();

    // Cleanup function to stop the camera stream when component unmounts
     return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]); // Add toast as dependency

   // Mock function to simulate processing the scan
   const handleScanResult = (result: string) => {
     setIsScanning(false); // Stop visual scanning indicator
     console.log("Scan result:", result);
     toast({
        title: "QR Code Scanned (Simulated)",
        description: `Data: ${result.substring(0, 30)}...`, // Show partial data
     });
     // TODO: Implement actual QR code processing logic (e.g., send to server for attendance)
     // After processing, navigate back or show success/failure message
     setTimeout(() => router.push('/student/dashboard'), 2000); // Navigate back after 2s
   };

   // TODO: Integrate a QR code scanning library (like react-qr-reader or html5-qrcode)
   // This library would use the videoRef and call handleScanResult when a QR code is detected.
   // Example placeholder for library integration effect:
   useEffect(() => {
     let scanInterval: NodeJS.Timeout | null = null;
     if (hasCameraPermission && isScanning) {
       console.log("Starting scan simulation interval...");
       // Simulate detecting a QR code every 5 seconds
       scanInterval = setInterval(() => {
         if (Math.random() > 0.7) { // 30% chance to "detect" a QR code
           handleScanResult(`SimulatedQRData-${Date.now()}`);
         }
       }, 5000);
     } else {
       console.log("Stopping scan simulation interval...");
       if (scanInterval) clearInterval(scanInterval);
     }
     return () => {
        if (scanInterval) clearInterval(scanInterval);
     };
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasCameraPermission, isScanning]);


  return (
    <div className="container mx-auto py-6 flex justify-center">
       {/* Replaced Card with div and applied styling */}
      <div className="w-full max-w-lg rounded-lg border bg-card text-card-foreground shadow-lg">
         {/* Equivalent to CardHeader */}
        <div className="p-6 space-y-1.5">
          <h2 className="text-xl text-primary font-semibold">Scan Attendance QR Code</h2>
          <p className="text-sm text-muted-foreground">Point your camera at the QR code displayed by the conductor or driver.</p>
        </div>
        {/* Equivalent to CardContent */}
        <div className="p-6 pt-0 space-y-4">
          {/* Video Feed Area */}
          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border border-border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline /> {/* Ensure playsInline for iOS */}

             {/* Loading/Permission State Overlay */}
             {hasCameraPermission === null && ( // Checking permission
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                    <Skeleton className="h-12 w-12 rounded-full mb-2 bg-gray-400" />
                    <p className="text-sm">Checking camera permissions...</p>
                </div>
             )}
             {hasCameraPermission === false && ( // Permission denied
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white p-4">
                    <Camera className="h-12 w-12 mb-2" />
                    <p className="font-semibold">Camera Access Denied</p>
                    <p className="text-sm text-center">Enable camera permissions to scan.</p>
                </div>
             )}

              {/* Scanning Indicator */}
             {hasCameraPermission === true && isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Simple focus square */}
                    <div className="w-3/4 h-3/4 border-4 border-dashed border-white/80 rounded-lg" />
                    {/* Optional: Add scanning line animation */}
                     <div className="absolute top-0 left-1/2 w-1/2 h-1 bg-red-500 animate-pulse -translate-x-1/2"></div>
                 </div>
             )}
          </div>

           {/* Permission Info Alert */}
           {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <Camera className="h-4 w-4" /> {/* Icon consistency */}
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use the QR scanner.
                    </AlertDescription>
                </Alert>
           )}
            {hasCameraPermission === true && !isScanning && (
                 <Alert variant="default">
                     <Info className="h-4 w-4" />
                     <AlertTitle>Ready to Scan</AlertTitle>
                     <AlertDescription>
                         Point the camera towards the QR code.
                     </AlertDescription>
                 </Alert>
            )}
        </div>
         {/* Equivalent to CardFooter */}
        <div className="flex items-center p-6 pt-6 border-t">
          <Button onClick={() => router.push('/student/dashboard')} variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceScanPage;
