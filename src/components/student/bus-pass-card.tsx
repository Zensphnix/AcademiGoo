
"use client";

import type { FC } from 'react';
import Image from 'next/image';
// Removed Card imports
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns'; // For formatting the date

interface BusPassCardProps {
  studentName: string;
  validTill: string; // Expect YYYY-MM-DD or ISO string
  route: string;
  busNumber: string;
  qrCodeData: string; // Data to encode in QR code
  onDownload: () => void;
  // onRenew prop is removed as the button is removed
}

const BusPassCard: FC<BusPassCardProps> = ({
  studentName,
  validTill,
  route,
  busNumber,
  qrCodeData,
  onDownload,
}) => {

  // Format the date for display (e.g., "June 30, 2025")
  const formattedValidTill = format(new Date(validTill), 'MMMM dd, yyyy');

  // Generate QR code URL using qrserver.com API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeData)}`;

  // Fallback QR code if generation fails (or as a placeholder)
  const fallbackQrCodeUrl = 'https://picsum.photos/seed/qr_fallback/180/180'; // Placeholder image
  const effectiveQrCodeUrl = qrCodeUrl || fallbackQrCodeUrl; // Use generated or fallback

  return (
    // Replaced Card with div and applied styling
    <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden">
      {/* Equivalent to CardHeader */}
      <div className="p-6 text-center pb-4 border-b">
        <h2 className="text-xl font-semibold leading-none tracking-tight text-primary">Your Digital Bus Pass</h2>
      </div>
      {/* Equivalent to CardContent */}
      <div className="p-6 pt-6 space-y-6">
        {/* QR Code Section */}
        <div className="flex justify-center">
           {/* Use next/image for QR code */}
           <Image
            src={effectiveQrCodeUrl}
            alt="Bus Pass QR Code"
            width={180}
            height={180}
             className="rounded-md border shadow-sm" // Add subtle styling
             unoptimized // Required for external dynamic images like QR codes unless domain is configured
             onError={(e) => {
                 console.error("Failed to load QR code:", e);
                // Optionally set a fallback image state here if needed
                (e.target as HTMLImageElement).src = fallbackQrCodeUrl; // Set fallback directly
             }}
          />
        </div>

        {/* Details Section - matches wireframe text */}
        <div className="space-y-2 text-center">
          <p><span className="font-semibold">Name:</span> {studentName}</p>
           {/* Display formatted date */}
           <p><span className="font-semibold">Valid Till:</span> {formattedValidTill}</p>
          <p><span className="font-semibold">Bus Route:</span> {route}</p>
          <p><span className="font-semibold">Bus Number:</span> {busNumber}</p>
        </div>
      </div>
      {/* Equivalent to CardFooter */}
      {/* Adjusted grid to single column as only download button remains */}
      <div className="grid grid-cols-1 p-6 pt-6 border-t">
        <Button onClick={onDownload} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" /> Download Pass
        </Button>
        {/* Renew Pass Button Removed */}
        {/* <Button onClick={onRenew} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <RefreshCw className="mr-2 h-4 w-4" /> Renew Pass
        </Button> */}
      </div>
    </div>
  );
};

export default BusPassCard;
