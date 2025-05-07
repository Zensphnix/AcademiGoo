
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bus, MapPin, Users, MessageSquareWarning, Search, LayoutDashboard, Route as RouteIconAdmin } from 'lucide-react'; // Renamed Route icon to avoid conflict with Next.js Route
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import RecentComplaintsTable from '@/components/admin/recent-complaints-table';
import type { BusData } from '@/app/admin/buses/page'; // Import BusData type
import { ADMIN_BUSES_LOCAL_STORAGE_KEY } from '@/app/admin/buses/page'; // Import bus storage key
import type { UserData } from '@/components/admin/user-management-table'; // Import UserData type
import { ADMIN_USERS_LOCAL_STORAGE_KEY } from '@/components/admin/user-management-table'; // Import user storage key
import type { BusRouteData } from '@/app/admin/routes/page'; // Import RouteData type
// Correctly import the key from the routes page
import { ADMIN_ROUTES_LOCAL_STORAGE_KEY } from '@/app/admin/routes/page';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover'; // Import Popover components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput, // Using Input directly, CommandInput not needed here
  CommandItem,
  CommandList,
} from "@/components/ui/command"; // Import Command components


// Mock data structure (totalUsers is now calculated)
interface DashboardData {
  totalActiveBuses: number;
  totalUsers: number; // Will be calculated from UserData
}

// Combined Search Suggestion Type
interface SearchSuggestion {
    type: 'Bus' | 'Route' | 'User';
    id: string;
    primaryText: string; // e.g., Bus ID or Route Name or User Name
    secondaryText?: string; // e.g., Route for Bus, Driver for Bus, User Role/Email
}

