
"use client"; // Required for state and interactivity

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; // Added Edit, Trash2
import AddEditRouteModal from '@/components/admin/add-edit-route-modal'; // Import the modal component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock data structure for routes (remains the same)
export interface RouteStopData {
  name: string;
  coordinates: { lat: number; lng: number };
  order: number;
}

export interface BusRouteData {
  id: string;
  name: string;
  description: string;
  stops: RouteStopData[];
}

// Define and export the localStorage key
export const ADMIN_ROUTES_LOCAL_STORAGE_KEY = 'adminBusRoutes';

// Mock function to simulate saving a route (replace with API call)
// This function doesn't need to manage state anymore, just simulates the backend action
const saveRouteToBackend = async (routeData: Omit<BusRouteData, 'id'> | BusRouteData): Promise<BusRouteData> => {
  const isEditing = 'id' in routeData;
  console.log(`Simulating ${isEditing ? 'update' : 'add'} route to backend:`, routeData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, you'd get the ID/confirmation from the backend response
  const savedRoute: BusRouteData = isEditing
    ? routeData
    : { ...routeData, id: `ROUTE_${Date.now()}` }; // Assign a mock ID if adding
  return savedRoute;
};

// Mock function to simulate deleting a route from backend
const deleteRouteFromBackend = async (routeId: string): Promise<boolean> => {
    console.log(`Simulating delete route with ID ${routeId} from backend`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return true on success, false on failure (or throw error)
    return true;
}

const AdminRoutesPage: FC = () => {
  const [routes, setRoutes] = useState<BusRouteData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRouteData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { toast } = useToast();

  // Load routes from localStorage on initial mount
  useEffect(() => {
    setIsLoading(true);
    try {
        const storedRoutes = localStorage.getItem(ADMIN_ROUTES_LOCAL_STORAGE_KEY);
        if (storedRoutes) {
            setRoutes(JSON.parse(storedRoutes));
        } else {
            // If localStorage is empty, initialize with default mock data (if any) or an empty array
            // const initialMockRoutes: BusRouteData[] = []; // Or load some defaults
            // setRoutes(initialMockRoutes);
            // persistRoutes(initialMockRoutes); // Save initial data
            setRoutes([]); // Start with empty if nothing stored
        }
    } catch (error) {
        console.error("Failed to load routes from localStorage:", error);
        toast({ title: "Error", description: "Could not load saved routes.", variant: "destructive" });
        setRoutes([]); // Fallback to empty array on error
    } finally {
        setIsLoading(false);
    }
  }, [toast]); // Include toast in dependency array

  // Function to save routes to localStorage and dispatch event
  const persistRoutes = (updatedRoutes: BusRouteData[]) => {
      try {
           const currentData = localStorage.getItem(ADMIN_ROUTES_LOCAL_STORAGE_KEY);
           const newData = JSON.stringify(updatedRoutes);
           localStorage.setItem(ADMIN_ROUTES_LOCAL_STORAGE_KEY, newData);

           // Dispatch storage event
           window.dispatchEvent(new StorageEvent('storage', {
               key: ADMIN_ROUTES_LOCAL_STORAGE_KEY,
               oldValue: currentData,
               newValue: newData,
               storageArea: localStorage,
           }));
      } catch (error) {
          console.error("Failed to save routes to localStorage:", error);
          toast({ title: "Error", description: "Could not save route changes locally.", variant: "destructive" });
      }
  };


  // Function to handle opening the modal for adding a new route
  const handleAddNewRoute = () => {
    setEditingRoute(null); // Ensure we are adding, not editing
    setIsModalOpen(true);
  };

   // Function to handle opening the modal for editing an existing route
   const handleEditRoute = (route: BusRouteData) => {
     setEditingRoute(route);
     setIsModalOpen(true);
   };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null); // Clear editing state when closing
  };

  // Function to handle form submission from the modal
  const handleSaveRoute = async (routeData: Omit<BusRouteData, 'id'> | BusRouteData) => {
     const isEditingExisting = 'id' in routeData && !!editingRoute; // Check if we are actually editing
    try {
        // Simulate backend save first
        const savedRoute = await saveRouteToBackend(routeData);

        // Update local state and persist
        let updatedRoutes: BusRouteData[];
         if (isEditingExisting) {
            // Editing logic: Replace the old route with the updated one
            updatedRoutes = routes.map(r => (r.id === savedRoute.id ? savedRoute : r));
        } else {
            // Adding logic: Add the new route to the state
            updatedRoutes = [...routes, savedRoute];
        }
        setRoutes(updatedRoutes);
        persistRoutes(updatedRoutes); // Save to localStorage

        handleCloseModal(); // Close modal after successful save
        // Toast is handled within the modal component now
    } catch (error) {
        console.error("Failed to save route:", error);
        // Error toast is handled within the modal component now
    }
  };

    // Function to handle deleting a route
    const handleDeleteRoute = async (routeId: string, routeName: string) => {
      // Add confirmation dialog here for safety
      if (!confirm(`Are you sure you want to delete the route "${routeName}"? This action cannot be undone.`)) {
          return;
      }
      try {
          const success = await deleteRouteFromBackend(routeId); // Simulate backend deletion
          if (success) {
              const updatedRoutes = routes.filter(r => r.id !== routeId);
              setRoutes(updatedRoutes);
              persistRoutes(updatedRoutes); // Save to localStorage
              toast({
                  title: "Route Deleted",
                  description: `Route "${routeName}" has been successfully deleted.`,
              });
          } else {
               throw new Error("Deletion failed on server.");
          }
      } catch (error) {
          console.error("Failed to delete route:", error);
          toast({
              title: "Error Deleting Route",
              description: `Could not delete route "${routeName}". Please try again.`,
              variant: "destructive",
          });
      }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-semibold text-foreground">Manage Bus Routes</h2>
          {/* Updated Button with onClick handler */}
          <Button onClick={handleAddNewRoute}>
             <PlusCircle className="mr-2 h-4 w-4" /> Add New Route
          </Button>
      </div>

      {/* Route List Section */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6 space-y-1.5">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Existing Routes</h3>
          <p className="text-sm text-muted-foreground">View, edit, or remove bus routes and their stops.</p>
           {/* Add search/filter for routes here */}
        </div>
        <div className="p-6 pt-0"> {/* Equivalent to CardContent */}
          {/* Display route list/table */}
           {isLoading ? (
                // Show skeletons while loading initial data
                 <div className="space-y-2 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
           ) : routes.length === 0 ? (
                <div className="text-center text-muted-foreground p-10 border rounded-md">
                    No routes added yet. Click "Add New Route" to start.
                </div>
           ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center">Stops</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {routes.map((route) => (
                            <TableRow key={route.id}>
                                <TableCell className="font-medium">{route.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={route.description}>
                                    {route.description || 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">{route.stops.length}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRoute(route)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit Route</span>
                                    </Button>
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive h-8 w-8"
                                        onClick={() => handleDeleteRoute(route.id, route.name)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete Route</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
           )}
        </div>
      </div>

       {/* Add/Edit Route Modal */}
       <AddEditRouteModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         onSubmit={handleSaveRoute}
         routeData={editingRoute} // Pass null for adding, or existing data for editing
       />
    </div>
  );
};

export default AdminRoutesPage;
