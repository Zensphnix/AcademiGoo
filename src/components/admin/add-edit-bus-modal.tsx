
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
import type { BusData } from '@/app/admin/buses/page'; // Import type from page

// Zod schema for the bus form
const busSchema = z.object({
  // Registration Number (ID) - make it required, but might be disabled when editing
  id: z.string().min(5, "Registration No. is required and should be valid.").regex(/^[A-Z0-9\s]+$/, "Invalid format (use uppercase letters, numbers, spaces)"),
  model: z.string().min(3, "Model name must be at least 3 characters."),
  capacity: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number({ invalid_type_error: "Capacity must be a number" }).min(10, "Capacity must be at least 10").max(100, "Capacity seems too high")
  ),
  status: z.enum(['Active', 'Maintenance', 'Inactive'], { required_error: "Please select a status." }),
});

// Infer the type from the schema
type BusFormValues = z.infer<typeof busSchema>;

interface AddEditBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusFormValues) => Promise<void>; // Pass validated data up
  busData: BusData | null; // Null for adding, existing data for editing
}

const AddEditBusModal: FC<AddEditBusModalProps> = ({ isOpen, onClose, onSubmit, busData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!busData;

  const form = useForm<BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      id: '',
      model: '',
      capacity: 0,
      status: 'Active', // Default status
    },
  });

  // Reset form when modal opens or busData changes
  useEffect(() => {
    if (isOpen) {
      if (busData) {
        // Editing: Populate form with existing data
        form.reset({
          id: busData.id,
          model: busData.model,
          capacity: busData.capacity,
          status: busData.status,
          // assignedRoute is not part of the form, handled separately if needed
        });
      } else {
        // Adding: Reset to default values
        form.reset({
          id: '',
          model: '',
          capacity: 0, // Or a sensible default like 40
          status: 'Active',
        });
      }
    }
  }, [isOpen, busData, form.reset]); // Added form.reset dependency

  const handleFormSubmit = async (data: BusFormValues) => {
    setIsSubmitting(true);
    console.log("Bus Form Data Submitted:", data);

    try {
      // Pass the validated data to the parent onSubmit handler
      await onSubmit(data);
      // Success/toast is handled in the parent component after state update
      // The parent will close the modal via props
    } catch (error) {
      console.error("Failed to save bus:", error);
      // Error toast could be shown here or in parent
      setIsSubmitting(false); // Re-enable button on error
    }
    // Don't set isSubmitting to false here if success closes the modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Bus Details' : 'Add New Bus'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the information for this bus.' : 'Enter the details for the new bus.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            {/* Registration Number (ID) */}
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration No.</FormLabel>
                  <FormControl>
                    {/* Disable ID field when editing */}
                    <Input placeholder="e.g., DL 1A 1234" {...field} disabled={isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tata Marcopolo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 45" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Bus' : 'Add Bus')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditBusModal;
