
"use client"; // Required for state, effects, and interactivity

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; // Removed Bus icon, already used
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AddEditBusModal from '@/components/admin/add-edit-bus-modal'; // Import the modal

// Mock data structure for buses
export interface BusData {
  id: string; // Vehicle registration number
  model: string;
  capacity: number;
  assignedRoute?: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

// Export the key so other components can listen for changes
export const ADMIN_BUSES_LOCAL_STORAGE_KEY = 'adminBusFleet';

// Initial mock data (will be overwritten by localStorage if available)
const initialMockBusesData: BusData[] = [
    { id: 'HR 26 B 7890', model: 'Tata Marcopolo', capacity: 45, assignedRoute: 'South Campus Express', status: 'Active' },
    { id: 'DL 1A 4567', model: 'Ashok Leyland Lynx', capacity: 40, assignedRoute: 'North Campus Line', status: 'Active' },
    { id: 'UP 15 C 1122', model: 'Eicher Skyline Pro', capacity: 50, assignedRoute: 'East Wing Shuttle', status: 'Maintenance' },
    { id: 'MH 01 Z 9988', model: 'Force Traveller', capacity: 26, status: 'Inactive' },
];

const AdminBusesPage: FC = () => {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const { toast } = useToast();

   // Load buses from localStorage on initial mount
   useEffect(() => {
     setIsLoading(true);
     try {
         const storedBuses = localStorage.getItem(ADMIN_BUSES_LOCAL_STORAGE_KEY);
         if (storedBuses) {
             setBuses(JSON.parse(storedBuses));
         } else {
             // Initialize with default mock data if nothing in storage
             setBuses(initialMockBusesData);
             localStorage.setItem(ADMIN_BUSES_LOCAL_STORAGE_KEY, JSON.stringify(initialMockBusesData));
         }
     } catch (error) {
         console.error("Failed to load buses from localStorage:", error);
         setBuses(initialMockBusesData); // Fallback to initial data
         toast({ title: "Error", description: "Could not load saved bus data.", variant: "destructive" });
     } finally {
         setIsLoading(false);
     }
   }, [toast]);

    // Function to save buses to localStorage and dispatch event
   const persistBuses = (updatedBuses: BusData[]) => {
       try {
           const currentData = localStorage.getItem(ADMIN_BUSES_LOCAL_STORAGE_KEY);
           const newData = JSON.stringify(updatedBuses);

           localStorage.setItem(ADMIN_BUSES_LOCAL_STORAGE_KEY, newData);

            // Dispatch a storage event so other tabs/windows (like the dashboard) can react
           window.dispatchEvent(new StorageEvent('storage', {
               key: ADMIN_BUSES_LOCAL_STORAGE_KEY,
               oldValue: currentData,
               newValue: newData,
               storageArea: localStorage,
           }));

       } catch (error) {
           console.error("Failed to save buses to localStorage:", error);
           toast({ title: "Error", description: "Could not save bus changes locally.", variant: "destructive" });
       }
   };

   // Function to handle opening the modal for adding a new bus
   const handleAddNewBus = () => {
     setEditingBus(null); // Ensure we are adding
     setIsModalOpen(true);
   };

    // Function to handle opening the modal for editing an existing bus
   const handleEditBus = (bus: BusData) => {
     setEditingBus(bus);
     setIsModalOpen(true);
   };

   // Function to handle closing the modal
   const handleCloseModal = () => {
     setIsModalOpen(false);
     setEditingBus(null); // Clear editing state
   };

   // Function to handle saving a bus (add or edit)
   const handleSaveBus = async (busData: Omit<BusData, 'id'> | BusData) => {
        // Simulate backend save (optional, as we use localStorage)
        console.log(`Simulating save bus:`, busData);
        await new Promise(resolve => setTimeout(resolve, 500));

        let updatedBuses: BusData[];
        const isEditing = 'id' in busData && !!editingBus; // Check if we are in edit mode

        if (isEditing) {
            // Editing logic: Replace the old bus with the updated one
             updatedBuses = buses.map(b => (b.id === busData.id ? (busData as BusData) : b));
        } else {
            // Adding logic: Assign a mock ID (Registration No. is the ID) and add
             const newBus: BusData = {
                ...(busData as Omit<BusData, 'id'>), // Cast to exclude id
                 id: (busData as { id: string }).id, // ID is the registration number entered in the form
                 assignedRoute: undefined, // Default assigned route to undefined initially
                 // Status is handled by the form
            };
             updatedBuses = [...buses, newBus];
        }
        setBuses(updatedBuses);
        persistBuses(updatedBuses); // Save to localStorage and dispatch event

        handleCloseModal(); // Close modal after successful save
        toast({
            title: isEditing ? "Bus Updated" : "Bus Added",
            description: `Bus "${('id' in busData ? busData.id : '')}" has been successfully ${isEditing ? 'updated' : 'added'}.`,
        });
    };


    // Function to handle deleting a bus
    const handleDeleteBus = async (busId: string, busModel: string) => {
        // Confirmation is handled by AlertDialog trigger
        console.log(`Simulating delete bus with ID ${busId} from backend`);
        await new Promise(resolve => setTimeout(resolve, 500));

        const updatedBuses = buses.filter(b => b.id !== busId);
        setBuses(updatedBuses);
        persistBuses(updatedBuses); // Save to localStorage and dispatch event
        toast({
            title: "Bus Removed",
            description: `Bus "${busModel} (${busId})" has been removed from the fleet.`,
            variant: "destructive"
        });
    };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-semibold text-foreground">Manage Buses</h2>
          <Button onClick={handleAddNewBus}>
             <PlusCircle className="mr-2 h-4 w-4" /> Add New Bus
          </Button>
      </div>

      {/* Bus List Section */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
         <div className="p-6 space-y-1.5">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Bus Fleet</h3>
            <p className="text-sm text-muted-foreground">View, add, edit, or remove buses from the fleet.</p>
           {/* Add search/filter for buses here */}
        </div>
        <div className="p-6 pt-0">
           {isLoading ? (
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
           ) : buses.length === 0 ? (
                <div className="text-center text-muted-foreground p-10 border rounded-md">
                    No buses added yet. Click "Add New Bus" to start.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Registration No.</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Assigned Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {buses.map((bus) => (
                        <TableRow key={bus.id}>
                        <TableCell className="font-medium">{bus.id}</TableCell>
                        <TableCell>{bus.model}</TableCell>
                        <TableCell>{bus.capacity}</TableCell>
                        <TableCell>{bus.assignedRoute || 'N/A'}</TableCell>
                            <TableCell>{bus.status}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditBus(bus)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Bus</span>
                            </Button>
                             {/* Delete Confirmation Dialog */}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove Bus</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently remove the bus "{bus.model} ({bus.id})" from the fleet.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteBus(bus.id, bus.model)} className="bg-destructive hover:bg-destructive/90">
                                        Delete Bus
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
           )}
        </div>
      </div>

       {/* Add/Edit Bus Modal */}
       <AddEditBusModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         onSubmit={handleSaveBus}
         busData={editingBus} // Pass null for adding, or existing data for editing
       />
    </div>
  );
};

export default AdminBusesPage;

