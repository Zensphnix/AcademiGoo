

"use client";

import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Route, Map, MessageSquareWarning, LogOut, Settings, Menu, Users, Bus, Moon, Sun, Languages
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

interface AdminLayoutComponentProps {
  children: ReactNode;
}

const ADMIN_LANGUAGE_STORAGE_KEY = 'adminPreferredLanguage';

const AdminLayoutComponent: FC<AdminLayoutComponentProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default to English

  // Load language preference on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY);
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'hi')) {
        setCurrentLanguage(storedLanguage);
        console.log(`Loaded language preference: ${storedLanguage}`);
    }
  }, []);

  const menuItems = [
    { href: '/admin/live-map', label: 'Live Map', icon: Map },
  ];

  const adminUser = {
    name: 'Admin User',
    initials: 'AU',
    avatarUrl: undefined,
  };

  const handleLogout = () => {
    console.log("Admin logging out");
    toast({ title: "Logged Out", description: "You have been logged out." });
    router.push('/admin/login');
  };

   const handleLanguageChange = (lang: string) => {
        if (lang === 'en' || lang === 'hi') {
            setCurrentLanguage(lang);
            // Persist language preference
            localStorage.setItem(ADMIN_LANGUAGE_STORAGE_KEY, lang);
            toast({ title: "Language Preference Updated", description: `Language set to ${lang === 'en' ? 'English' : 'Hindi'}. UI refresh may be needed for full effect.` });
            console.log("Language changed to:", lang);
             // Note: A full UI refresh or integration with an i18n library is needed
             // for the actual text on the page to change. This only saves the preference.
        }
   }

  const pageTitle = menuItems.find((item) => pathname.startsWith(item.href))?.label ||
                     (pathname.startsWith('/admin/dashboard') ? 'Dashboard' : 'Admin Panel');


  const NavLinks: FC<{ isMobile?: boolean }> = ({ isMobile }) => (
    <nav className={`flex items-center gap-4 ${isMobile ? 'flex-col items-start p-4' : 'hidden md:flex'}`}>
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith(item.href) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          onClick={isMobile ? () => {} : undefined} // Close sheet on mobile click if needed
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
      {/* Add Dashboard link manually to mobile nav if needed */}
      {isMobile && (
           <Link
              href="/admin/dashboard"
              className={`flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith('/admin/dashboard') ? 'text-primary font-semibold bg-muted' : 'text-muted-foreground'}`}
               onClick={() => {}} // Assuming close sheet function is passed or handled differently
             >
              <LayoutDashboard className="h-4 w-4" />
               Dashboard
            </Link>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-sm">
        {/* Left side: Logo and Desktop Nav */}
        <div className="flex items-center gap-6">
          {/* App Logo/Name */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-primary">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
             </svg>
            <span className="hidden md:inline">AcademiGo Admin</span>
          </Link>
          {/* Desktop Navigation */}
          <NavLinks />
        </div>

        {/* Right side: Mobile Menu and User Dropdown */}
        <div className="flex items-center gap-2 md:gap-4">
             {/* Settings Icon Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:text-primary" title="Settings">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {/* Link to full settings page */}
                     <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                        <Settings className="mr-2 h-4 w-4" /> Application Settings
                     </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Dark Mode Toggle */}
                    <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     {/* Language Selection */}
                     <DropdownMenuLabel className="flex items-center gap-2"><Languages className="h-4 w-4" /> Language</DropdownMenuLabel>
                     {/* Use the state variable 'currentLanguage' here */}
                     <DropdownMenuRadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
                        <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="hi">Hindi</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                 <Avatar className="size-8">
                    <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {adminUser.initials}
                    </AvatarFallback>
                  </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{adminUser.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
               {/* Add links for pages removed from main nav here if needed */}
               <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                 <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
               </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/routes')}>
                 <Route className="mr-2 h-4 w-4" /> Manage Routes
               </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/complaints')}>
                 <MessageSquareWarning className="mr-2 h-4 w-4" /> View Complaints
               </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                   <Users className="mr-2 h-4 w-4" /> Manage Users
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/admin/buses')}>
                   <Bus className="mr-2 h-4 w-4" /> Manage Buses
                 </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Navigation Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              {/* Mobile Logo/Name */}
              <div className="flex h-16 items-center border-b px-4">
                 <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                       <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
                    </svg>
                    <span>AcademiGo Admin</span>
                 </Link>
              </div>
              {/* Mobile Navigation Links */}
              <NavLinks isMobile />
               {/* Add other links removed from main nav to mobile */}
               <div className="p-4 border-t mt-auto space-y-2">
                   <Link
                      href="/admin/routes"
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                     >
                      <Route className="h-4 w-4" />
                       Manage Routes
                    </Link>
                     <Link
                      href="/admin/complaints"
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                     >
                      <MessageSquareWarning className="h-4 w-4" />
                       View Complaints
                    </Link>
                     <Link
                      href="/admin/users"
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                     >
                      <Users className="h-4 w-4" />
                       Manage Users
                    </Link>
                    <Link
                      href="/admin/buses"
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                     >
                      <Bus className="h-4 w-4" />
                       Manage Buses
                    </Link>
               </div>
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

export default AdminLayoutComponent;
