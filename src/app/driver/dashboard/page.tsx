
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DutyDashboardCard from '@/components/driver/duty-dashboard-card';
import type { StopData } from '@/components/driver/duty-dashboard-card'; // Import StopData type
import { useToast } from '@/hooks/use-toast';

// Define the key for storing arrival status
const DRIVER_ARRIVAL_STATUS_KEY = 'driverArrivalStatus';

// Mock data based on wireframe example, now includes 'arrived' status
const mockDutyData = {
  route: 'South Campus Express',
  busNumber: 'HR 26 B 7890',
  stops: [
    { name: 'Main Gate', time: '9:00 AM', arrived: false },
    { name: 'Library Complex', time: '9:10 AM', arrived: false },
    { name: 'Sports Field', time: '9:18 AM', arrived: false },
    { name: 'Hostel Block A', time: '9:25 AM', arrived: false },
    { name: 'Faculty Housing', time: '9:35 AM', arrived: false },
    { name: 'South Gate', time: '9:45 AM', arrived: false },
  ],
};

// Helper to load arrival status from local storage
const loadArrivalStatus = (route: string): StopData[] => {
    if (typeof window === 'undefined') return mockDutyData.stops;
    try {
        const storedStatusRaw = localStorage.getItem(DRIVER_ARRIVAL_STATUS_KEY);
        if (storedStatusRaw) {
            const storedStatus = JSON.parse(storedStatusRaw);
            // Ensure stored data matches the current route
            if (storedStatus.route === route) {
                 // Check if stop structure matches (basic check)
                 if (storedStatus.stops.length === mockDutyData.stops.length) {
                     return storedStatus.stops.map((storedStop: any, index: number) => ({
                         ...mockDutyData.stops[index], // Use name/time from current mock data
                         arrived: storedStop.arrived ?? false // Take arrived status from storage
                     }));
                 }
            }
        }
    } catch (e) {
        console.error("Error loading arrival status:", e);
    }
    // Fallback to default mock stops if no valid data found
    return mockDutyData.stops;
};

// Helper to save arrival status to local storage
const saveArrivalStatus = (route: string, stops: StopData[]) => {
     if (typeof window === 'undefined') return;
     try {
        const statusToSave = {
            route: route,
            stops: stops.map(stop => ({ name: stop.name, arrived: stop.arrived })) // Only save name and arrived status
        };
        localStorage.setItem(DRIVER_ARRIVAL_STATUS_KEY, JSON.stringify(statusToSave));
     } catch (e) {
         console.error("Error saving arrival status:", e);
     }
};

// Helper to clear arrival status from local storage
const clearArrivalStatus = () => {
     if (typeof window === 'undefined') return;
     localStorage.removeItem(DRIVER_ARRIVAL_STATUS_KEY);
}


const DriverDashboardPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [dutyData, setDutyData] = useState(mockDutyData); // Use mock data as initial structure
  const [stopsStatus, setStopsStatus] = useState<StopData[]>([]); // Separate state for stops with arrival status
  const [isTrackingOn, setIsTrackingOn] = useState(false); // Tracking starts off

  // Load duty data and arrival status on mount
  useEffect(() => {
    // Fetch actual duty data
    // fetch('/api/driver/duty').then(...)
    // For now, use mock data
    setDutyData(mockDutyData);

    // Load arrival status from storage based on the current route
    const loadedStops = loadArrivalStatus(mockDutyData.route);
    setStopsStatus(loadedStops);

    // Determine initial tracking status (e.g., from API or localStorage if needed)
    // For demo, assume tracking is off unless arrival data is partially complete
     const isTripInProgress = loadedStops.some(stop => stop.arrived) && !loadedStops.every(stop => stop.arrived);
     setIsTrackingOn(isTripInProgress);
     if (isTripInProgress) {
        console.log("Resuming trip based on saved arrival status.");
     }

  }, []); // Run only on mount

  const handleStartTrip = () => {
    console.log('Start Trip Clicked');
    // Reset arrival status when starting a new trip
    const resetStops = dutyData.stops.map(stop => ({ ...stop, arrived: false }));
    setStopsStatus(resetStops);
    clearArrivalStatus(); // Clear old status from storage

    // Call API to start trip and activate GPS tracking
    setIsTrackingOn(true);
    toast({
      title: "Trip Started",
      description: `GPS tracking activated for route ${dutyData.route}.`,
      variant: 'default',
    });
  };

  const handleScanAttendance = () => {
    console.log('Scan Attendance Clicked');
    router.push('/driver/attendance');
  };

  const handleEndTrip = () => {
    console.log('End Trip Clicked');
     // Mark all remaining stops as arrived? Or just stop tracking? For now, just stop tracking.
    // Consider API call to mark trip complete

    setIsTrackingOn(false);
    clearArrivalStatus(); // Clear status on trip end
    toast({
      title: "Trip Ended",
      description: `Route ${dutyData.route} completed. Tracking stopped.`,
    });
     // Optionally reset stop status visually after ending
     // setStopsStatus(dutyData.stops.map(stop => ({ ...stop, arrived: false })));
  };

   // Handler for checkbox changes in DutyDashboardCard
   const handleToggleStopArrival = (stopIndex: number, arrived: boolean) => {
        setStopsStatus(prevStops => {
            const newStops = prevStops.map((stop, index) =>
                index === stopIndex ? { ...stop, arrived } : stop
            );
            // Save updated status to local storage
             saveArrivalStatus(dutyData.route, newStops);
            return newStops;
        });
         toast({
            title: `Stop ${arrived ? 'Reached' : 'Unmarked'}`,
            description: `${stopsStatus[stopIndex]?.name}`,
         });
    };

    // Handler for notifying delay
    const handleNotifyDelay = async (reason: string) => {
        console.log(`Notifying delay for route ${dutyData.route} with reason: ${reason}`);
        // TODO: Implement actual API call to backend to trigger notifications to students on this route.
        // Example: await api.notifyDelay(dutyData.route, reason);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        toast({
            title: "Delay Notification Sent",
            description: `Students on route ${dutyData.route} have been notified about the delay due to: ${reason}.`,
        });
        // No state change needed here unless you want to track that a notification was sent.
    };


  return (
    <DutyDashboardCard
      route={dutyData.route}
      busNumber={dutyData.busNumber}
      stops={stopsStatus} // Pass the state with arrival status
      isTrackingOn={isTrackingOn}
      onStartTrip={handleStartTrip}
      onScanAttendance={handleScanAttendance}
      onEndTrip={handleEndTrip}
      onToggleStopArrival={handleToggleStopArrival} // Pass the handler
      onNotifyDelay={handleNotifyDelay} // Pass the new handler
    />
  );
};

export default DriverDashboardPage;
