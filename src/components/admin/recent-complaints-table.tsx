
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
// Import type and key from the main complaint table
import type { AdminComplaintData } from '@/components/admin/complaint-resolution-table';
import { ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY } from '@/components/admin/complaint-resolution-table';

// Type definitions similar to ComplaintResolutionTable but might have variations
type ComplaintStatus = 'Pending' | 'Resolved' | 'In Progress' | 'Rejected'; // Match AdminComplaintData
type ComplaintPriority = 'Critical' | 'High' | 'Medium' | 'Low'; // Match AdminComplaintData


// Function to simulate fetching recent complaints FROM LOCAL STORAGE
const fetchRecentComplaintsFromStorage = async (): Promise<AdminComplaintData[]> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Short delay to avoid race condition if data is updated
  try {
      const storedComplaintsRaw = localStorage.getItem(ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY);
      if (storedComplaintsRaw) {
          const allComplaints: AdminComplaintData[] = JSON.parse(storedComplaintsRaw).map((c: any) => ({
              ...c,
              submittedAt: new Date(c.submittedAt), // Parse date
          }));
          // Sort by date and take the top 5
          return allComplaints
                 .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
                 .slice(0, 5);
      }
  } catch (error) {
      console.error("Failed to load recent complaints from localStorage:", error);
  }
  return []; // Return empty if no data or error
};

const RecentComplaintsTable: FC = () => {
    // Use AdminComplaintData type
    const [complaints, setComplaints] = useState<AdminComplaintData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to load data
    const loadData = () => {
        setIsLoading(true);
        fetchRecentComplaintsFromStorage()
            .then(setComplaints)
            .finally(() => setIsLoading(false));
    };

    // Initial load and listen for storage changes
    useEffect(() => {
        loadData(); // Initial load

        const handleStorageChange = (event: StorageEvent) => {
            // Reload if the complaint data changes in storage
            if (event.key === ADMIN_COMPLAINTS_LOCAL_STORAGE_KEY) {
                console.log("Complaint data changed in storage, reloading recent complaints...");
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Run only once on mount

    // Badge styling based on priority (matching image colors)
    const getPriorityBadgeClass = (priority: ComplaintPriority): string => {
        switch (priority) {
            case 'Critical': return 'bg-red-700 text-white border-red-800 hover:bg-red-700/90';
            case 'High': return 'bg-red-500 text-white border-red-600 hover:bg-red-500/90';
            case 'Medium': return 'bg-blue-600 text-white border-blue-700 hover:bg-blue-600/90'; // Assuming dark blue for Medium
            case 'Low': return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-500/90'; // Assuming gray for Low
            default: return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'; // Fallback
        }
    };

    // Badge styling based on status (matching image colors)
    const getStatusBadgeClass = (status: ComplaintStatus): string => {
         switch (status) {
            case 'Pending': return 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-500/90'; // Yellowish-gold for Pending
            case 'In Progress': return 'bg-blue-600 text-white border-blue-700 hover:bg-blue-600/90'; // Reuse Medium priority color
            case 'Resolved': return 'bg-green-600 text-white border-green-700 hover:bg-green-600/90';
             case 'Rejected': return 'bg-red-700 text-white border-red-800 hover:bg-red-700/90'; // Reuse Critical color
            default: return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'; // Fallback
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {/* Columns match the provided image */}
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading && Array.from({ length: 3 }).map((_, index) => ( // Show skeletons while loading
                    <TableRow key={`skel-complaint-${index}`}>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 inline-block" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && complaints.length === 0 && (
                     <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No recent complaints.</TableCell></TableRow>
                )}
                 {!isLoading && complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                        <TableCell className="font-mono text-xs">{complaint.id}</TableCell>
                        <TableCell>{complaint.type}</TableCell>
                         <TableCell>
                            <Badge className={cn("capitalize", getStatusBadgeClass(complaint.status))}>{complaint.status}</Badge>
                         </TableCell>
                         <TableCell>
                            <Badge className={cn("capitalize", getPriorityBadgeClass(complaint.priority))}>{complaint.priority}</Badge>
                         </TableCell>
                         {/* Display user and route from AdminComplaintData */}
                        <TableCell>{complaint.user || complaint.submittedBy}</TableCell>
                        <TableCell>{complaint.route || 'N/A'}</TableCell>
                        <TableCell>{format(new Date(complaint.submittedAt), 'yyyy-MM-dd')}</TableCell> {/* Format date */}
                         {/* Action Button (Link to full complaint view) */}
                        <TableCell className="text-right">
                            {/* Link to the main complaints page, ideally passing the ID as a query param to auto-open the modal */}
                            <Link href={`/admin/complaints?view=${complaint.id}`} passHref>
                                <Button variant="link" size="sm" className="text-accent px-1">View</Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                 ))}
            </TableBody>
        </Table>
    );
};

export default RecentComplaintsTable;
