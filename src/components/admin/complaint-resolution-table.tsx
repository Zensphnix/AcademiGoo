
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Eye, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns'; // Import format

type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'; // Added Rejected
type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical'; // Added Critical

// Renamed ComplaintData to avoid conflict if imported elsewhere, also added more fields
export interface AdminComplaintData {
  id: string;
  type: string;
  submittedBy: string;
  description: string;
  photoUrl?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  submittedAt: Date | string; // Allow string for initial load
  resolutionNotes?: string;
  user?: string; // Added from RecentComplaint type
  route?: string; // Added from RecentComplaint type
}

// localStorage key for complaints
export const ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY = 'adminComplaintsData';

// Initial Mock Data - Will be loaded only if localStorage is empty
const initialMockComplaints: AdminComplaintData[] = [
  { id: 'C001', type: 'Late Arrival', submittedBy: 'Shashi Sharma (S001)', description: 'Bus was 20 minutes late this morning without any notification.', priority: 'High', status: 'Pending', submittedAt: new Date(Date.now() - 86400000 * 1), user: 'Shashi Sharma', route: 'Route 3A' }, // Added user/route
  { id: 'C002', type: 'Driver Behavior', submittedBy: 'Amit Singh (S002)', description: 'The driver was talking on the phone while driving.', priority: 'High', status: 'Pending', submittedAt: new Date(Date.now() - 3600000 * 2), photoUrl: 'https://picsum.photos/seed/complaint2/300/200', user: 'Amit Singh', route: 'Route 5B' },
  { id: 'C003', type: 'Cleanliness', submittedBy: 'Priya Mehta (S003)', description: 'Seats were very dirty and sticky.', priority: 'Medium', status: 'In Progress', submittedAt: new Date(Date.now() - 86400000 * 3), user: 'Priya Mehta', route: 'Route 1C' },
  { id: 'C004', type: 'Overcrowded', submittedBy: 'Rahul Verma (S004)', description: 'Bus was dangerously overcrowded during peak hours.', priority: 'Medium', status: 'Resolved', submittedAt: new Date(Date.now() - 86400000 * 5), resolutionNotes: 'Adjusted schedule slightly and monitoring passenger counts.', user: 'Rahul Verma', route: 'Route 4A' },
  { id: 'C005', type: 'Other', submittedBy: 'Anita Desai (T001)', description: 'Bus AC was not working effectively during the afternoon trip.', priority: 'Low', status: 'Pending', submittedAt: new Date(Date.now() - 3600000 * 5), user: 'Anita Desai', route: 'N/A' },
  { id: 'C006', type: 'Bus Breakdown', submittedBy: 'Anjali Desai (S005)', description: 'Bus stopped suddenly mid-route.', priority: 'Critical', status: 'Pending', submittedAt: new Date(Date.now() - 3600000 * 1), user: 'Anjali Desai', route: 'Route 2D'}, // Added example matching recent complaints
];

interface ComplaintResolutionTableProps {
   // Props for API interaction if needed
}

