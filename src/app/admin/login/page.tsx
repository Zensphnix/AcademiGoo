
"use client";

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid admin email address.' }),
  password: z.string().min(1, { message: 'Please enter your password.' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Device Binding Constants & Helpers (Shared or duplicated)
const LOCAL_STORAGE_DEVICE_ID_KEY = 'academiGoDeviceId';
const LOCAL_STORAGE_DEVICE_BINDING_KEY = 'academiGoDeviceBinding';
const LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY = 'deviceBindingEnabled';

const getOrGenerateDeviceId = (): string => {
    if (typeof window === 'undefined') return 'server-device';
    let deviceId = localStorage.getItem(LOCAL_STORAGE_DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem(LOCAL_STORAGE_DEVICE_ID_KEY, deviceId);
        console.log("Generated new device ID:", deviceId);
    }
    return deviceId;
};

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

const saveDeviceBindings = (bindings: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_DEVICE_BINDING_KEY, JSON.stringify(bindings));
    } catch (e) {
        console.error("Error saving device bindings:", e);
    }
};


const AdminLoginPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      otp: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log('Admin Login attempt:', data);
    // Simulate admin login logic with 2FA
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful login for demo - replace with actual auth
    const isSuccessful = data.email.includes('admin@') && data.otp === '123456'; // Example check

    if (isSuccessful) {
        // --- Device Binding Check ---
        const deviceBindingEnabled = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY) === 'true';
        let deviceCheckPassed = true;

        if (deviceBindingEnabled) {
            const currentDeviceId = getOrGenerateDeviceId();
            const deviceBindings = getDeviceBindings();
            const registeredDeviceId = deviceBindings[data.email]; // Use email as key

            console.log(`Device Binding Check (Admin): Enabled=${deviceBindingEnabled}, CurrentDevice=${currentDeviceId}, User=${data.email}, RegisteredDevice=${registeredDeviceId}`);

            if (registeredDeviceId) {
                if (registeredDeviceId !== currentDeviceId) {
                    deviceCheckPassed = false;
                    toast({
                        title: "Login Failed",
                        description: "Login attempt from an unregistered device.",
                        variant: "destructive",
                    });
                }
            } else {
                // First login for this admin on any device since binding was enabled
                deviceBindings[data.email] = currentDeviceId;
                saveDeviceBindings(deviceBindings);
                console.log(`Device Binding: Registered device ${currentDeviceId} for admin ${data.email}`);
                toast({
                    title: "Device Registered",
                    description: "This device has been registered for your admin account.",
                });
            }
        }
        // --- End Device Binding Check ---

        if (!deviceCheckPassed) {
             form.resetField("password");
             form.resetField("otp");
             return; // Stop login if device check failed
        }

        // Proceed with successful login
       toast({
         title: "Admin Login Successful",
         description: "Welcome to the Admin Dashboard!",
       });
      router.push('/admin/dashboard');
    } else {
       toast({
         title: "Admin Login Failed",
         description: "Invalid credentials or OTP.",
         variant: "destructive",
       });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6 text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Access the AcademiGo Admin Dashboard.</p>
        </div>
        <div className="p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@university.edu" {...field} />
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
               <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP (2FA Code)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                         maxLength={6}
                         {...field}
                          className="text-center tracking-[0.2em]"
                      />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center">
            <Link href="/student/login" className="text-sm text-accent hover:underline">
              Not an Admin? Go to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
