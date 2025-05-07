
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid college email address.' }).regex(/^[a-zA-Z0-9._%+-]+@university\.edu$/, { message: "Email must end with @university.edu" }),
  password: z.string().min(1, { message: 'Please enter your password.' }), // Simplified min length for login
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LOCAL_STORAGE_USERNAME_KEY = 'userName';
const LOCAL_STORAGE_DEVICE_ID_KEY = 'academiGoDeviceId';
const LOCAL_STORAGE_DEVICE_BINDING_KEY = 'academiGoDeviceBinding';
const LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY = 'deviceBindingEnabled'; // Key to check if feature is on

// Helper function to get or generate a device ID
const getOrGenerateDeviceId = (): string => {
    if (typeof window === 'undefined') return 'server-device'; // Shouldn't happen in client component, but safe fallback
    let deviceId = localStorage.getItem(LOCAL_STORAGE_DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem(LOCAL_STORAGE_DEVICE_ID_KEY, deviceId);
        console.log("Generated new device ID:", deviceId);
    }
    return deviceId;
};

// Helper function to get device bindings map
const getDeviceBindings = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const bindingsRaw = localStorage.getItem(LOCAL_STORAGE_DEVICE_BINDING_KEY);
    try {
        return bindingsRaw ? JSON.parse(bindingsRaw) : {};
    } catch (e) {
        console.error("Error parsing device bindings:", e);
        return {};
    }
};

// Helper function to save device bindings map
const saveDeviceBindings = (bindings: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_DEVICE_BINDING_KEY, JSON.stringify(bindings));
    } catch (e) {
        console.error("Error saving device bindings:", e);
    }
};

const StudentLoginPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log('Login attempt:', data);
    // Simulate login logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful login for demo - replace with actual auth
    const isSuccessful = data.email.endsWith('@university.edu'); // Simple success for any university email

    if (isSuccessful) {
        // --- Device Binding Check ---
        const deviceBindingEnabled = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY) === 'true'; // Check if feature is enabled
        let deviceCheckPassed = true; // Assume pass if feature disabled

        if (deviceBindingEnabled) {
            const currentDeviceId = getOrGenerateDeviceId();
            const deviceBindings = getDeviceBindings();
            const registeredDeviceId = deviceBindings[data.email];

            console.log(`Device Binding Check: Enabled=${deviceBindingEnabled}, CurrentDevice=${currentDeviceId}, User=${data.email}, RegisteredDevice=${registeredDeviceId}`);

            if (registeredDeviceId) {
                // User has a registered device, check if it matches
                if (registeredDeviceId !== currentDeviceId) {
                    deviceCheckPassed = false;
                    toast({
                        title: "Login Failed",
                        description: "Login attempt from an unregistered device. Please use your registered device or contact support.",
                        variant: "destructive",
                    });
                }
            } else {
                // First login for this user on any device since binding was enabled
                // Register this device
                deviceBindings[data.email] = currentDeviceId;
                saveDeviceBindings(deviceBindings);
                console.log(`Device Binding: Registered device ${currentDeviceId} for user ${data.email}`);
                toast({
                    title: "Device Registered",
                    description: "This device has been registered for your account.",
                });
            }
        }
        // --- End Device Binding Check ---

        if (!deviceCheckPassed) {
             // Stop login if device check failed
             form.resetField("password"); // Clear password field
             return;
        }


       // Proceed with successful login actions
       const name = data.email.split('@')[0] || 'Student';
       const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

       if (typeof window !== 'undefined') {
         localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, capitalizedName);
       }

       toast({
         title: "Login Successful",
         description: `Welcome back, ${capitalizedName}!`,
       });
      router.push('/student/dashboard');
    } else {
       toast({
         title: "Login Failed",
         description: "Invalid email or password.",
         variant: "destructive",
       });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6 text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-primary">Welcome to AcademiGo</h1>
          <p className="text-sm text-muted-foreground">Log in to access your student dashboard.</p>
        </div>
        <div className="p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your college email (e.g., yourname@university.edu)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <Link href="/student/signup" className="text-sm text-accent hover:underline">
              Don’t have an account? Sign Up
            </Link>
             <div className="mt-4 text-sm">
              <Link href="/driver/login" className="text-accent hover:underline block mb-2">
                Driver Login
              </Link>
              <Link href="/admin/login" className="text-accent hover:underline block">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
