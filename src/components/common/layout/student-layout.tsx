
"use client";

import type { FC, ReactNode } from 'react';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, FileText, MessageSquareWarning, User, LogOut, Bell, Menu, ScanLine, Phone, CreditCard, Search, Bus, Settings, Moon, Sun, Languages, Clock, MessageSquareText, Route as RouteIcon
} from 'lucide-react'; // Added RouteIcon
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes'; // Import useTheme

interface StudentLayoutComponentProps {
  children: ReactNode;
}

// Mock contact info (Updated)
const transportDepartment = "Transport Department - K.R. Mangalam University";
const transportOfficeLocation = "Block A, Ground Floor, KRMU Campus";
const transportOfficeContact = "+91-9876543210";
const transportOfficeEmail = "transport@university.edu";
const transportOfficeHours = "8:00 AM – 6:00 PM (Monday to Saturday)";


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

// Key for localStorage
const LOCAL_STORAGE_USERNAME_KEY = 'userName';
const STUDENT_LANGUAGE_STORAGE_KEY = 'studentPreferredLanguage';

// Function to get initials
const getInitials = (name: string): string => {
  return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2) // Take max 2 initials
      .join('')
      .toUpperCase() || 'S'; // Default to 'S' if name is empty
};

const StudentLayoutComponent: FC<StudentLayoutComponentProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<MockBus[]>([]);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Student', initials: 'S', avatarUrl: undefined });
  const [currentLanguage, setCurrentLanguage] = useState('en');

   // Effect to handle initial mount and localStorage access
   useEffect(() => {
    setHasMounted(true);
    // Fetch initial user name from local storage
    const storedName = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY) || 'Student';
    setUser({
        name: storedName,
        initials: getInitials(storedName),
        avatarUrl: undefined // Assuming no avatar URL for now
    });

     // Load language preference on mount
    const storedLanguage = localStorage.getItem(STUDENT_LANGUAGE_STORAGE_KEY);
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'hi')) {
        setCurrentLanguage(storedLanguage);
        console.log(`Student language preference: ${storedLanguage}`);
    }

    // Add event listener for storage changes (for username)
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_USERNAME_KEY) {
            const newName = event.newValue || 'Student';
            setUser({
                name: newName,
                initials: getInitials(newName),
                avatarUrl: undefined
            });
        }
         // Could also listen for language changes if needed across tabs
         // if (event.key === STUDENT_LANGUAGE_STORAGE_KEY) { ... }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount


  // Define menu items for the mobile sidebar/sheet
  const mobileMenuItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/bus-pass', label: 'View Bus Pass', icon: FileText },
    { href: '/student/renew-pass', label: 'Manage Pass', icon: CreditCard }, // Updated link
    { href: '/student/scan-attendance', label: 'Scan Attendance', icon: ScanLine },
    { href: '/student/eta', label: 'Check ETA', icon: Clock }, // Added ETA link
    { href: '/student/complaint', label: 'Raise Complaint', icon: MessageSquareWarning },
    { href: '/student/complaints', label: 'Complaint Status', icon: MessageSquareText }, // Updated icon
    { href: '/student/notifications', label: 'Notifications', icon: Bell },
    { href: '/student/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    console.log("Student logging out");
    if (typeof window !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_USERNAME_KEY);
    toast({ title: "Logged Out", description: "You have been logged out." });
    router.push('/student/login');
  };

   // Use useCallback to memoize the search handler
    const handleSearchChange = (value: string) => {
       setSearchQuery(value); // Update search query state directly

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
            setIsSearchPopoverOpen(true); // Keep popover open while typing with results
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

   const handleLanguageChange = (lang: string) => {
       if (lang === 'en' || lang === 'hi') {
            setCurrentLanguage(lang);
            localStorage.setItem(STUDENT_LANGUAGE_STORAGE_KEY, lang);
            toast({ title: "Language Changed", description: `Language set to ${lang === 'en' ? 'English' : 'Hindi'}. (UI update needed)` });
            console.log("Language changed to:", lang);
             // Note: A full UI refresh or integration with an i18n library is needed
             // for the actual text on the page to change. This only saves the preference.
        }
   }

  // Separate component for Mobile Nav Links inside the sheet
  const MobileNavLinks: FC<{ onLinkClick: () => void }> = ({ onLinkClick }) => (
    <nav className="flex flex-col items-start p-4 gap-3">
      {mobileMenuItems.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            pathname.startsWith(item.href) ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={onLinkClick}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
      {/* Add Contact Office and Logout buttons separately */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
            <Phone className="h-5 w-5" /> Contact Office
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
      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
        <LogOut className="h-5 w-5" /> Logout
      </Button>
    </nav>
  );

  // Conditional rendering only after mount
  if (!hasMounted) {
     // Render minimal layout or skeleton during SSR/initial load
     return (
         <div className="flex min-h-screen w-full flex-col">
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-sm">
                 {/* Left side: Logo */}
                 <div className="flex items-center gap-6">
                     <Link href="/student/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                             <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
                         </svg>
                         <span className="hidden md:inline">AcademiGo</span>
                     </Link>
                 </div>
                 {/* Right side placeholder */}
                 <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-muted hidden md:inline-flex"></div> {/* Placeholder for search */}
                    <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Placeholder for notification */}
                    <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Placeholder for settings */}
                    <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Placeholder for profile */}
                    <div className="h-8 w-8 rounded-full bg-muted md:hidden"></div> {/* Placeholder for mobile menu */}
                 </div>
             </header>
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-secondary">
                 {children}
             </main>
         </div>
     );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-sm">
        {/* Left side: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/student/dashboard" className="flex items-center gap-2 font-semibold text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
            </svg>
            <span className="hidden md:inline">AcademiGo</span>
          </Link>
        </div>

        {/* Right side: Icons and Mobile Menu */}
        <div className="flex items-center gap-4"> {/* Reverted from gap-2 md:gap-4 */}
             {/* Search Popover */}
             <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:text-primary hidden md:inline-flex">
                         <Search className="h-5 w-5" />
                         <span className="sr-only">Search</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end">
                    {/* Use controlled CommandInput and handle changes */}
                    <Command shouldFilter={false} /* We filter manually */ >
                         <CommandInput
                            placeholder="Search buses, routes, drivers..."
                            value={searchQuery}
                            onValueChange={handleSearchChange} // Use the stateful change handler
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }} // Trigger search on Enter
                         />
                         <CommandList>
                             <CommandEmpty>{searchQuery.trim() && !filteredSuggestions.length ? 'No results found.' : (searchQuery.trim() ? '' : 'Type to search...')}</CommandEmpty>
                             {filteredSuggestions.length > 0 && (
                                 <CommandGroup heading="Suggestions">
                                    {filteredSuggestions.map((bus) => (
                                         <CommandItem
                                             key={bus.id}
                                             value={bus.id} // Use ID for value, helps with selection
                                             onSelect={() => handleSuggestionSelect(bus)}
                                             className="cursor-pointer"
                                         >
                                            <Bus className="mr-2 h-4 w-4 text-muted-foreground" />
                                             <div className="flex flex-col">
                                                 <span><span className="font-medium">{bus.id}</span> ({bus.route})</span>
                                                 {/* Display driver and status */}
                                                 <span className="text-xs text-muted-foreground">Driver: {bus.driver} | Status: {bus.status}</span>
                                             </div>
                                         </CommandItem>
                                    ))}
                                 </CommandGroup>
                             )}
                         </CommandList>
                     </Command>
                 </PopoverContent>
             </Popover>

          {/* Notification Icon */}
           <Link href="/student/notifications" passHref>
             <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:text-primary">
                 <Bell className="h-5 w-5" />
                 <span className="sr-only">Notifications</span>
             </Button>
          </Link>

           {/* Settings Icon & Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:text-primary">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Dark Mode Toggle */}
                    <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     {/* Language Selection */}
                     <DropdownMenuLabel className="flex items-center gap-2"><Languages className="h-4 w-4" /> Language</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
                        <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="hi">Hindi</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

          {/* User Dropdown - Uses fetched user data */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/student/profile')}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Navigation Trigger */}
             <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <div className="flex h-16 items-center border-b px-4">
                    <Link href="/student/dashboard" className="flex items-center gap-2 font-semibold text-primary" onClick={() => setIsMobileSheetOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
                      </svg>
                      <span>AcademiGo</span>
                    </Link>
                  </div>
                  <MobileNavLinks onLinkClick={() => setIsMobileSheetOpen(false)} />
                </SheetContent>
              </Sheet>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-secondary">
        {children}
      </main>
    </div>
  );
};

export default StudentLayoutComponent;

    