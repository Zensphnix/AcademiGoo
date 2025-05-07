
"use client";

import type { FC } from 'react'; // Import FC type
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle, // Renamed from DialogHeader for direct use
  DialogDescription,
  DialogFooter,
  DialogClose // Import DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Input } from '@/components/ui/input'; // Import Input
import { Label } from '@/components/ui/label'; // Import Label
import { Bus, UserCog, Trash2, ShieldCheck, UserX } from "lucide-react"; // Updated icons
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'; // Import dropdown items
import type { UserData } from './user-management-table'; // Import UserData type


// Define expected user prop structure
interface UserActionsProps {
  user: UserData; // Use the imported UserData type
   // Add callbacks for parent component to handle actual logic
   onAssignBus: (userId: string, busId: string) => Promise<void>;
   onEditUser: (user: UserData) => void; // Updated prop name and signature
   onToggleStatus: (userId: string, newStatus: 'Active' | 'Inactive') => Promise<void>;
   onRemoveUser: (userId: string) => Promise<void>;
   // Add mock bus data or fetch from props/API
   availableBuses: { id: string; name: string }[]; // Example structure
}


// Use named export
export const UserActions: FC<UserActionsProps> = ({
    user,
    onAssignBus,
    onEditUser, // Use the updated prop name
    onToggleStatus,
    onRemoveUser,
    availableBuses = [] // Provide default empty array
}) => {
  const { toast } = useToast();
  const [openAssign, setOpenAssign] = useState(false);
  // Edit modal state is now handled by the parent table component
  // const [openEdit, setOpenEdit] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false); // Combined activate/deactivate
  const [confirmRemove, setConfirmRemove] = useState(false);

  // State for modal inputs
  const [selectedBus, setSelectedBus] = useState<string | undefined>(user.assignedBus || undefined);
  // Edit form state is now handled by the parent modal
  // const [editedName, setEditedName] = useState(user.name);
  // const [editedEmail, setEditedEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Reset assign bus state when modal opens
   const handleAssignOpenChange = (open: boolean) => {
       setOpenAssign(open);
       if (open) {
           setSelectedBus(user.assignedBus || undefined);
       }
   };

  const handleAssignBusSubmit = async () => {
    if (!selectedBus) {
        toast({ title: "Selection Required", description: "Please select a bus to assign.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
        await onAssignBus(user.id, selectedBus);
        // Toast moved to parent handler
        setOpenAssign(false);
    } catch (error) {
        console.error("Assign Bus Error:", error);
        toast({ title: "Error", description: "Failed to assign bus. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  // Edit Info Submit is now handled by the parent modal's onSubmit
  /*
  const handleEditInfoSubmit = async () => {
    if (!editedName.trim() || !editedEmail.trim()) {
        toast({ title: "Invalid Input", description: "Name and email cannot be empty.", variant: "destructive" });
        return;
    }
     // Basic email validation (consider a library like zod for robust validation)
     if (!/^\S+@\S+\.\S+$/.test(editedEmail)) {
         toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
         return;
     }

    setIsSubmitting(true);
     try {
        await onEditInfo(user.id, { name: editedName.trim(), email: editedEmail.trim() });
        toast({ title: "Success", description: `User info updated for ${user.name}.` });
        setOpenEdit(false);
    } catch (error) {
        console.error("Edit Info Error:", error);
        toast({ title: "Error", description: "Failed to update user info. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  */

  const handleToggleStatusSubmit = async () => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setIsSubmitting(true);
     try {
        await onToggleStatus(user.id, newStatus);
        // Toast moved to parent handler
        setConfirmToggle(false);
    } catch (error) {
        console.error("Toggle Status Error:", error);
        toast({ title: "Error", description: `Failed to ${newStatus === 'Active' ? 'activate' : 'deactivate'} user. Please try again.`, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRemoveSubmit = async () => {
    setIsSubmitting(true);
    try {
        await onRemoveUser(user.id);
        // Toast moved to parent handler
        setConfirmRemove(false);
    } catch (error) {
        console.error("Remove User Error:", error);
        toast({ title: "Error", description: "Failed to remove user. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };


  // Determine action buttons based on user role and status
   const getActionItems = () => {
    const items = [];

    if (user.role === 'Driver') {
      items.push(
        <DropdownMenuItem key="assign-bus" onSelect={() => setOpenAssign(true)} disabled={isSubmitting}>
            <Bus size={16} className="mr-2" /> Assign Bus
        </DropdownMenuItem>
      );
    }

    items.push(
        // Call the onEditUser prop when Edit Info is selected
        <DropdownMenuItem key="edit-info" onSelect={() => onEditUser(user)} disabled={isSubmitting}>
             <UserCog size={16} className="mr-2" /> Edit Info
        </DropdownMenuItem>
    );

     items.push(<DropdownMenuSeparator key="sep1" />);

    if (user.status === 'Active') {
      items.push(
        <DropdownMenuItem key="deactivate" onSelect={() => setConfirmToggle(true)} disabled={isSubmitting} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <UserX size={16} className="mr-2" /> Deactivate User
        </DropdownMenuItem>
      );
    } else {
        items.push(
          <DropdownMenuItem key="activate" onSelect={() => setConfirmToggle(true)} disabled={isSubmitting} className="text-green-600 focus:text-green-700 focus:bg-green-500/10">
             <ShieldCheck size={16} className="mr-2" /> Activate User
        </DropdownMenuItem>
      );
    }

    items.push(
       <DropdownMenuItem key="remove" onSelect={() => setConfirmRemove(true)} disabled={isSubmitting} className="text-destructive focus:text-destructive focus:bg-destructive/10">
         <Trash2 size={16} className="mr-2" /> Remove User
       </DropdownMenuItem>
    );

    return items;
  };


  return (
    <>
       {/* Render DropdownMenu items directly */}
       {getActionItems()}

      {/* Assign Bus Dialog */}
      <Dialog open={openAssign} onOpenChange={handleAssignOpenChange}>
        <DialogContent>
          <DialogTitle>Assign Bus to {user.name}</DialogTitle>
          <DialogDescription>Select a bus route for this driver.</DialogDescription>
          <div className="py-4 space-y-2">
             <Label htmlFor="bus-select">Available Buses</Label>
            <Select onValueChange={setSelectedBus} value={selectedBus}>
              <SelectTrigger id="bus-select">
                <SelectValue placeholder="Select a bus..." />
              </SelectTrigger>
              <SelectContent>
                 {availableBuses.length > 0 ? (
                    availableBuses.map(bus => (
                        <SelectItem key={bus.id} value={bus.id}>{bus.name} ({bus.id})</SelectItem>
                    ))
                 ) : (
                    <SelectItem value="nobus" disabled>No buses available</SelectItem>
                 )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
             </DialogClose>
            <Button onClick={handleAssignBusSubmit} disabled={!selectedBus || isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Info Dialog - REMOVED (Handled by parent AddEditUserModal) */}
      {/*
      <Dialog open={openEdit} onOpenChange={handleEditOpenChange}>
        ...
      </Dialog>
      */}

      {/* Deactivate/Activate Confirmation */}
      <Dialog open={confirmToggle} onOpenChange={setConfirmToggle}>
        <DialogContent>
          <DialogTitle>{user.status === 'Active' ? 'Deactivate' : 'Activate'} {user.name}?</DialogTitle>
          <DialogDescription>
             {user.status === 'Active'
                ? 'This will prevent the user from logging in but retain their data.'
                : 'This will allow the user to log in again.'}
          </DialogDescription>
          <DialogFooter>
             <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
             </DialogClose>
             <Button
                variant={user.status === 'Active' ? 'destructive' : 'default'}
                className={user.status === 'Inactive' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                onClick={handleToggleStatusSubmit}
                disabled={isSubmitting}
             >
               {isSubmitting ? 'Processing...' : (user.status === 'Active' ? 'Confirm Deactivate' : 'Confirm Activate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent>
          <DialogTitle>Remove {user.name} permanently?</DialogTitle>
          <DialogDescription>This action cannot be undone. All user data will be deleted.</DialogDescription>
          <DialogFooter>
             <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
             </DialogClose>
            <Button variant="destructive" onClick={handleRemoveSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Removing...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
