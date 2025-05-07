
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { UserData, UserRole } from './user-management-table'; // Import types

// Zod schema for the user form
const userSchema = z.object({
  // ID is handled separately (generated on add, read-only on edit)
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(['Student', 'Teacher', 'Driver'], { required_error: "Please select a role." }),
  // Password might be needed for adding, but not editing (handled separately for security)
  // assignedBus and status are not edited directly in this form
});

// Infer the type from the schema
type UserFormValues = z.infer<typeof userSchema>;

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormValues | UserData) => Promise<void>; // Pass validated data or full UserData up
  userData: UserData | null; // Null for adding, existing data for editing
}

const AddEditUserModal: FC<AddEditUserModalProps> = ({ isOpen, onClose, onSubmit, userData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!userData;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined, // Default role
    },
  });

  // Reset form when modal opens or userData changes
  useEffect(() => {
    if (isOpen) {
      if (userData) {
        // Editing: Populate form with existing data
        form.reset({
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
      } else {
        // Adding: Reset to default values
        form.reset({
          name: '',
          email: '',
          role: undefined,
        });
      }
    }
  }, [isOpen, userData, form.reset]); // Added form.reset dependency

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    console.log("User Form Data Submitted:", data);

    try {
        // If editing, include the existing ID, status, and assignedBus
        const submitData = isEditing && userData
            ? { ...userData, ...data } // Merge form data with existing immutable fields
            : data; // Pass only form data if adding

      // Pass the processed data to the parent onSubmit handler
      await onSubmit(submitData);
      // Success/toast is handled in the parent component after state update
      // The parent will close the modal via props
    } catch (error) {
      console.error("Failed to save user:", error);
      // Error toast could be shown here or in parent
      setIsSubmitting(false); // Re-enable button on error
    }
    // Don't set isSubmitting to false here if success closes the modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User Details' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the information for this user.' : 'Enter the details for the new user.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            {/* Display User ID if editing (read-only) */}
            {isEditing && userData && (
                <div className="grid gap-2">
                    <Label htmlFor="user-id">User ID</Label>
                    <Input id="user-id" value={userData.id} readOnly disabled className="bg-muted" />
                </div>
            )}

            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., user@university.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Driver">Driver</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Add Password field only when Adding a new user? Needs careful consideration */}
             {/* {!isEditing && (
                 <FormField
                     control={form.control}
                     name="password" // Assuming password field in schema for add mode
                     render={({ field }) => (
                         <FormItem>
                             <FormLabel>Password</FormLabel>
                             <FormControl>
                                 <Input type="password" placeholder="Create initial password" {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                     )}
                 />
             )} */}


            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update User' : 'Add User')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditUserModal;
