
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserCog, Trash2, Bus, ShieldCheck, UserX, PlusCircle } from 'lucide-react'; // Import UserX, PlusCircle
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserActions } from '@/components/admin/user-actions'; // Import UserActions using named import
import AddEditUserModal from '@/components/admin/add-edit-user-modal'; // Import the new modal

// Type definitions
export type UserRole = 'Student' | 'Teacher' | 'Driver'; // Export UserRole
export type UserStatus = 'Active' | 'Inactive'; // Export UserStatus

export interface UserData { // Export UserData interface
  id: string;
  name: string;
  email: string; // Assuming email is used for identification
  role: UserRole;
  assignedBus?: string; // Relevant for Drivers
  status: UserStatus;
}

// localStorage key for users
export const ADMIN_USERS_LOCAL_STORAGE_KEY = 'adminUsersData';

// Initial Mock Data - This will be loaded only if localStorage is empty
const initialMockUsers: UserData[] = [
  { id: 'S001', name: 'Shashi Sharma', email: 'shashi@university.edu', role: 'Student', status: 'Active' },
  { id: 'S002', name: 'Amit Singh', email: 'amit@university.edu', role: 'Student', status: 'Active' },
  { id: 'S003', name: 'Priya Mehta', email: 'priya@university.edu', role: 'Student', status: 'Inactive' },
  { id: 'T001', name: 'Anita Desai', email: 'anita.d@university.edu', role: 'Teacher', status: 'Active' },
  { id: 'D001', name: 'Rajesh Kumar', email: 'rajesh.k@transport.co', role: 'Driver', assignedBus: 'HR 26 B 7890', status: 'Active' },
  { id: 'D002', name: 'Vikram Rathod', email: 'vikram.r@transport.co', role: 'Driver', assignedBus: 'DL 1A 4567', status: 'Active' },
  { id: 'D003', name: 'Anjali Sharma', email: 'anjali.s@transport.co', role: 'Driver', assignedBus: 'UP 15 C 1122', status: 'Inactive' },
];

// Mock Available Buses (for Assign Bus modal) - Use actual buses if possible
const mockAvailableBuses = [
    { id: 'HR 26 B 7890', name: 'Tata Marcopolo' },
    { id: 'DL 1A 4567', name: 'Ashok Leyland Lynx' },
    { id: 'UP 15 C 1122', name: 'Eicher Skyline Pro' },
    { id: 'MH 01 Z 9988', name: 'Force Traveller' },
];