const ComplaintResolutionTable: FC<ComplaintResolutionTableProps> = () => {
    const [complaints, setComplaints] = useState<AdminComplaintData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaintData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
    const { toast } = useToast();

    // Function to save complaints to localStorage and dispatch event
    const persistComplaints = (updatedComplaints: AdminComplaintData[]) => {
        try {
            // Ensure dates are stored as ISO strings for reliable JSON serialization
            const complaintsToStore = updatedComplaints.map(c => ({
                ...c,
                submittedAt: typeof c.submittedAt === 'string' ? c.submittedAt : c.submittedAt.toISOString(),
            }));
            const currentData = localStorage.getItem(ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY);
            const newData = JSON.stringify(complaintsToStore);

            localStorage.setItem(ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY, newData);

            // Dispatch a storage event so other tabs/windows (like the dashboard) can react
            window.dispatchEvent(new StorageEvent('storage', {
                key: ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY,
                oldValue: currentData,
                newValue: newData,
                storageArea: localStorage,
            }));

        } catch (error) {
            console.error("Failed to save complaints to localStorage:", error);
            toast({ title: "Error", description: "Could not save complaint changes locally.", variant: "destructive" });
        }
    };

     // Load complaints from localStorage on mount
     useEffect(() => {
        setIsLoading(true);
        try {
            const storedComplaintsRaw = localStorage.getItem(ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY);
            if (storedComplaintsRaw) {
                 // Parse and convert date strings back to Date objects
                 const parsedComplaints = JSON.parse(storedComplaintsRaw).map((c: any) => ({
                     ...c,
                     submittedAt: new Date(c.submittedAt), // Convert back to Date object
                 }));
                 setComplaints(parsedComplaints.sort((a: AdminComplaintData, b: AdminComplaintData) => b.submittedAt.getTime() - a.submittedAt.getTime())); // Sort newest first
            } else {
                // Initialize with default mock data if nothing in storage
                const sortedInitial = initialMockComplaints.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
                setComplaints(sortedInitial);
                persistComplaints(sortedInitial); // Save initial data
            }
        } catch (error) {
            console.error("Failed to load complaints from localStorage:", error);
             const sortedInitial = initialMockComplaints.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setComplaints(sortedInitial); // Fallback to initial data
            toast({ title: "Error", description: "Could not load saved complaint data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
     }, [toast]); // Run only once on mount (or when toast changes, which is stable)


    // Badge styling based on priority
    const getPriorityBadgeVariant = (priority: ComplaintPriority): "default" | "secondary" | "destructive" | "outline" => {
        switch (priority) {
            case 'Critical': return 'destructive'; // Critical takes precedence
            case 'High': return 'destructive'; // Use destructive for high as well
            case 'Medium': return 'secondary';
            case 'Low': return 'outline';
            default: return 'default';
        }
    };

    // Badge styling based on status
    const getStatusBadgeVariant = (status: ComplaintStatus): "default" | "secondary" | "destructive" | "outline" => {
         switch (status) {
            case 'Resolved': return 'default'; // Default (often green)
            case 'In Progress': return 'secondary'; // Secondary (often yellow/blue)
            case 'Pending': return 'outline'; // Outline (neutral)
            case 'Rejected': return 'destructive'; // Destructive (red)
            default: return 'outline';
        }
    };

     const openViewModal = (complaint: AdminComplaintData) => {
        setSelectedComplaint(complaint);
        setIsViewModalOpen(true);
    };

      const openResolveModal = (complaint: AdminComplaintData) => {
        setSelectedComplaint(complaint);
        setResolutionNotes(complaint.resolutionNotes || ''); // Pre-fill notes if editing
        setIsResolveModalOpen(true);
    };

     const handleMarkAsResolved = async () => {
        if (!selectedComplaint || !resolutionNotes.trim()) {
            toast({ title: "Error", description: "Resolution notes cannot be empty.", variant: "destructive" });
            return;
        }
        setIsSubmittingResolution(true);
        console.log(`Marking complaint ${selectedComplaint.id} as resolved with notes: ${resolutionNotes}`);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const updatedComplaints = complaints.map(c =>
            c.id === selectedComplaint.id
                ? { ...c, status: 'Resolved' as ComplaintStatus, resolutionNotes: resolutionNotes.trim() }
                : c
        );

        setComplaints(updatedComplaints); // Update local state
        persistComplaints(updatedComplaints); // Persist changes to localStorage

        toast({ title: "Complaint Resolved", description: `Complaint ID ${selectedComplaint.id} marked as resolved.` });
        setIsResolveModalOpen(false);
        setSelectedComplaint(null);
        setResolutionNotes('');
        setIsSubmittingResolution(false);
    };


    return (
        // Replaced Card with div and applied styling
         <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
           {/* Equivalent to CardHeader */}
           <div className="p-6 space-y-1.5">
             <h2 className="text-xl text-primary font-semibold">Complaint Resolution Queue</h2>
             <p className="text-sm text-muted-foreground">Review and manage user-submitted complaints.</p>
              {/* Add filtering/sorting options here if needed */}
           </div>
           {/* Equivalent to CardContent */}
           <div className="p-6 pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                           {/* Columns match wireframe */}
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted By</TableHead>
                         <TableHead>Date</TableHead>
                        <TableHead>Priority</TableHead>
                         <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead> {/* Combined View/Resolve */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 4 }).map((_, index) => ( // Show skeletons while loading
                            <TableRow key={`skel-complaint-${index}`}>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell> {/* Date */}
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Skeleton className="h-8 w-16 inline-block" />
                                    <Skeleton className="h-8 w-20 inline-block" />
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && complaints.length === 0 && (
                             <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No complaints found.</TableCell></TableRow>
                        )}
                         {!isLoading && complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                             {/* Table Cell Data */}
                            <TableCell className="font-mono text-xs">{complaint.id}</TableCell>
                            <TableCell>{complaint.type}</TableCell>
                            <TableCell>{complaint.submittedBy}</TableCell>
                             {/* Format date */}
                            <TableCell>{format(new Date(complaint.submittedAt), 'PPp')}</TableCell>
                            <TableCell>
                                <Badge variant={getPriorityBadgeVariant(complaint.priority)}>{complaint.priority}</Badge>
                            </TableCell>
                             <TableCell>
                                <Badge variant={getStatusBadgeVariant(complaint.status)}>{complaint.status}</Badge>
                             </TableCell>
                            {/* Action Buttons (View/Resolve) match wireframe */}
                            <TableCell className="text-right space-x-2">
                               <Button variant="outline" size="sm" onClick={() => openViewModal(complaint)}>
                                     <Eye className="mr-1 h-4 w-4" /> View
                                </Button>
                               {complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                                    <Button
                                     variant="default"
                                     size="sm"
                                     onClick={() => openResolveModal(complaint)}
                                     className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                     disabled={isSubmittingResolution} // Disable while submitting
                                     >
                                      <CheckCircle className="mr-1 h-4 w-4" /> Resolve
                                    </Button>
                               )}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
           </div>

           {/* View Complaint Modal */}
           <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Complaint Details (ID: {selectedComplaint?.id})</DialogTitle>
                         {/* Modal description includes Type, Priority, Status */}
                        <DialogDescription>
                            Type: {selectedComplaint?.type} | Priority: <Badge variant={getPriorityBadgeVariant(selectedComplaint?.priority || 'Low')} className="text-xs">{selectedComplaint?.priority}</Badge> | Status: <Badge variant={getStatusBadgeVariant(selectedComplaint?.status || 'Pending')} className="text-xs">{selectedComplaint?.status}</Badge>
                        </DialogDescription>
                    </DialogHeader>
                     {/* Scrollable area for long details */}
                    <ScrollArea className="max-h-[60vh] p-1 pr-4"> {/* Added padding-right */}
                         <div className="py-4 space-y-4 text-sm">
                             <p><strong>Submitted By:</strong> {selectedComplaint?.submittedBy}</p>
                            <p><strong>Submitted At:</strong> {selectedComplaint?.submittedAt ? format(new Date(selectedComplaint.submittedAt), 'PPp') : 'N/A'}</p> {/* Format Date */}
                             {/* Description Section */}
                             <div>
                                <strong>Description:</strong>
                                <p className="mt-1 p-3 bg-secondary rounded-md whitespace-pre-wrap">{selectedComplaint?.description}</p>
                            </div>
                             {/* Photo Section matches wireframe */}
                            {selectedComplaint?.photoUrl && (
                                <div>
                                    <strong>Attached Photo:</strong>
                                    <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden border">
                                         {/* Use next/image for optimization */}
                                         <Image src={selectedComplaint.photoUrl} alt="Complaint Photo" layout="fill" objectFit="contain" />
                                     </div>
                                </div>
                            )}
                             {/* Resolution Notes Section (if resolved) */}
                             {selectedComplaint?.resolutionNotes && (
                                 <div>
                                    <strong>Resolution Notes:</strong>
                                    <p className="mt-1 p-3 bg-green-50 rounded-md border border-green-200 whitespace-pre-wrap">{selectedComplaint?.resolutionNotes}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="sm:justify-between"> {/* Adjust footer alignment */}
                        {selectedComplaint?.status !== 'Resolved' && selectedComplaint?.status !== 'Rejected' && (
                            <Button
                             onClick={() => { setIsViewModalOpen(false); if (selectedComplaint) openResolveModal(selectedComplaint); }} // Ensure selectedComplaint is not null
                             className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2 sm:mt-0"
                             disabled={isSubmittingResolution} // Disable if submitting
                            >
                                Resolve Complaint
                            </Button>
                         )}
                        <DialogClose asChild>
                             <Button variant="outline" className="mt-2 sm:mt-0">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Resolve Complaint Modal */}
            <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
                <DialogContent className="sm:max-w-md">
                     <DialogHeader>
                        <DialogTitle>Resolve Complaint (ID: {selectedComplaint?.id})</DialogTitle>
                         {/* Modal description matches wireframe */}
                        <DialogDescription>Add your notes on the resolution steps taken.</DialogDescription>
                     </DialogHeader>
                     <div className="py-4">
                         {/* Placeholder text matches wireframe */}
                         <Textarea
                            placeholder="Add your notes on resolution…"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            rows={5}
                            disabled={isSubmittingResolution} // Disable textarea during submission
                         />
                     </div>
                     <DialogFooter>
                         <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmittingResolution}>Cancel</Button>
                         </DialogClose>
                          {/* Button text matches wireframe */}
                         <Button
                          onClick={handleMarkAsResolved}
                          disabled={!resolutionNotes.trim() || isSubmittingResolution}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                              {isSubmittingResolution ? 'Saving...' : 'Mark as Resolved'}
                         </Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ComplaintResolutionTable;
