"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Plus, MapPin } from 'lucide-react';
import type { BusRouteData, RouteStopData } from '@/app/admin/routes/page'; // Import types from page
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Zod schema for a single stop
const stopSchema = z.object({
  name: z.string().min(1, "Stop name is required."),
  // Basic coordinate validation (adjust regex/type as needed)
  lat: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number({ invalid_type_error: "Latitude must be a number" }).min(-90).max(90)
  ),
  lng: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number({ invalid_type_error: "Longitude must be a number" }).min(-180).max(180)
  ),
});

// Zod schema for the entire route form
const routeSchema = z.object({
  name: z.string().min(3, "Route name must be at least 3 characters."),
  description: z.string().optional(),
  stops: z.array(stopSchema).min(2, "At least two stops are required for a route."),
});

// Infer the type from the schema
type RouteFormValues = z.infer<typeof routeSchema>;

interface AddEditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BusRouteData, 'id'> | BusRouteData) => Promise<void>; // Pass data up
  routeData: BusRouteData | null; // Null for adding, existing data for editing
}

const AddEditRouteModal: FC<AddEditRouteModalProps> = ({ isOpen, onClose, onSubmit, routeData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!routeData;

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: '',
      description: '',
      stops: [{ name: '', lat: 0, lng: 0 }, { name: '', lat: 0, lng: 0 }], // Start with two empty stops
    },
  });

   // Field array for dynamic stops
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  // Reset form when modal opens or routeData changes
  useEffect(() => {
    if (isOpen) {
        if (routeData) {
            // Editing: Populate form with existing data
            form.reset({
                name: routeData.name,
                description: routeData.description,
                // Map coordinates from routeData to form values
                stops: routeData.stops.map(stop => ({
                    name: stop.name,
                    lat: stop.coordinates.lat,
                    lng: stop.coordinates.lng
                })),
            });
        } else {
            // Adding: Reset to default values (or empty)
             form.reset({
                name: '',
                description: '',
                stops: [{ name: '', lat: 0, lng: 0 }, { name: '', lat: 0, lng: 0 }],
             });
        }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, routeData, form.reset]); // Dependency on form.reset is important

  const handleFormSubmit = async (data: RouteFormValues) => {
    setIsSubmitting(true);
     console.log("Form Data Submitted:", data);

    // Map form data back to BusRouteData structure for submission
    const processedData: Omit<BusRouteData, 'id'> | BusRouteData = {
        ...(routeData?.id && { id: routeData.id }), // Include id if editing
        name: data.name,
        description: data.description || '', // Ensure description is always a string
        stops: data.stops.map((stop, index) => ({
             name: stop.name,
             coordinates: { lat: stop.lat, lng: stop.lng },
             order: index + 1, // Assign order based on array index
        })),
    };

    try {
        await onSubmit(processedData); // Call the onSubmit prop passed from the parent
        toast({
            title: isEditing ? "Route Updated" : "Route Added",
            description: `Route "${data.name}" has been successfully ${isEditing ? 'updated' : 'added'}.`,
        });
        // onClose(); // Let the parent handle closing via the onSubmit success path
    } catch (error) {
        console.error("Failed to save route:", error);
        toast({
            title: "Error",
            description: `Failed to ${isEditing ? 'update' : 'add'} route. Please try again.`,
            variant: "destructive",
        });
         setIsSubmitting(false); // Re-enable button on error
    }
     // Do not set isSubmitting to false here if success closes the modal
  };

   // Function to add a new empty stop field
   const addStop = () => {
     append({ name: '', lat: 0, lng: 0 });
   };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl"> {/* Wider modal for stops */}
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Bus Route' : 'Add New Bus Route'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modify the details for this bus route.' : 'Enter the details for the new bus route.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <ScrollArea className="max-h-[65vh] p-1 pr-4"> {/* Scrollable content */}
                <div className="grid gap-6 py-4 pr-1">
                    {/* Route Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Route Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., North Campus Line" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                     {/* Route Description */}
                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="e.g., Connects main campus gates to the library..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {/* Stops Section */}
                    <div className="space-y-4">
                        <FormLabel>Stops (Minimum 2)</FormLabel>
                         {fields.map((field, index) => (
                         <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md bg-secondary/50 relative">
                            <MapPin className="h-5 w-5 mt-2.5 text-primary flex-shrink-0" />
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-grow">
                                <FormField
                                    control={form.control}
                                    name={`stops.${index}.name`}
                                    render={({ field }) => (
                                    <FormItem className="sm:col-span-3">
                                        <FormLabel className="text-xs">Stop Name</FormLabel>
                                        <FormControl>
                                        <Input placeholder={`Stop ${index + 1} Name`} {...field} />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`stops.${index}.lat`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Latitude</FormLabel>
                                        <FormControl>
                                        <Input type="number" step="any" placeholder="e.g., 37.7749" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`stops.${index}.lng`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Longitude</FormLabel>
                                        <FormControl>
                                        <Input type="number" step="any" placeholder="e.g., -122.4194" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                    )}
                                />
                            </div>
                             {/* Remove Stop Button */}
                             {fields.length > 2 && ( // Only show remove if more than 2 stops
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 text-destructive hover:bg-destructive/10"
                                    onClick={() => remove(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                             )}
                         </div>
                        ))}
                         {/* Add Stop Button */}
                         <Button type="button" variant="outline" size="sm" onClick={addStop}>
                             <Plus className="mr-2 h-4 w-4" /> Add Stop
                         </Button>
                          {/* Show error if less than 2 stops */}
                          {form.formState.errors.stops && typeof form.formState.errors.stops === 'object' && 'message' in form.formState.errors.stops && (
                             <p className="text-sm font-medium text-destructive">{form.formState.errors.stops.message}</p>
                          )}
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="mt-6 pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Route' : 'Add Route')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditRouteModal;