const UserManagementTable: FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState<UserRole | 'All'>('All');
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for Add/Edit modal
  const [editingUser, setEditingUser] = useState<UserData | null>(null); // State to track user being edited

  // Function to save users to localStorage and dispatch event
  const persistUsers = (updatedUsers: UserData[]) => {
      try {
           const currentData = localStorage.getItem(ADMIN_USERS_LOCAL_STORAGE_KEY);
           const newData = JSON.stringify(updatedUsers);

           localStorage.setItem(ADMIN_USERS_LOCAL_STORAGE_KEY, newData);

            // Dispatch a storage event so other tabs/windows (like the dashboard) can react
           window.dispatchEvent(new StorageEvent('storage', {
               key: ADMIN_USERS_LOCAL_STORAGE_KEY,
               oldValue: currentData,
               newValue: newData,
               storageArea: localStorage,
           }));
      } catch (error) {
          console.error("Failed to save users to localStorage:", error);
          toast({ title: "Error", description: "Could not save user changes locally.", variant: "destructive" });
      }
  };


  // Load users from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUsers = localStorage.getItem(ADMIN_USERS_LOCAL_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Initialize with default mock data if nothing in storage
        setUsers(initialMockUsers);
        persistUsers(initialMockUsers); // Save initial data
      }
    } catch (error) {
      console.error("Failed to load users from localStorage:", error);
      setUsers(initialMockUsers); // Fallback to initial data
      toast({ title: "Error", description: "Could not load saved user data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Filter users based on search term AND currentTab
  const filteredUsers = users.filter(user => {
      const matchesRole = currentTab === 'All' || user.role === currentTab;
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.assignedBus && user.assignedBus.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesRole && matchesSearch;
  });

   // --- Action Handlers that update state and persist ---

   const handleAssignBusAction = async (userId: string, busId: string) => {
       console.log(`ACTION: Assign bus ${busId} to user ${userId}`);
       const updatedUsers = users.map(u => u.id === userId ? { ...u, assignedBus: busId } : u);
       setUsers(updatedUsers);
       persistUsers(updatedUsers);
       toast({ title: "Bus Assigned", description: `Bus ${busId} assigned to user ${userId}.` });
   };

    // Opens the modal for editing
    const handleEditUserAction = (user: UserData) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };


   const handleToggleStatusAction = async (userId: string, newStatus: 'Active' | 'Inactive') => {
       console.log(`ACTION: Set user ${userId} status to ${newStatus}`);
       const updatedUsers = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
       setUsers(updatedUsers);
       persistUsers(updatedUsers);
       toast({ title: "Status Updated", description: `User ${userId} status set to ${newStatus}.` });
   };

   const handleRemoveUserAction = async (userId: string) => {
       console.log(`ACTION: Remove user ${userId}`);
       const updatedUsers = users.filter(u => u.id !== userId);
       setUsers(updatedUsers);
       persistUsers(updatedUsers);
       toast({ title: "User Removed", description: `User ${userId} has been removed.`, variant: "destructive" });
   };

    // Function to handle opening the modal for adding a new user
    const handleAddNewUser = () => {
        setEditingUser(null); // Ensure we are adding
        setIsModalOpen(true);
    };

    // Function to handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null); // Clear editing state
    };

    // Function to handle saving a user (add or edit) from the modal
    const handleSaveUser = async (userData: Omit<UserData, 'id' | 'status' | 'assignedBus'> | UserData) => {
        // Simulate backend save (optional, as we use localStorage)
        console.log(`Simulating save user:`, userData);
        await new Promise(resolve => setTimeout(resolve, 500));

        let updatedUsers: UserData[];
        const isEditing = 'id' in userData && !!editingUser; // Check if we are in edit mode

        if (isEditing) {
            // Editing logic: Replace the old user with the updated one (keep existing ID, status, assignedBus)
             updatedUsers = users.map(u => (u.id === userData.id ? { ...u, name: userData.name, email: userData.email, role: userData.role } : u));
             toast({ title: "User Updated", description: `User "${userData.name}" updated successfully.` });
        } else {
            // Adding logic: Assign a mock ID, default status to Active
             const newUser: UserData = {
                ...(userData as Omit<UserData, 'id'>), // Cast to exclude id, status, assignedBus
                id: `${userData.role.charAt(0).toUpperCase()}${Date.now().toString().slice(-5)}`, // Generate simple ID
                status: 'Active', // Default status
                assignedBus: undefined, // No bus assigned initially
            };
             updatedUsers = [...users, newUser];
             toast({ title: "User Added", description: `User "${newUser.name}" added successfully.` });
        }
        setUsers(updatedUsers);
        persistUsers(updatedUsers); // Save to localStorage and dispatch event

        handleCloseModal(); // Close modal after successful save
    };


  // Badge styling based on role
  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'Student': return 'default'; // Primary color
      case 'Teacher': return 'secondary'; // Secondary color
      case 'Driver': return 'outline'; // Outline or another distinct color
      default: return 'default';
    }
  };

   // Badge styling based on status
  const getStatusBadgeClass = (status: UserStatus): string => {
    return status === 'Active'
        ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
  };


  return (
    <>
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6 pt-0 space-y-4">
            {/* Tabs for Filtering by Role */}
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as UserRole | 'All')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
                <TabsList>
                <TabsTrigger value="All">All Users</TabsTrigger>
                <TabsTrigger value="Student">Students</TabsTrigger>
                <TabsTrigger value="Teacher">Teachers</TabsTrigger>
                <TabsTrigger value="Driver">Drivers</TabsTrigger>
                </TabsList>
                 <div className="flex gap-2 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, email, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full"
                        />
                    </div>
                     {/* Add New User Button */}
                    <Button onClick={handleAddNewUser} className="shrink-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add User
                    </Button>
                 </div>
            </div>

            {/* Table Content for each Tab */}
            <TabsContent value={currentTab} className="mt-0"> {/* Use currentTab value */}
                <Table>
                <TableHeader>
                    <TableRow>
                    {/* Columns based on requirements */}
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    {currentTab === 'Driver' && <TableHead>Assigned Bus</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && Array.from({ length: 5 }).map((_, index) => ( // Skeletons
                    <TableRow key={`skel-user-${index}`}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        {currentTab === 'Driver' && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                    ))}
                    {!isLoading && filteredUsers.length === 0 && (
                    <TableRow><TableCell colSpan={currentTab === 'Driver' ? 6 : 5} className="h-24 text-center text-muted-foreground">No users found matching your criteria.</TableCell></TableRow>
                    )}
                    {!isLoading && filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{user.id}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                        <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                        <Badge className={cn("capitalize", getStatusBadgeClass(user.status))}>{user.status}</Badge>
                        </TableCell>
                        {currentTab === 'Driver' && (
                        <TableCell>{user.assignedBus || <span className="text-muted-foreground text-xs">N/A</span>}</TableCell>
                        )}
                        <TableCell className="text-right">
                        {/* --- Actions Dropdown and Integration --- */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">User Actions</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* Pass handleEditUserAction directly to UserActions */}
                                <UserActions
                                    user={user}
                                    onAssignBus={handleAssignBusAction}
                                    onEditUser={handleEditUserAction} // Pass the edit handler
                                    onToggleStatus={handleToggleStatusAction}
                                    onRemoveUser={handleRemoveUserAction}
                                    availableBuses={mockAvailableBuses} // Pass available buses
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* --- End Actions Integration --- */}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TabsContent>
            </Tabs>
        </div>
        </div>

        {/* Add/Edit User Modal */}
        <AddEditUserModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSaveUser}
            userData={editingUser} // Pass null for adding, or existing data for editing
        />
    </>
  );
};

export default UserManagementTable;
