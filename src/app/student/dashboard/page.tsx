

"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BellRing, RefreshCw, ScanLine, Phone, User, Bell, FileText, CreditCard, MapPin, CircleAlert, MessageSquare, CheckCircle, CircleDot, Clock, MessageSquareText, AlertCircle, BusFront, Route as RouteIcon, Search } from 'lucide-react'; // Added RouteIcon and Search
import MapComponent from '@/components/common/map-component';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useToast } from '@/hooks/use-toast';
import type { Coordinate, BusRoute, EstimatedTimeOfArrival } from '@/services/maps';
import { getBusLocation, getBusRoute, getEta } from '@/services/maps'; // Import map service functions
import { cn } from '@/lib/utils'; // Import cn for conditional classes
import RegisterBusModal from '@/components/student/register-bus-modal'; // Import the new modal component
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"; // Import Command components


// Mock contact info (Updated)
const transportDepartment = "Transport Department - K.R. Mangalam University";
const transportOfficeLocation = "Block A, Ground Floor, KRMU Campus";
const transportOfficeContact = "+91-9876543210";
const transportOfficeEmail = "transport@university.edu";
const transportOfficeHours = "8:00 AM – 6:00 PM (Monday to Saturday)";

// Mock routes for registration modal
const mockAvailableRoutes = [
    'Route 1 - City Center Loop',
    'Route 3 - East Wing Shuttle',
    'Route 5 – North Campus Line',
    'Route 7 - South Campus Express',
    'Route 9 - Library Link',
    'Route W-1 - West Gate Connect',
];

// Mock Bus Data for search suggestions
interface MockBus {
    id: string; // Reg No
    route: string;
    driver: string;
    status: 'Active' | 'Inactive' | 'Maintenance';
}
const mockBuses: MockBus[] = [
    { id: 'HR 26 B 7890', route: 'South Campus Express', driver: 'Rajesh Kumar', status: 'Active' },
    { id: 'DL 1A 4567', route: 'North Campus Line', driver: 'Vikram Rathod', status: 'Active' },
    { id: 'UP 15 C 1122', route: 'East Wing Shuttle', driver: 'Anjali Sharma', status: 'Maintenance' },
    { id: 'MH 01 Z 9988', route: 'West Gate Connect', driver: 'Suresh Patel', status: 'Inactive' },
    { id: 'KA 05 M 5544', route: 'Library Link', driver: 'Deepa Singh', status: 'Active' },
];


const LOCAL_STORAGE_USERNAME_KEY = 'userName';
const LOCAL_STORAGE_ROUTE_KEY = 'registeredRoute'; // Key for registered route


