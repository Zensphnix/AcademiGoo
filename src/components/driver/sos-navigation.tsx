"use client";

import type { FC } from 'react';
// Removed Card imports
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Siren, Map, ArrowLeft, Navigation } from 'lucide-react'; // Added Navigation
import { useToast } from '@/hooks/use-toast';

interface SosNavigationProps {
  routeQuery: string; // e.g., "South Campus Express Route, University Name" for Google Maps
  onBack: () => void;
}

const SosNavigation: FC<SosNavigationProps> = ({ routeQuery, onBack }) => {
  const { toast } = useToast();

  const handleSendSOS = () => {
    console.log('Driver SOS Alert Sent!');
    // Implement actual SOS sending logic here (e.g., API call to admin)
    toast({
      title: "Emergency Alert Sent",
      description: "Admin and emergency contacts have been notified.",
      variant: "destructive",
    });
  };

   const handleOpenMaps = () => {
    const encodedQuery = encodeURIComponent(routeQuery);
    // Construct Google Maps Directions URL.
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;
     window.open(mapsUrl, '_blank', 'noopener,noreferrer'); // Open securely in new tab/app
       toast({
         title: "Opening Navigation",
         description: "Opening route in Google Maps.",
        });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SOS Section (No Card) */}
      <div className="rounded-lg border border-destructive bg-card text-card-foreground shadow-lg">
        {/* Equivalent to CardHeader */}
        <div className="p-6 space-y-1.5">
          <h2 className="text-xl font-semibold leading-none tracking-tight text-destructive flex items-center">
             <Siren className="mr-2 h-5 w-5" /> Emergency Alert
          </h2>
          <p className="text-sm text-muted-foreground">Use only in critical situations.</p>
        </div>
        {/* Equivalent to CardContent */}
        <div className="p-6 pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Pressing this button will immediately notify the admin and emergency contacts of your situation and location.
          </p>
           <AlertDialog>
            <AlertDialogTrigger asChild>
               {/* SOS Button text matches wireframe */}
              <Button variant="destructive" size="lg" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <Siren className="mr-2 h-5 w-5 animate-pulse" /> Emergency Alert
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                 {/* Confirmation Title */}
                <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
                 {/* Confirmation Description matches wireframe */}
                <AlertDialogDescription>
                   Send emergency alert to admin?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                 {/* Button text matches wireframe */}
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSendSOS} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Confirm Alert
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Navigation Section (No Card) */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
        {/* Equivalent to CardHeader */}
        <div className="p-6 space-y-1.5">
          <h2 className="text-xl font-semibold leading-none tracking-tight text-primary flex items-center">
            <Navigation className="mr-2 h-5 w-5" /> Route Navigation {/* Using Navigation icon */}
          </h2>
          <p className="text-sm text-muted-foreground">Get turn-by-turn directions for your route.</p>
        </div>
        {/* Equivalent to CardContent */}
        <div className="p-6 pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Open the current route ({routeQuery.split(',')[0]}) in Google Maps for navigation assistance.
          </p>
            {/* Button text matches wireframe */}
           <Button onClick={handleOpenMaps} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Map className="mr-2 h-4 w-4" /> Open Route in Google Maps
           </Button>
        </div>
      </div>

       {/* Back Button - Moved below the grid */}
       <div className="md:col-span-2 flex justify-center mt-6"> {/* Span full width on mobile, place below cards */}
          <Button onClick={onBack} variant="outline" className="w-full sm:w-auto"> {/* Center button */}
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
      </div>
    </div>
  );
};

export default SosNavigation;
