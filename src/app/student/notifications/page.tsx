"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BellRing, Trash2, RefreshCw, CircleAlert, Info, Bell } from 'lucide-react'; // Added specific icons
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting
import { cn } from '@/lib/utils'; // For conditional styling
import { useToast } from '@/hooks/use-toast';

// Mock notification structure
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'renewal' | 'delay'; // Added types
  timestamp: Date;
  read: boolean;
}

// Mock API function to fetch notifications
const fetchNotifications = async (): Promise<Notification[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay
  return [
    { id: 'n001', title: 'Bus Pass Renewal Reminder', message: 'Your bus pass expires in 10 days. Renew it now to avoid service interruption.', type: 'renewal', timestamp: new Date(Date.now() - 86400000 * 2), read: false }, // 2 days ago
    { id: 'n002', title: 'Route 5 Delay Alert', message: 'Route 5 (North Campus Line) is running approximately 15 minutes late due to traffic.', type: 'delay', timestamp: new Date(Date.now() - 3600000 * 1), read: false }, // 1 hour ago
    { id: 'n003', title: 'Service Update', message: 'Minor schedule adjustments for Route 3 starting next Monday. Check the updated schedule.', type: 'info', timestamp: new Date(Date.now() - 86400000 * 5), read: true }, // 5 days ago
    { id: 'n004', title: 'Campus Event Traffic', message: 'Expect potential delays tomorrow afternoon due to the annual fair near the main gate.', type: 'warning', timestamp: new Date(Date.now() - 86400000 * 1), read: true }, // 1 day ago
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first
};

const StudentNotificationsPage: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadNotifications = () => {
    setIsLoading(true);
    fetchNotifications()
      .then(setNotifications)
       .catch(error => {
          console.error("Failed to fetch notifications:", error);
          toast({ title: "Error", description: "Could not load notifications.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []); // Load on initial mount

  const handleMarkAsRead = (id: string) => {
    console.log("Marking as read:", id);
    // Simulate API call
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
     // Optionally add toast feedback
  };

  const handleMarkAllRead = () => {
     console.log("Marking all as read");
     // Simulate API call
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
     toast({ title: "Notifications Updated", description: "All notifications marked as read." });
  };

   const handleDelete = (id: string) => {
      console.log("Deleting notification:", id);
      // Simulate API call
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({ title: "Notification Deleted", description: "The notification has been removed." });
   };

   const handleDeleteAll = () => {
      console.log("Deleting all notifications");
      // Simulate API call
      setNotifications([]);
      toast({ title: "Notifications Cleared", description: "All notifications have been deleted.", variant: "destructive" });
   };

    const getIconForType = (type: Notification['type']) => {
        switch (type) {
            case 'renewal': return <BellRing className="h-5 w-5 text-blue-500" />;
            case 'delay': return <CircleAlert className="h-5 w-5 text-orange-500" />;
            case 'warning': return <CircleAlert className="h-5 w-5 text-yellow-500" />;
            case 'info':
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };


  return (
    <div className="container mx-auto py-6 flex justify-center">
      {/* Replaced Card with div and applied styling */}
      <div className="w-full max-w-3xl rounded-lg border bg-card text-card-foreground shadow-lg">
        {/* Equivalent to CardHeader */}
        <div className="p-6 flex flex-row items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl text-primary flex items-center font-semibold">
              <Bell className="mr-2 h-5 w-5" /> Notifications
            </h2>
            <p className="text-sm text-muted-foreground">Recent updates and alerts regarding bus services.</p>
          </div>
           <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadNotifications} disabled={isLoading}>
                    <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                {notifications.length > 0 && (
                     <Button variant="secondary" size="sm" onClick={handleMarkAllRead} disabled={isLoading}>
                         Mark all Read
                     </Button>
                )}
           </div>
        </div>
        {/* Equivalent to CardContent (with p-0) */}
        <div className="p-0">
           <ScrollArea className="h-[60vh] w-full"> {/* Adjust height as needed */}
                <div className="p-4 space-y-3">
                 {isLoading && Array.from({ length: 4 }).map((_, index) => (
                    <div key={`skel-${index}`} className="flex items-start space-x-4 p-4 border rounded-md">
                        <Skeleton className="h-8 w-8 rounded-full mt-1" />
                        <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/4" />
                        </div>
                         <Skeleton className="h-6 w-6" />
                    </div>
                 ))}
                 {!isLoading && notifications.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                         <BellRing className="h-10 w-10 mb-2" />
                         <p>No notifications yet.</p>
                     </div>
                 )}
                 {!isLoading && notifications.map((notification) => (
                    <div
                        key={notification.id}
                         className={cn(
                            "flex items-start space-x-4 p-4 border rounded-md transition-colors hover:bg-secondary/50",
                            !notification.read && "bg-primary/5 border-primary/20" // Subtle highlight for unread
                        )}
                    >
                         <div className="mt-1 shrink-0">
                            {getIconForType(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className={cn("text-sm font-medium leading-none", !notification.read && "text-primary")}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {notification.message}
                            </p>
                             <p className="text-xs text-muted-foreground pt-1">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                             </p>
                        </div>
                         <div className="flex flex-col gap-1 items-center">
                            {!notification.read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    Mark Read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(notification.id)}
                                title="Delete Notification"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                 ))}
                </div>
           </ScrollArea>
        </div>
         {notifications.length > 0 && (
            // Equivalent to CardFooter
            <div className="flex items-center p-6 pt-4 border-t justify-end">
                 <Button variant="destructive" size="sm" onClick={handleDeleteAll} disabled={isLoading}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete All Notifications
                 </Button>
            </div>
         )}
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