const StudentDashboardPage: FC = () => {
  const { toast } = useToast();
  // State for the greeting, fetched from localStorage
  const [greetingName, setGreetingName] = useState('Student');
  const [busLocation, setBusLocation] = useState<Coordinate | undefined>(undefined);
  // const [passExpiryDays, setPassExpiryDays] = useState(10); // Example: Expires in 10 days
  const [busRoute, setBusRoute] = useState<BusRoute | null>(null);
  const [etas, setEtas] = useState<EstimatedTimeOfArrival[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentStopIndex, setCurrentStopIndex] = useState(1); // Mock: Assume bus is heading towards index 1 (Main Library)
  const [hasMounted, setHasMounted] = useState(false);
  const [isRegisterBusModalOpen, setIsRegisterBusModalOpen] = useState(false); // State for the modal
  const [registeredRoute, setRegisteredRoute] = useState<string | undefined>(undefined); // State to hold the *actually* registered route
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<MockBus[]>([]);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);


  // Effect to handle initial mount and localStorage access
  useEffect(() => {
    setHasMounted(true); // Indicate component has mounted on the client

    // Fetch user name and registered route from local storage on mount
    const loadUserAndRoute = () => {
      const storedName = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);
      setGreetingName(storedName || 'Student'); // Use stored name or fallback

      const storedRoute = localStorage.getItem(LOCAL_STORAGE_ROUTE_KEY);
      setRegisteredRoute(storedRoute || undefined); // Load stored route or undefined
    };
    loadUserAndRoute();

     // Add event listener for storage changes (e.g., profile update, route update)
     const handleStorageChange = (event: StorageEvent) => {
         if (event.key === LOCAL_STORAGE_USERNAME_KEY) {
             setGreetingName(event.newValue || 'Student');
         }
         if (event.key === LOCAL_STORAGE_ROUTE_KEY) {
             setRegisteredRoute(event.newValue || undefined);
         }
     };
     window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
     return () => {
         window.removeEventListener('storage', handleStorageChange);
     };
  }, []); // Run only once on mount


  useEffect(() => {
    if (!hasMounted) return; // Prevent fetching on server or before hydration

    const fetchData = async () => {
       setIsLoadingLocation(true);
       setIsLoadingRoute(true);
        try {
            // Use registered route if available, otherwise default or skip fetching route-specific data
            const routeIdentifier = registeredRoute || undefined; // Use registered route or undefined

            if (routeIdentifier) {
                // Fetch data specific to the registered route
                const [locationData, routeData, etaData] = await Promise.all([
                    getBusLocation(routeIdentifier), // Use the identifier
                    getBusRoute(routeIdentifier), // Pass identifier to get specific route
                    getEta(routeIdentifier) // Pass identifier to get specific ETAs
                ]);

                setBusLocation(locationData.coordinate);
                setBusRoute(routeData);
                setEtas(etaData);
                // TODO: Implement logic to determine currentStopIndex based on locationData and routeData
            } else {
                // No route registered, clear or set default states
                setBusLocation(undefined);
                setBusRoute(null);
                setEtas([]);
                console.log("No route registered, skipping route-specific data fetch.");
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast({
                title: "Error Loading Data",
                description: "Could not load some dashboard information.",
                variant: "destructive",
            });
        } finally {
             setIsLoadingLocation(false);
             setIsLoadingRoute(false);
        }
    };

    fetchData();

    // Optional: Set up interval to refresh bus location if a route is registered
    // const intervalId = setInterval(async () => { ... }, 30000);
    // return () => clearInterval(intervalId);
  }, [toast, hasMounted, registeredRoute]); // Re-run if registeredRoute changes


  const findEtaForStop = (stopName: string): string | undefined => {
    return etas.find(eta => eta.stopName === stopName)?.eta;
  }

  const mapMarkers = busRoute?.stops.map((stop, index) => ({
    key: `stop-${index}`,
    lat: stop.location.lat,
    lng: stop.location.lng,
    label: stop.name,
  })) ?? [];

  const mapCenter = busLocation ?? (busRoute?.stops[0]?.location ? { lat: busRoute.stops[0].location.lat, lng: busRoute.stops[0].location.lng } : { lat: 37.7749, lng: -122.4194 }); // Center on bus or first stop or default

    const handleBusRegistrationSubmit = async (selectedRoute: string) => {
        console.log(`${registeredRoute ? 'Updating' : 'Registering'} bus route to: ${selectedRoute}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

         const isUpdate = !!registeredRoute; // Check if it was an update action

        // Update the local state for the registered route
         setRegisteredRoute(selectedRoute);

         // Persist to local storage
         if (typeof window !== 'undefined') {
             localStorage.setItem(LOCAL_STORAGE_ROUTE_KEY, selectedRoute);
              // Dispatch storage event for other components if needed
             window.dispatchEvent(new StorageEvent('storage', {
                 key: LOCAL_STORAGE_ROUTE_KEY,
                 newValue: selectedRoute,
                 storageArea: localStorage,
             }));
         }


        toast({
            title: isUpdate ? "Route Updated" : "Route Registered",
            description: `You have successfully ${isUpdate ? 'updated your route to' : 'registered for'} ${selectedRoute}. Dashboard data will refresh.`,
        });
        setIsRegisterBusModalOpen(false); // Close modal on success
        // Data refetch will be triggered by the useEffect dependency on `registeredRoute`
    };

   const handleSearchChange = (value: string) => {
       setSearchQuery(value); // Update search query state

       // Filter suggestions based on the input value
       if (value.trim().length > 0) {
           const lowerCaseQuery = value.toLowerCase();
           const filtered = mockBuses.filter(bus =>
               bus.id.toLowerCase().includes(lowerCaseQuery) ||
               bus.route.toLowerCase().includes(lowerCaseQuery) ||
               bus.driver.toLowerCase().includes(lowerCaseQuery) ||
               bus.status.toLowerCase().includes(lowerCaseQuery)
           );
           setFilteredSuggestions(filtered);
           if (filtered.length > 0) {
             setIsSearchPopoverOpen(true); // Only open if there are suggestions
           } else {
             setIsSearchPopoverOpen(false); // Close if no suggestions match
           }
       } else {
           setFilteredSuggestions([]);
           setIsSearchPopoverOpen(false); // Close if search is empty
       }
   };


   const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
     event?.preventDefault(); // Prevent form submission if used in a form
     if (!searchQuery.trim()) return;
     toast({ title: "Search Action", description: `Searching for: ${searchQuery}` });
     console.log("Search triggered for:", searchQuery);
     setIsSearchPopoverOpen(false);
      // TODO: Implement actual search results page navigation
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
   };

  const handleSuggestionSelect = (bus: MockBus) => {
      setSearchQuery(bus.id); // Set input to selected ID
      setFilteredSuggestions([]);
      setIsSearchPopoverOpen(false);
      toast({ title: "Bus Selected", description: `Viewing details for ${bus.id}` });
      // TODO: Navigate to a specific bus details page if available
      // Example: router.push(`/bus/${bus.id}`);
  }


   if (!hasMounted) {
     // Render a loading state or null during SSR/initial client render before hydration
     return (
        <div className="space-y-6 p-4 md:p-8"> {/* Add padding */}
             <Skeleton className="h-8 w-48" /> {/* Greeting */}
             <Skeleton className="h-24 w-full rounded-lg border" /> {/* More Actions */}
             <Skeleton className="h-[450px] w-full rounded-lg border" /> {/* Map */}
             <Skeleton className="h-72 w-full rounded-lg border" /> {/* Route */}
             <Skeleton className="h-28 w-full rounded-lg border" /> {/* Support */}
         </div>
     );
   }


  return (
    <div className="space-y-6">
      {/* Personalized greeting - uses greetingName state */}
      <h2 className="text-2xl font-semibold text-foreground">Hello, {greetingName}!</h2>

       {/* More Actions Section (No Card) */}
       <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
        {/* Heading removed as requested */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"> {/* Adjusted grid columns */}
           {/* Bus Pass Button */}
           <Link href="/student/bus-pass" passHref>
             <Button variant="outline" className="w-full h-full flex-col py-3">
                 <FileText className="h-6 w-6 mb-1 text-accent" />
                 <span className="text-xs text-center">View Bus Pass</span>
             </Button>
          </Link>
           {/* Scan QR Button */}
           <Link href="/student/scan-attendance" passHref>
             <Button variant="outline" className="w-full h-full flex-col py-3">
                 <ScanLine className="h-6 w-6 mb-1 text-accent" />
                 <span className="text-xs text-center">Scan for Attendance</span>
             </Button>
          </Link>
           {/* Check ETA Button - Updated Link */}
           <Link href="/student/eta" passHref>
               <Button variant="outline" className="w-full h-full flex-col py-3">
                 <Clock className="h-6 w-6 mb-1 text-accent" />
                 <span className="text-xs text-center">Check ETA</span>
               </Button>
            </Link>
           {/* Complaint Status Button - Updated Link */}
           <Link href="/student/complaints" passHref>
             <Button variant="outline" className="w-full h-full flex-col py-3">
               <MessageSquareText className="h-6 w-6 mb-1 text-accent" /> {/* Icon for complaint status */}
               <span className="text-xs text-center">Complaint Status</span>
             </Button>
           </Link>
            {/* Manage Pass Button (Links to renew page which handles viewing too) */}
           <Link href="/student/renew-pass" passHref>
               <Button variant="outline" className="w-full h-full flex-col py-3">
                   <CreditCard className="h-6 w-6 mb-1 text-accent" />
                   <span className="text-xs text-center">Manage Pass</span>
               </Button>
            </Link>
            {/* Register/Update Bus Button - Renamed */}
            <Button
                variant="outline"
                className="w-full h-full flex-col py-3"
                onClick={() => setIsRegisterBusModalOpen(true)}
            >
                <BusFront className="h-6 w-6 mb-1 text-accent" />
                 <span className="text-xs text-center">
                     Register/Update My Bus
                 </span>
            </Button>
        </div>
      </div>


       {/* Live Bus Location Section (No Card) */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Live Bus Location</h3>
         {isLoadingLocation ? (
             <Skeleton className="h-[350px] w-full rounded-md" />
         ) : busLocation ? (
             <MapComponent
                 center={mapCenter}
                 busLocation={busLocation ? { lat: busLocation.lat, lng: busLocation.lng } : undefined}
                 markers={mapMarkers}
                 containerStyle={{ height: '350px', width: '100%', borderRadius: '0.5rem' }}
             />
         ) : (
             <p className="text-muted-foreground text-center p-4">No live location available. Please register your bus route to see live tracking.</p>
         )}
      </div>

       {/* Bus Route & Status Section (No Card) */}
       <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold leading-none tracking-tight text-primary flex items-center gap-2">
                    <RouteIcon className="h-5 w-5" /> {/* Added RouteIcon */}
                     Bus Route &amp; Status
                 </h3>
                 {busRoute?.routeName && <span className="text-sm font-medium text-muted-foreground">({busRoute.routeName})</span>}
            </div>
           {isLoadingRoute ? (
                <div className="space-y-3 h-60 rounded-md border p-3 bg-secondary">
                   <Skeleton className="h-6 w-3/4" />
                   <Skeleton className="h-6 w-full" />
                   <Skeleton className="h-6 w-5/6" />
                   <Skeleton className="h-6 w-2/3" />
                </div>
           ) : busRoute && busRoute.stops.length > 0 ? (
                <ScrollArea className="h-60 w-full rounded-md border p-3 bg-secondary">
                   <ul className="space-y-3">
                     {busRoute.stops.map((stop, index) => {
                       const isReached = index < currentStopIndex;
                       const isCurrentOrUpcoming = index >= currentStopIndex;
                       const eta = findEtaForStop(stop.name);

                       return (
                         <li key={stop.name} className={cn(
                           "flex items-center justify-between text-sm p-2 rounded transition-colors",
                           isReached ? "text-muted-foreground opacity-70 bg-secondary/50" : "font-medium",
                           index === currentStopIndex && "bg-primary/10 ring-1 ring-primary/30" // Highlight next stop more clearly
                         )}>
                           <div className="flex items-center gap-3">
                             {isReached ? (
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" title="Reached" />
                              ) : index === currentStopIndex ? (
                                <CircleDot className="h-5 w-5 text-primary animate-pulse shrink-0" title="Next Stop" />
                              ) : (
                                <CircleDot className="h-5 w-5 text-muted-foreground/60 shrink-0" title="Upcoming" /> // Use CircleDot for upcoming, slightly dimmed
                              )}
                             <span className={cn(isReached && "line-through")}>{stop.name}</span>
                           </div>
                            <span className={cn("flex items-center text-xs gap-1", isReached ? "text-muted-foreground/70" : "text-muted-foreground")}>
                               <Clock className="h-3 w-3" />
                               {eta ? `ETA: ${eta}` : (isReached ? 'Reached' : 'Upcoming')}
                           </span>
                         </li>
                       );
                     })}
                   </ul>
               </ScrollArea>
           ) : (
                <p className="text-muted-foreground text-center p-4">No route information available. Please register your bus route.</p>
           )}
       </div>

       {/* Raise Complaint & Contact Office Buttons Section (No Card) */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Support & Feedback</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Use grid for side-by-side on larger screens */}
           <Link href="/student/complaint" passHref>
             <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                 <CircleAlert className="mr-2 h-4 w-4 text-destructive" />
                 <span>Raise a Complaint</span>
             </Button>
           </Link>
            {/* Contact Office Button (Triggers Dialog) */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                    <Phone className="mr-2 h-4 w-4 text-accent" />
                     <span>Contact Transport Office</span>
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
        </div>
      </div>

       {/* Register Bus Modal */}
      <RegisterBusModal
        isOpen={isRegisterBusModalOpen}
        onClose={() => setIsRegisterBusModalOpen(false)}
        availableRoutes={mockAvailableRoutes}
        onSubmit={handleBusRegistrationSubmit}
        currentRegisteredRoute={registeredRoute} // Pass the currently registered route state
      />


    </div>
  );
};

export default StudentDashboardPage;

    