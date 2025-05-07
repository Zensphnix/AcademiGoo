
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils'; // Import cn for conditional styling
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Matches admin complaint structure for consistency, but might be simplified for student view
type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
type ComplaintPriority = 'Low' | 'Medium' | 'High';

interface ComplaintData {
  id: string;
  type: string; // e.g., 'Cleanliness', 'Late Arrival'
  description: string;
  status: ComplaintStatus;
  submittedAt: Date | string; // Allow string for locally stored dates initially
  resolutionNotes?: string; // Might be shown to student if resolved/rejected
}

// Key for localStorage
const LOCAL_STORAGE_COMPLAINTS_KEY = 'newlySubmittedComplaints';


// Mock Data - Replace with actual API fetching for the LOGGED-IN STUDENT
const fetchStudentComplaints = async (): Promise<ComplaintData[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    // This should ideally fetch complaints associated with the current user ID
    // Ensure fetched dates are Date objects or easily convertible ISO strings
    return [
      // { id: 'C009', type: 'Other', description: 'Seat belt is broken on seat 5A.', status: 'Pending', submittedAt: new Date(Date.now() - 60000 * 5) }, // Removed this as local storage handles new ones
      { id: 'C001', type: 'Late Arrival', description: 'Bus was 20 minutes late this morning without any notification.', status: 'Pending', submittedAt: new Date(Date.now() - 86400000 * 1)},
      { id: 'C004', type: 'Overcrowded', description: 'Bus was dangerously overcrowded during peak hours.', status: 'Resolved', submittedAt: new Date(Date.now() - 86400000 * 5), resolutionNotes: 'Adjusted schedule slightly and monitoring passenger counts.' },
      { id: 'C007', type: 'Cleanliness', description: 'Floor was sticky.', status: 'Rejected', submittedAt: new Date(Date.now() - 86400000 * 2), resolutionNotes: 'No issues found upon inspection.' },
      { id: 'C008', type: 'Driver Behavior', description: 'Driver skipped a designated stop (Library Complex).', status: 'In Progress', submittedAt: new Date(Date.now() - 3600000 * 4) },
    ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()); // Sort newest first, ensure date conversion
};


const ComplaintStatusTable: FC = () => {
    const [complaints, setComplaints] = useState<ComplaintData[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Start in loading state

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

    useEffect(() => {
        setIsLoading(true);
        const loadData = async () => {
            try {
                const fetchedComplaints = await fetchStudentComplaints();

                // Check for locally stored new complaints
                const localComplaintsRaw = localStorage.getItem(LOCAL_STORAGE_COMPLAINTS_KEY);
                const localComplaints: ComplaintData[] = localComplaintsRaw ? JSON.parse(localComplaintsRaw) : [];

                // Convert string dates from local storage back to Date objects
                const parsedLocalComplaints = localComplaints.map(c => ({
                    ...c,
                    submittedAt: new Date(c.submittedAt),
                }));

                // Combine fetched and local complaints, removing duplicates based on ID
                // (assuming fetched data eventually replaces local temp IDs)
                const combinedComplaintsMap = new Map<string, ComplaintData>();

                // Add local first to prioritize showing them if IDs overlap somehow
                parsedLocalComplaints.forEach(c => combinedComplaintsMap.set(c.id, c));
                // Add fetched, potentially overwriting local if IDs match (which shouldn't happen with temp IDs)
                fetchedComplaints.forEach(c => combinedComplaintsMap.set(c.id, { ...c, submittedAt: new Date(c.submittedAt) })); // Ensure fetched dates are Date objects

                const combinedComplaints = Array.from(combinedComplaintsMap.values());


                // Sort the combined list by date, newest first
                combinedComplaints.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

                setComplaints(combinedComplaints);

                // Optional: Clear local storage after merging if fetched data is source of truth
                // localStorage.removeItem(LOCAL_STORAGE_COMPLAINTS_KEY);

            } catch (err) {
                console.error("Failed to load complaints:", err);
                // Handle error state if needed
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // Optional: Add a listener for storage events if complaints can be added from other tabs/windows
        // const handleStorageChange = (event: StorageEvent) => {
        //    if (event.key === LOCAL_STORAGE_COMPLAINTS_KEY) {
        //        loadData(); // Reload data if local complaints change
        //    }
        // };
        // window.addEventListener('storage', handleStorageChange);
        // return () => window.removeEventListener('storage', handleStorageChange);

    }, []);


    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
           <div className="p-6 space-y-1.5 border-b">
             <h2 className="text-xl text-primary font-semibold">Your Complaint History</h2>
             <p className="text-sm text-muted-foreground">Track the status of your submitted complaints.</p>
              {/* Add filtering/sorting options here if needed */}
           </div>
           <div className="p-6 pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                           {/* Columns match requirements */}
                        <TableHead className="w-[150px]">ID</TableHead> {/* Wider ID for temp IDs */}
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                         <TableHead>Details / Response</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 3 }).map((_, index) => ( // Show skeletons while loading
                            <TableRow key={`skel-complaint-${index}`}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell> {/* Wider skeleton */}
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && complaints.length === 0 && (
                             <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">You haven't submitted any complaints yet.</TableCell></TableRow>
                        )}
                         {!isLoading && complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                            {/* Use monospaced font and allow wrapping for potentially long temp IDs */}
                            <TableCell className="font-mono text-xs break-all">{complaint.id}</TableCell>
                            <TableCell>{complaint.type}</TableCell>
                             {/* Ensure submittedAt is a Date object before formatting */}
                             <TableCell>{format(new Date(complaint.submittedAt), 'PPp')}</TableCell>
                             <TableCell>
                                <Badge variant={getStatusBadgeVariant(complaint.status)}>{complaint.status}</Badge>
                             </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             {/* Show truncated description or resolution notes */}
                                            <span className="cursor-help">
                                                 {complaint.status === 'Resolved' || complaint.status === 'Rejected'
                                                    ? complaint.resolutionNotes || complaint.description
                                                    : complaint.description}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-sm break-words p-2"> {/* Added padding */}
                                             {/* Show full text in tooltip */}
                                              <p className="font-medium">Description:</p>
                                              <p className="mb-2">{complaint.description}</p>
                                             {complaint.resolutionNotes && (
                                                <>
                                                    <p className="font-medium">Response:</p>
                                                    <p>{complaint.resolutionNotes}</p>
                                                </>
                                                )
                                             }
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
           </div>
        </div>
    );
};

export default ComplaintStatusTable;
