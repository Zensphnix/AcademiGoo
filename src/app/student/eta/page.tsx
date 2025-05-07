
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Bus, Clock, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button"; // Import Button

// Mock ETA fetching (Replace with real GPS tracking + Firebase data)
const mockETA = {
  route: "W-2",
  busNumber: "HR26AA1234",
  stopName: "Deepali Chowk", // Example stop
  estimatedArrival: "08:32 AM",
  lastUpdated: "08:25 AM",
};

// Interface for ETA data
interface ETAData {
  route: string;
  busNumber: string;
  stopName: string;
  estimatedArrival: string;
  lastUpdated: string;
}

// Define the component correctly using `export default function`
export default function CheckETAPage() {
  const [loading, setLoading] = useState(true);
  const [etaData, setEtaData] = useState<ETAData | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Simulate API call to fetch ETA for the student's registered route/bus/stop
    // In a real app, you'd fetch based on the logged-in user's details
    const fetchETA = async () => {
        setLoading(true);
        // Replace with actual API call, e.g., await getStudentETA()
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEtaData(mockETA);
        setLoading(false);
    };
    fetchETA();
  }, []);

  return (
    <div className="container mx-auto py-6 flex justify-center">
       {/* Removed Card wrapper */}
      <div className="w-full max-w-xl rounded-lg border bg-card text-card-foreground shadow-lg">
         {/* Equivalent to CardHeader */}
        <div className="p-6 flex items-center justify-between border-b pb-4">
            <h2 className="text-xl text-primary font-semibold">Check Bus ETA</h2>
             <Button onClick={() => router.back()} variant="ghost" size="sm">
                 <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
        </div>
         {/* Equivalent to CardDescription (moved below title) */}
         <div className="p-6 pt-2 pb-4 border-b">
            <p className="text-sm text-muted-foreground">Live tracking information for your assigned bus stop.</p>
         </div>
        {/* Equivalent to CardContent */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
               <Skeleton className="h-4 w-1/4 ml-auto" /> {/* For last updated */}
            </div>
          ) : etaData ? (
            <>
               {/* Route Info */}
              <div className="flex gap-2 items-center text-muted-foreground">
                 {/* <Route className="h-4 w-4" /> Assuming Route icon exists */}
                <span className="text-sm">Route: {etaData.route}</span>
              </div>
               {/* Bus Number */}
              <div className="flex gap-2 items-center">
                <Bus className="h-5 w-5 text-primary" />
                <p className="font-medium text-lg">{etaData.busNumber}</p>
              </div>
               {/* Stop Name */}
              <div className="flex gap-2 items-center">
                <MapPin className="h-5 w-5 text-primary" />
                <p className="font-medium text-lg">{etaData.stopName}</p>
              </div>
               {/* Estimated Arrival Time */}
              <div className="flex gap-2 items-center mt-4 pt-4 border-t">
                <Clock className="h-6 w-6 text-accent animate-pulse" />
                <div>
                    <p className="font-semibold text-2xl text-accent">{etaData.estimatedArrival}</p>
                    <p className="text-xs text-muted-foreground">Estimated Time of Arrival</p>
                </div>
              </div>
               {/* Last Updated Timestamp */}
              <p className="text-xs text-muted-foreground text-right mt-2">
                Last updated: {etaData.lastUpdated}
              </p>
            </>
          ) : (
             <p className="text-center text-destructive">Could not load ETA information.</p>
          )}
        </div>
        {/* Optional Footer for refresh button */}
        {/* <div className="p-6 pt-4 border-t flex justify-end">
             <Button variant="outline" size="sm" onClick={() => { /* refresh logic *\/ }}>
                <RefreshCw className="mr-2 h-4 w-4"/> Refresh
             </Button>
        </div> */}
      </div>
    </div>
  );
}
