
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Play, ScanLine, Square, MapPin, Clock, Navigation, CheckCircle, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Removed Checkbox and Label imports
import { cn } from '@/lib/utils'; // Import cn for conditional styling
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Import AlertDialog
import { Label } from '@/components/ui/label'; // Import Label
import { Input } from '@/components/ui/input'; // Import Input
import { useToast } from '@/hooks/use-toast'; // Import useToast


export interface StopData {
    name: string;
    time: string;
    arrived: boolean; // Add arrived status
}

interface DutyDashboardCardProps {
  route: string;
  busNumber: string;
  stops: StopData[]; // Use updated StopData interface
  isTrackingOn: boolean;
  onStartTrip: () => void;
  onScanAttendance: () => void;
  onEndTrip: () => void;
  onToggleStopArrival: (stopIndex: number, arrived: boolean) => void; // Handler for arrival status change
  onNotifyDelay: (reason: string) => Promise<void>; // New prop for notifying delay
}

const DutyDashboardCard: FC<DutyDashboardCardProps> = ({
  route,
  busNumber,
  stops,
  isTrackingOn,
  onStartTrip,
  onScanAttendance,
  onEndTrip,
  onToggleStopArrival,
  onNotifyDelay, // Destructure new prop
}) => {
  const { toast } = useToast();
  const [delayReason, setDelayReason] = useState('');
  const [isSubmittingDelay, setIsSubmittingDelay] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false); // Control modal visibility

  const handleDelaySubmit = async () => {
    if (!delayReason.trim()) {
        toast({ title: "Reason Required", description: "Please provide a brief reason for the delay.", variant: "destructive" });
        return;
    }
    setIsSubmittingDelay(true);
    try {
        await onNotifyDelay(delayReason.trim());
        // Toast for success will be shown in the parent handler
        setIsDelayModalOpen(false); // Close modal on success
        setDelayReason(''); // Reset reason
    } catch (error) {
        // Error toast is likely handled in parent, but can add one here too
        console.error("Failed to send delay notification:", error);
        toast({ title: "Error", description: "Could not send delay notification.", variant: "destructive" });
    } finally {
        setIsSubmittingDelay(false);
    }
  };


  return (
    <div className="w-full max-w-xl rounded-lg border bg-card text-card-foreground shadow-lg mx-auto">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-6 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold leading-none tracking-tight text-primary">Today's Duty</h2>
          <p className="text-sm text-muted-foreground">{busNumber}</p>
        </div>
         {isTrackingOn && (
           <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 animate-pulse font-medium">
             <MapPin className="mr-1 h-3 w-3" /> Tracking On
           </Badge>
         )}
      </div>
      {/* Content */}
      <div className="p-6 pt-6 space-y-4">
         <div>
            <h3 className="text-md font-semibold mb-2 text-foreground">Route: {route}</h3>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Stops:</h4>
             <ScrollArea className="h-48 w-full rounded-md border p-3 bg-secondary"> {/* Increased height slightly */}
                <ul className="space-y-3"> {/* Increased spacing */}
                {stops.map((stop, index) => (
                    <li
                        key={index}
                        className={cn(
                            "flex items-center justify-between text-sm p-2 rounded-md transition-colors",
                             stop.arrived ? "bg-green-100 dark:bg-green-900/30" : "hover:bg-muted/50" // Add background if arrived
                        )}
                    >
                       {/* Stop Name and Time */}
                       <div className="flex items-center gap-3 flex-grow">
                         {/* Icon based on arrival status */}
                         {stop.arrived ? (
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                         ) : (
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                         )}
                         <span className={cn(stop.arrived && "line-through text-muted-foreground")}>
                            {stop.name}
                         </span>
                          <span className={cn("ml-auto flex items-center text-xs text-muted-foreground", stop.arrived && "line-through")}>
                            <Clock className="mr-1 h-3 w-3" />
                            {stop.time}
                          </span>
                       </div>

                       {/* "Mark Arrived" Button */}
                       {isTrackingOn && !stop.arrived && (
                           <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onToggleStopArrival(index, true)}
                                className="ml-4 h-7 px-2 text-xs" // Smaller button
                            >
                                Mark Arrived
                           </Button>
                       )}
                       {/* Display checkmark if arrived and tracking */}
                        {isTrackingOn && stop.arrived && (
                            <CheckCircle className="ml-4 h-5 w-5 text-green-600 shrink-0" />
                       )}
                    </li>
                ))}
                </ul>
             </ScrollArea>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 pt-6 border-t">
        <Button onClick={onStartTrip} disabled={isTrackingOn} variant={isTrackingOn ? "secondary" : "default"} className="w-full">
          <Play className="mr-2 h-4 w-4" /> Start Trip
        </Button>
        <Button onClick={onScanAttendance} disabled={!isTrackingOn} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <ScanLine className="mr-2 h-4 w-4" /> Scan Attendance
        </Button>
         <Button onClick={onEndTrip} disabled={!isTrackingOn} variant={isTrackingOn ? "destructive" : "secondary"} className="w-full">
            <Square className="mr-2 h-4 w-4" /> End Trip
         </Button>
      </div>

      {/* Notify Delay Button & SOS/Navigation Footer */}
       <div className="flex flex-col sm:flex-row items-center gap-3 p-6 pt-4 pb-4 border-t">
            {/* Notify Delay Button - Opens Modal */}
             <AlertDialog open={isDelayModalOpen} onOpenChange={setIsDelayModalOpen}>
                <AlertDialogTrigger asChild>
                 <Button variant="outline" disabled={!isTrackingOn} className="w-full sm:w-1/2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                     <AlertTriangle className="mr-2 h-4 w-4" /> Notify Delay
                 </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Notify Passengers of Delay</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a brief reason for the delay (e.g., Traffic, Breakdown). This will be sent as a notification.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                     <div className="grid gap-2 py-2">
                        <Label htmlFor="delay-reason">Reason for Delay</Label>
                        <Input
                            id="delay-reason"
                            value={delayReason}
                            onChange={(e) => setDelayReason(e.target.value)}
                            placeholder="e.g., Heavy traffic on main road"
                            disabled={isSubmittingDelay}
                        />
                    </div>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmittingDelay}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelaySubmit} disabled={!delayReason.trim() || isSubmittingDelay}>
                        {isSubmittingDelay ? 'Sending...' : 'Send Notification'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

            {/* SOS/Navigation Link */}
            <Link href="/driver/sos-navigation" passHref className="w-full sm:w-1/2">
                <Button variant="outline" className="w-full justify-center text-sm">
                    <Navigation className="mr-2 h-4 w-4" /> SOS & Navigation
                </Button>
            </Link>
       </div>
    </div>
  );
};

export default DutyDashboardCard;
