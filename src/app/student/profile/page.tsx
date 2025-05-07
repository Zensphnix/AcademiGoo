
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock user data structure
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Teacher'; // Align with signup
  avatarUrl?: string; // Optional
  // Add other relevant fields like contact number, department, etc.
}

// Mock API function
const fetchUserProfile = async (): Promise<UserProfile> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  // Use details matching Shashi from other pages for consistency
  // Fetch from local storage first for persistence across loads
   const storedName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
  return {
    id: 'S001',
    fullName: storedName || 'Shashi Sharma', // Use stored name or default
    email: 'shashi@university.edu',
    role: 'Student',
    avatarUrl: undefined, // No avatar URL in mock data
  };
};

const LOCAL_STORAGE_USERNAME_KEY = 'userName'; // Define key for consistency

const StudentProfilePage: FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Renamed from isLoading for clarity during save operation
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  // Add state for other editable fields if needed
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    fetchUserProfile()
      .then((data) => {
        setProfile(data);
        setEditedName(data.fullName); // Initialize edited name
      })
      .catch(error => {
          console.error("Failed to fetch profile:", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  }, [toast]); // Include toast in dependency array

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset changes if canceling edit mode
      if (profile) setEditedName(profile.fullName);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!profile || !editedName.trim()) {
        toast({ title: "Invalid Input", description: "Full name cannot be empty.", variant: "destructive" });
        return;
    };
    setIsSaving(true); // Indicate saving operation
    console.log("Saving profile changes:", { fullName: editedName });
    // Simulate API call to update profile
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
        const trimmedName = editedName.trim();
        // Create the updated profile object explicitly
        const updatedProfile: UserProfile = {
            ...profile, // Spread the existing profile
            fullName: trimmedName, // Use the trimmed edited name
        };
        // Update local state with the new object
        setProfile(updatedProfile);

         // Update localStorage with the new name
         if (typeof window !== 'undefined') {
            const oldName = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);
            localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, trimmedName);
             // Dispatch a storage event so other components (like the layout) can react
             window.dispatchEvent(new StorageEvent('storage', {
                 key: LOCAL_STORAGE_USERNAME_KEY,
                 oldValue: oldName,
                 newValue: trimmedName,
                 storageArea: localStorage,
             }));
         }

        setIsEditing(false); // Exit editing mode
         toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error) {
         console.error("Failed to save profile:", error);
         toast({ title: "Save Failed", description: "Could not save profile changes.", variant: "destructive" });
    } finally {
        setIsSaving(false); // Finish saving operation
    }
  };

   // Helper to generate initials
   const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2) // Take max 2 initials
            .join('')
            .toUpperCase();
   };

  // Display loading state for initial fetch
   if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="p-6 flex flex-col items-center text-center pb-6 border-b">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex items-center p-6 pt-6 border-t justify-end gap-4">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // Display if profile fetch failed or no profile found
  if (!profile) {
     return (
        <div className="container mx-auto py-6 flex justify-center">
             <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-lg p-6 text-center">
                 <h2 className="text-2xl font-semibold leading-none tracking-tight text-muted-foreground">Profile Not Found</h2>
                 <p className="text-center text-muted-foreground mt-4">Unable to load profile information.</p>
             </div>
        </div>
     );
  }

  // Display actual profile content
  // This part will re-render when `profile` state changes after saving
  return (
    <div className="container mx-auto py-6 flex justify-center">
      <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6 flex flex-col items-center text-center pb-6 border-b">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
               {/* Uses getInitials with the current profile.fullName state */}
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
             {/* Uses the current profile.fullName state */}
            <h2 className="text-2xl font-semibold leading-none tracking-tight">{profile.fullName}</h2>
            <p className="text-sm text-muted-foreground">{profile.email} ({profile.role})</p>
        </div>
        <div className="p-6 space-y-6">
            {/* Full Name Field */}
            <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                    <Input
                        id="fullName"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        disabled={isSaving} // Disable while saving
                    />
                ) : (
                     // Uses the current profile.fullName state when not editing
                    <p className="text-lg font-medium text-foreground border px-3 py-2 rounded-md bg-secondary">{profile.fullName}</p>
                )}
            </div>
            {/* Email Field (Read-only) */}
            <div className="grid gap-2">
                <Label htmlFor="email">College Email</Label>
                <p className="text-lg text-muted-foreground border px-3 py-2 rounded-md bg-secondary">{profile.email}</p>
            </div>
             {/* Role Field (Read-only) */}
            <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <p className="text-lg text-muted-foreground border px-3 py-2 rounded-md bg-secondary">{profile.role}</p>
            </div>
             {/* Add other fields here */}
        </div>
        <div className="flex items-center p-6 pt-6 border-t justify-end gap-4">
          {isEditing ? (
             <>
                 <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>
                    Cancel
                 </Button>
                 <Button onClick={handleSaveChanges} disabled={isSaving || !editedName.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                 </Button>
             </>
          ) : (
             <Button variant="outline" onClick={handleEditToggle}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
             </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