const AdminDashboardPage: FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]); // State for suggestions
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false); // State for popover visibility
  const { toast } = useToast();
  const router = useRouter();

  // State for the underlying data used for search
  const [allBuses, setAllBuses] = useState<BusData[]>([]);
  const [allRoutes, setAllRoutes] = useState<BusRouteData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);


  // Function to load data from localStorage and calculate counts
  const loadAndCalculateData = useCallback(() => {
     setIsLoading(true); // Indicate loading when recalculating
     try {
         // Load Buses
         const storedBuses = localStorage.getItem(ADMIN_BUSES_LOCAL_STORAGE_KEY);
         const buses: BusData[] = storedBuses ? JSON.parse(storedBuses) : [];
         const activeBusCount = buses.filter(bus => bus.status === 'Active').length;
         setAllBuses(buses); // Store for search

         // Load Users
         const storedUsers = localStorage.getItem(ADMIN_USERS_LOCAL_STORAGE_KEY);
         const users: UserData[] = storedUsers ? JSON.parse(storedUsers) : [];
         const totalUserCount = users.length; // Calculate total users
         setAllUsers(users); // Store for search

          // Load Routes
          const storedRoutes = localStorage.getItem(ADMIN_ROUTES_LOCAL_STORAGE_KEY);
          const routes: BusRouteData[] = storedRoutes ? JSON.parse(storedRoutes) : [];
          setAllRoutes(routes); // Store for search

         setData({
             totalActiveBuses: activeBusCount,
             totalUsers: totalUserCount,
         });

     } catch (error) {
         console.error("Failed to load or calculate dashboard data:", error);
         toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
         // Optionally set default values on error
         setData({ totalActiveBuses: 0, totalUsers: 0 });
         setAllBuses([]);
         setAllRoutes([]);
         setAllUsers([]);
     } finally {
         setIsLoading(false); // Stop loading after all data is processed
     }
  }, [toast]); // Include toast in dependencies

  // Initial load and listen for storage changes
  useEffect(() => {
    loadAndCalculateData(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
        // Reload dashboard data if any relevant list changes
        if (event.key === ADMIN_BUSES_LOCAL_STORAGE_KEY || event.key === ADMIN_USERS_LOCAL_STORAGE_KEY || event.key === ADMIN_ROUTES_LOCAL_STORAGE_KEY) {
            console.log("Admin data changed in storage, reloading dashboard...");
            loadAndCalculateData();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAndCalculateData]); // Use the memoized function


   // Handler for search input changes - with suggestion filtering
   // Ensures state updates correctly to allow typing multiple characters
   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       const query = event.target.value;
       setSearchQuery(query); // Update the state immediately

       if (query.trim().length > 0) {
           const lowerCaseQuery = query.toLowerCase();
           const suggestions: SearchSuggestion[] = [];

           // Search Buses
           allBuses.filter(bus =>
               bus.id.toLowerCase().includes(lowerCaseQuery) ||
               bus.model.toLowerCase().includes(lowerCaseQuery) ||
               (bus.assignedRoute && bus.assignedRoute.toLowerCase().includes(lowerCaseQuery)) ||
                bus.status.toLowerCase().includes(lowerCaseQuery)
           ).forEach(bus => suggestions.push({
                type: 'Bus',
                id: bus.id,
                primaryText: bus.id,
                secondaryText: `${bus.model} (${bus.status}) ${bus.assignedRoute ? `- ${bus.assignedRoute}` : ''}`
           }));

           // Search Routes
           allRoutes.filter(route =>
               route.id.toLowerCase().includes(lowerCaseQuery) ||
               route.name.toLowerCase().includes(lowerCaseQuery) ||
               route.description?.toLowerCase().includes(lowerCaseQuery)
           ).forEach(route => suggestions.push({
               type: 'Route',
               id: route.id,
               primaryText: route.name,
                secondaryText: `Stops: ${route.stops.length}`
           }));

           // Search Users
           allUsers.filter(user =>
               user.id.toLowerCase().includes(lowerCaseQuery) ||
               user.name.toLowerCase().includes(lowerCaseQuery) ||
               user.email.toLowerCase().includes(lowerCaseQuery) ||
                user.role.toLowerCase().includes(lowerCaseQuery) ||
                (user.assignedBus && user.assignedBus.toLowerCase().includes(lowerCaseQuery))
           ).forEach(user => suggestions.push({
               type: 'User',
               id: user.id,
               primaryText: user.name,
               secondaryText: `${user.role} (${user.email})`
           }));

           // Limit suggestions for performance/UI
           setFilteredSuggestions(suggestions.slice(0, 10));
           setIsSearchPopoverOpen(suggestions.length > 0);
       } else {
           setFilteredSuggestions([]);
           setIsSearchPopoverOpen(false); // Close if search is empty
       }
   };


   // Handler for selecting a suggestion
   const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
       setSearchQuery(suggestion.primaryText); // Set input to selected primary text
       setFilteredSuggestions([]);
       setIsSearchPopoverOpen(false);
       toast({ title: `${suggestion.type} Selected`, description: `Navigating to details for ${suggestion.primaryText}` });

       // Navigate to the relevant management page
       switch (suggestion.type) {
           case 'Bus':
               router.push(`/admin/buses?highlight=${encodeURIComponent(suggestion.id)}`);
               break;
           case 'Route':
               router.push(`/admin/routes?highlight=${encodeURIComponent(suggestion.id)}`);
               break;
           case 'User':
               router.push(`/admin/users?highlight=${encodeURIComponent(suggestion.id)}`);
               break;
           default:
               console.warn("Unhandled suggestion type:", suggestion.type);
       }
   }, [router, toast]);


   // Handler for search form submission (optional, can rely on selection)
   const handleSearchSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     if (!searchQuery.trim()) return;
     // If suggestions are open and one is potentially highlighted, maybe select it?
     // Or just navigate to a general search results page (not implemented)
     toast({
       title: "Admin Search Triggered",
       description: `Search functionality not fully implemented on direct submit. Searching for: ${searchQuery}`,
     });
     console.log("Admin searching via submit (no specific action):", searchQuery);
     setIsSearchPopoverOpen(false); // Close popover on submit
     // Example: router.push(`/admin/search-results?q=${encodeURIComponent(searchQuery)}`);
   }, [searchQuery, toast]); // Added toast dependency


  // Helper to render overview cards (without using Card component)
  const renderOverviewCard = (title: string, value: number | string, icon: React.ReactNode, href?: string, description?: string) => (
     <div className={`bg-card text-card-foreground rounded-lg border shadow-sm transition-shadow ${href ? 'hover:shadow-lg' : ''}`}>
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-primary">{title}</h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        {isLoading ? (
           <Skeleton className="h-8 w-1/2" />
        ) : (
           <div className="text-2xl font-bold">{value}</div>
        )}
         {description && !isLoading && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
         {href && !isLoading && (
             <Link href={href} passHref>
                 <Button variant="link" size="sm" className="px-0 pt-2 text-accent">View Details</Button>
             </Link>
         )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
       {/* Page Title */}
      <h2 className="text-2xl font-semibold text-foreground">Admin Dashboard</h2>

       {/* Search Section - Now with Popover */}
       <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
         <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Global Search</h3>
         <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
            <PopoverAnchor className="relative w-full">
                 <form onSubmit={handleSearchSubmit}>
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                     <Input
                       type="search"
                       placeholder="Search routes, buses, users..."
                       value={searchQuery}
                       onChange={handleSearchChange} // Ensure this handler updates the state correctly
                       className="pl-8 w-full"
                        aria-autocomplete="list"
                        aria-controls="search-suggestions"
                     />
                     {/* Hidden submit button for accessibility or use Enter key */}
                      <button type="submit" className="sr-only">Search</button>
                  </form>
              </PopoverAnchor>
             <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                 <Command shouldFilter={false} /* Filtering is done in handleSearchChange */ >
                     <CommandList id="search-suggestions">
                         <CommandEmpty>{searchQuery.trim() && !filteredSuggestions.length ? 'No results found.' : 'Type to search...'}</CommandEmpty>
                         {filteredSuggestions.length > 0 && (
                             <CommandGroup heading="Suggestions">
                                {filteredSuggestions.map((suggestion) => (
                                     <CommandItem
                                         key={`${suggestion.type}-${suggestion.id}`}
                                         value={`${suggestion.type}-${suggestion.primaryText}`} // Unique value for Command
                                         onSelect={() => handleSuggestionSelect(suggestion)} // Use the memoized handler
                                         className="cursor-pointer flex items-center gap-2"
                                     >
                                        {/* Icon based on type */}
                                        {suggestion.type === 'Bus' && <Bus className="h-4 w-4 text-muted-foreground" />}
                                        {suggestion.type === 'Route' && <RouteIconAdmin className="h-4 w-4 text-muted-foreground" />}
                                        {suggestion.type === 'User' && <Users className="h-4 w-4 text-muted-foreground" />}
                                         <div className="flex flex-col">
                                             <span className="font-medium">{suggestion.primaryText}</span>
                                             {suggestion.secondaryText && <span className="text-xs text-muted-foreground">{suggestion.secondaryText}</span>}
                                         </div>
                                     </CommandItem>
                                ))}
                             </CommandGroup>
                         )}
                     </CommandList>
                 </Command>
             </PopoverContent>
         </Popover>
           <p className="text-xs text-muted-foreground">Select a suggestion or press Enter to search (results on dedicated pages).</p>
       </div>


      {/* Overview "Cards" */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {renderOverviewCard(
          "Total Active Buses",
          data?.totalActiveBuses ?? '...', // Show calculated active buses
          <Bus className="h-4 w-4 text-muted-foreground" />,
           "/admin/buses",
           "Currently operational buses"
        )}
         {renderOverviewCard(
           "Total Users",
           data?.totalUsers ?? '...', // Show calculated total users
           <Users className="h-4 w-4 text-muted-foreground" />,
           "/admin/users",
           "Registered students & staff"
         )}
      </div>

       {/* Management Actions Section */}
       <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
         <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Management Actions</h3>
         <p className="text-sm text-muted-foreground">Quick access to core management tasks.</p>
         <div className="space-y-2">
           <Link href="/admin/routes" passHref>
             <Button variant="outline" className="w-full justify-start">
               <MapPin className="mr-2 h-4 w-4" /> Manage Routes
             </Button>
           </Link>
           <Link href="/admin/users" passHref>
               <Button variant="outline" className="w-full justify-start">
                 <Users className="mr-2 h-4 w-4" /> Manage Users
               </Button>
           </Link>
           <Link href="/admin/buses" passHref>
             <Button variant="outline" className="w-full justify-start">
               <Bus className="mr-2 h-4 w-4" /> Manage Buses
             </Button>
           </Link>
         </div>
       </div>

        {/* Recent Complaints Table Section */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold leading-none tracking-tight text-primary flex items-center gap-2">
               <MessageSquareWarning className="h-5 w-5"/> Recent Complaints
             </h3>
             <Link href="/admin/complaints" passHref>
                 <Button variant="link" size="sm" className="text-accent">View All</Button>
             </Link>
          </div>
          <RecentComplaintsTable />
        </div>

    </div>
  );
};

export default AdminDashboardPage;

    