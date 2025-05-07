
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Removed Card imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Phone, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Import AlertDialog components

const complaintSchema = z.object({
  issueType: z.string({ required_error: "Please select the type of issue." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description cannot exceed 500 characters." }),
  photo: z.instanceof(File).optional(), // Allow optional file upload
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

// Mock contact info (Updated)
const transportDepartment = "Transport Department - K.R. Mangalam University";
const transportOfficeLocation = "Block A, Ground Floor, KRMU Campus";
const transportOfficeContact = "+91-9876543210";
const transportOfficeEmail = "transport@university.edu";
const transportOfficeHours = "8:00 AM – 6:00 PM (Monday to Saturday)";

// Key for localStorage
const LOCAL_STORAGE_COMPLAINTS_KEY = 'newlySubmittedComplaints';

const ComplaintForm: FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      issueType: undefined,
      description: '',
      photo: undefined,
    },
  });

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional: size, type)
      if (file.size > 5 * 1024 * 1024) { // Example: 5MB limit
          toast({ variant: 'destructive', title: 'File Too Large', description: 'Please upload an image smaller than 5MB.' });
          form.setValue('photo', undefined); // Clear the invalid file
          setSelectedFileName(null);
          event.target.value = ''; // Reset file input visually
          return;
      }
       form.setValue('photo', file);
       setSelectedFileName(file.name);
    } else {
       form.setValue('photo', undefined);
       setSelectedFileName(null);
    }
  };


  const onSubmit = async (data: ComplaintFormValues) => {
    setIsSubmitting(true);
    console.log('Submitting complaint:', data);

    // Simulate API call with FormData if photo exists
    const formData = new FormData();
    formData.append('issueType', data.issueType);
    formData.append('description', data.description);
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    // --- Simulation ---
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    toast({
      title: "Complaint Submitted",
      description: "Thank you! Your complaint has been received and will be reviewed. You can check its status later.", // Updated description
    });

    // --- Store locally for immediate reflection ---
     try {
        const newComplaint = {
            // Generate a temporary client-side ID until a real ID comes from the server
            id: `temp-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`,
            type: data.issueType,
            description: data.description,
            submittedAt: new Date(),
            status: 'Pending' as const, // Default status
            // photoUrl: data.photo ? URL.createObjectURL(data.photo) : undefined // Optional: Create temporary URL if needed immediately
        };

        const existingComplaintsRaw = localStorage.getItem(LOCAL_STORAGE_COMPLAINTS_KEY);
        const existingComplaints = existingComplaintsRaw ? JSON.parse(existingComplaintsRaw) : [];
        // Prepend new complaint to show at the top
        existingComplaints.unshift(newComplaint);
        localStorage.setItem(LOCAL_STORAGE_COMPLAINTS_KEY, JSON.stringify(existingComplaints));

        console.log("Complaint stored locally:", newComplaint);

         // Dispatch a storage event to notify other components/tabs
         window.dispatchEvent(new StorageEvent('storage', {
             key: LOCAL_STORAGE_COMPLAINTS_KEY,
             newValue: JSON.stringify(existingComplaints),
             // oldValue: existingComplaintsRaw, // Optional
             storageArea: localStorage,
         }));

    } catch (error) {
        console.error("Failed to store complaint locally:", error);
        toast({
            title: "Local Storage Error",
            description: "Could not temporarily save the complaint in your browser.",
            variant: "destructive",
        });
    }
    // --- End Local Storage Logic ---


    form.reset(); // Reset form after submission
    setSelectedFileName(null); // Clear file name display
  };

  return (
    // Replaced Card with div and applied styling
    <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-lg">
      {/* Equivalent to CardHeader */}
      <div className="p-6 space-y-1.5">
        <h2 className="text-xl text-primary font-semibold">Submit a Complaint</h2>
        <p className="text-sm text-muted-foreground">Report any issues regarding the bus service.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Equivalent to CardContent */}
          <div className="p-6 pt-0 space-y-6">
             {/* Issue Type Dropdown - options match wireframe */}
            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Issue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the main issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="Late Arrival">Late Arrival</SelectItem>
                      <SelectItem value="Driver Behavior">Driver Behavior</SelectItem>
                      <SelectItem value="Overcrowded">Overcrowded</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Description Text Area */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                     {/* Placeholder matches wireframe */}
                    <Textarea
                      placeholder="Describe the issue briefly…"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                     Please provide specific details like date, time, and route if possible.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload Field */}
             <FormField
                control={form.control}
                name="photo"
                // No render prop needed if using standard Input type="file" and onChange handler
                render={({ field: { ref, name, onBlur, onChange: rhfOnChange, ...restField } }) => ( // Destructure carefully
                 <FormItem>
                   <FormLabel>Attach Photo (Optional)</FormLabel>
                   <FormControl>
                     {/* Wrapper for custom appearance */}
                     <div className="flex items-center gap-3">
                       <Button type="button" variant="outline" className="relative overflow-hidden cursor-pointer">
                         <Upload className="mr-2 h-4 w-4" />
                         <span>{selectedFileName ? "Change Photo" : "Attach Photo"}</span>
                         <Input
                           {...restField} // Spread remaining field props
                           ref={ref} // Pass the ref
                           name={name} // Pass the name
                           onBlur={onBlur} // Pass the onBlur
                           type="file"
                           accept="image/*"
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           // Use our custom onChange handler which calls RHF's onChange internally
                           onChange={handleFileChange}
                         />
                       </Button>
                       {selectedFileName && (
                         <span className="text-sm text-muted-foreground truncate" title={selectedFileName}>
                           {selectedFileName}
                         </span>
                       )}
                     </div>
                   </FormControl>
                   <FormDescription>
                     Max file size: 5MB. Accepted formats: JPG, PNG, GIF.
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

          </div>
          {/* Equivalent to CardFooter */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 pt-6 border-t gap-4">
             {/* Call Transport Office Button - uses AlertDialog */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline">
                        <Phone className="mr-2 h-4 w-4" /> Call Transport Office
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Contact Transport Office</AlertDialogTitle>
                         {/* Updated contact details */}
                         <AlertDialogDescription className="text-left space-y-2 pt-2">
                             <p className="font-semibold">{transportDepartment}</p>
                             <p>📍 <span className="font-medium">Location:</span> {transportOfficeLocation}</p>
                             <p>📞 <span className="font-medium">Phone:</span> <a href={`tel:${transportOfficeContact}`} className="text-primary hover:underline">{transportOfficeContact}</a></p>
                             <p>✉️ <span className="font-medium">Email:</span> <a href={`mailto:${transportOfficeEmail}`} className="text-primary hover:underline">{transportOfficeEmail}</a></p>
                             <p>🕘 <span className="font-medium">Hours:</span> {transportOfficeHours}</p>
                         </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <a href={`tel:${transportOfficeContact}`} className="bg-primary text-primary-foreground hover:bg-primary/90">Call Now</a>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
              {/* Submit Button matches wireframe */}
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ComplaintForm;
