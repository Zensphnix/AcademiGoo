
"use client";

import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import Link from 'next/link';
import { LogOut, User, Navigation, Languages, HelpCircle, Settings, Sun, Moon } from 'lucide-react'; // Added more icons
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'; // Import Dropdown components
import { useTheme } from "next-themes"; // Import useTheme

interface DriverLayoutComponentProps {
  children: ReactNode;
  title: string; // Title for the header, passed from layout.tsx
}

// Key for localStorage
const DRIVER_LANGUAGE_STORAGE_KEY = 'driverPreferredLanguage';
const LOCAL_STORAGE_USERNAME_KEY = 'driverName'; // Assuming driver name is stored

// Function to get initials
const getInitials = (name: string): string => {
  return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2) // Take max 2 initials
      .join('')
      .toUpperCase() || 'D'; // Default to 'D' if name is empty
};

// Renamed component to avoid naming collision
const DriverLayoutComponent: FC<DriverLayoutComponentProps> = ({ children, title }) => {
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast
  const { theme, setTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState({ name: 'Driver', initials: 'D', avatarUrl: undefined });
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Effect to handle initial mount and localStorage access
  useEffect(() => {
    setHasMounted(true);
    // Fetch initial user name from local storage
    // Use a specific key for driver name if needed, or fetch from auth context
    const storedName = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY) || 'Rajesh Kumar'; // Default to example name
    setUser({
        name: storedName,
        initials: getInitials(storedName),
        avatarUrl: undefined // Assuming no avatar URL for now
    });

    // Load language preference on mount
    const storedLanguage = localStorage.getItem(DRIVER_LANGUAGE_STORAGE_KEY);
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'hi')) {
        setCurrentLanguage(storedLanguage);
        console.log(`Driver language preference: ${storedLanguage}`);
    }

    // Add event listener for storage changes (for username)
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_USERNAME_KEY) {
            const newName = event.newValue || 'Driver';
            setUser({
                name: newName,
                initials: getInitials(newName),
                avatarUrl: undefined
            });
        }
        // Optionally listen for language changes if needed
        // if (event.key === DRIVER_LANGUAGE_STORAGE_KEY) { ... }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Run only once on mount

  const handleLogout = () => {
    // Add actual logout logic (clear session/token, API call)
    console.log("Driver logging out");
    if (typeof window !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_USERNAME_KEY);
    toast({ title: "Logged Out", description: "You have been logged out." });
    router.push('/driver/login');
  };

  const handleLanguageChange = (lang: string) => {
       if (lang === 'en' || lang === 'hi') {
            setCurrentLanguage(lang);
            localStorage.setItem(DRIVER_LANGUAGE_STORAGE_KEY, lang);
            toast({ title: "Language Changed", description: `Language set to ${lang === 'en' ? 'English' : 'Hindi'}. (UI update needed)` });
            console.log("Driver Language changed to:", lang);
             // Note: A full UI refresh or integration with an i18n library is needed
             // for the actual text on the page to change. This only saves the preference.
        }
   }

   // Render minimal header if not mounted yet to avoid hydration errors
   if (!hasMounted) {
     return (
         <div className="flex min-h-screen flex-col">
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 shadow-sm">
                <div className="flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(var(--primary))" className="w-7 h-7 shrink-0">
                       <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
                    </svg>
                    <h1 className="text-xl font-semibold text-primary">{title}</h1>
                </div>
                 <div className="flex items-center gap-4">
                     <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Placeholder for settings */}
                     <div className="h-8 w-8 rounded-full bg-muted"></div> {/* Placeholder for avatar */}
                     <div className="h-9 w-20 rounded-md bg-muted"></div> {/* Placeholder for logout */}
                 </div>
             </header>
             <main className="flex-1 bg-secondary p-4 sm:p-6">
                 {children}
             </main>
         </div>
     );
   }


  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 shadow-sm">
        {/* Left side: App Icon and Page Title */}
        <div className="flex items-center gap-3">
             {/* App Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(var(--primary))" className="w-7 h-7 shrink-0">
               <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
            </svg>
             {/* Page Title (Dynamic) */}
            <h1 className="text-xl font-semibold text-primary">{title}</h1>
        </div>
        {/* Right side: Settings, Driver Info and Logout */}
        <div className="flex items-center gap-2 md:gap-4"> {/* Adjusted gap */}

           {/* Settings Dropdown */}
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
                      <DropdownMenuSeparator />
                     {/* Help Link (Optional: link to admin contact/FAQ) */}
                     <DropdownMenuItem onClick={() => alert('Contact Admin: transport@university.edu / +91-9876543210')}>
                       <HelpCircle className="mr-2 h-4 w-4" /> Help / Contact Admin
                     </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

          {/* Driver Name and Avatar */}
          <div className="flex items-center gap-2 text-sm font-medium">
             <Avatar className="size-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.initials}
                </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user.name}</span> {/* Hide name on small screens */}
          </div>
           {/* Logout Button */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span> {/* Hide text on small screens */}
          </Button>
        </div>
      </header>
      {/* Main Content Area */}
      <main className="flex-1 bg-secondary p-4 sm:p-6">
        {children}
      </main>
       {/* Optional: Add a simple bottom navigation for key actions on mobile */}
       {/* <footer className="sticky bottom-0 z-30 flex h-14 items-center justify-around border-t bg-background shadow-sm md:hidden">
         <Link href="/driver/dashboard"><Button variant="ghost" size="sm"><LayoutDashboard className="h-5 w-5" /></Button></Link>
         <Link href="/driver/attendance"><Button variant="ghost" size="sm"><ScanLine className="h-5 w-5" /></Button></Link>
         <Link href="/driver/sos-navigation"><Button variant="ghost" size="sm"><Navigation className="h-5 w-5" /></Button></Link>
       </footer> */}
    </div>
  );
};

export default DriverLayoutComponent;
