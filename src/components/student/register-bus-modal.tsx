
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { BusFront, RefreshCcw } from 'lucide-react'; // Added RefreshCcw for update

interface RegisterBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRoutes: string[];
  onSubmit: (selectedRoute: string) => Promise<void>; // Make onSubmit async
  currentRegisteredRoute?: string; // Optional: Show current registration
}

const RegisterBusModal: FC<RegisterBusModalProps> = ({
  isOpen,
  onClose,
  availableRoutes,
  onSubmit,
  currentRegisteredRoute,
}) => {
  // Initialize selectedRoute with currentRegisteredRoute if available
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>(currentRegisteredRoute);
  const [isSubmitting, setIsSubmitting] = useState(false);

   // Effect to update selectedRoute if currentRegisteredRoute prop changes after mount
   useEffect(() => {
     setSelectedRoute(currentRegisteredRoute);
   }, [currentRegisteredRoute, isOpen]); // Re-sync when modal opens or prop changes

  const handleSubmit = async () => {
    if (!selectedRoute) return;
    setIsSubmitting(true);
    try {
        await onSubmit(selectedRoute);
        // Success is handled by the parent via toast and closing the modal
        // The parent will close the modal by setting isOpen to false
    } catch (error) {
        console.error("Bus registration/update failed:", error);
        // Optionally show an error toast here if not handled by parent
        setIsSubmitting(false); // Ensure button is re-enabled on error
    }
    // Do not reset submitting state here, let parent handle modal close which resets the component or rely on useEffect
  };

   const getButtonText = () => {
     if (isSubmitting) return 'Processing...';
     if (!selectedRoute) return 'Select a Route';
     if (currentRegisteredRoute) {
        return selectedRoute === currentRegisteredRoute ? 'Currently Registered' : 'Update Route';
     }
     return 'Register Route';
   };

   const getButtonIcon = () => {
      if (isSubmitting) return <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />;
      if (currentRegisteredRoute && selectedRoute !== currentRegisteredRoute) {
        return <RefreshCcw className="mr-2 h-4 w-4" />;
      }
       return <BusFront className="mr-2 h-4 w-4" />;
   }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
             onClose();
             // Reset state when closing
             setIsSubmitting(false);
             setSelectedRoute(currentRegisteredRoute); // Reset selection to current registered route
        }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <BusFront className="h-5 w-5 text-primary" />
              {currentRegisteredRoute ? 'Update Your Registered Bus Route' : 'Register Your Bus Route'}
          </DialogTitle>
          <DialogDescription>
            Select the primary bus route you use for commuting. This helps us manage services better.
             {currentRegisteredRoute && <span className="block text-xs mt-1">Currently registered: <strong>{currentRegisteredRoute}</strong></span>}
             {!currentRegisteredRoute && <span className="block text-xs mt-1">You have not registered a route yet.</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="bus-route-select">Select Route</Label>
          <Select
            onValueChange={setSelectedRoute}
            value={selectedRoute} // Control the select value
            disabled={isSubmitting}
          >
            <SelectTrigger id="bus-route-select">
              <SelectValue placeholder="Choose your route..." />
            </SelectTrigger>
            <SelectContent>
              {availableRoutes.map(route => (
                <SelectItem key={route} value={route}>{route}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!selectedRoute || isSubmitting || selectedRoute === currentRegisteredRoute}
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]" // Added min-width for consistent size
          >
             {getButtonIcon()}
             {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterBusModal;
