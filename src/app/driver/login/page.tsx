
"use client";

import React from 'react';
import type { FC } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const phoneRegex = new RegExp(
  /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
);

const loginSchema = z.object({
  mobileNumber: z.string().regex(phoneRegex, 'Please enter a valid mobile number.'),
});

const otpSchema = z.object({
    otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});


type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

// Device Binding Constants & Helpers (Shared or duplicated from student login)
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


const DriverLoginPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(''); // Store the number being verified
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileNumber: '',
    },
  });

   const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleSendOtp = async (data: LoginFormValues) => {
    setIsSendingOtp(true);
    console.log('Sending OTP to:', data.mobileNumber);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingOtp(false);

    setMobileNumber(data.mobileNumber); // Store the number for verification step
    setIsOtpModalOpen(true);
     toast({
      title: "OTP Sent",
      description: `An OTP has been sent to ${data.mobileNumber}.`,
    });
     otpForm.reset();
  };

  const handleVerifyOtp = async (data: OtpFormValues) => {
     setIsSubmittingOtp(true);
    console.log('Verifying OTP:', data.otp, 'for number:', mobileNumber);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful OTP verification
    const isOtpValid = data.otp === '123456'; // Replace with actual verification logic

    if (isOtpValid) {
        // --- Device Binding Check ---
        const deviceBindingEnabled = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY) === 'true';
        let deviceCheckPassed = true;

        if (deviceBindingEnabled) {
            const currentDeviceId = getOrGenerateDeviceId();
            const deviceBindings = getDeviceBindings();
            const registeredDeviceId = deviceBindings[mobileNumber]; // Use mobile number as key

            console.log(`Device Binding Check (Driver): Enabled=${deviceBindingEnabled}, CurrentDevice=${currentDeviceId}, User=${mobileNumber}, RegisteredDevice=${registeredDeviceId}`);

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
                // First login for this driver on any device since binding was enabled
                deviceBindings[mobileNumber] = currentDeviceId;
                saveDeviceBindings(deviceBindings);
                console.log(`Device Binding: Registered device ${currentDeviceId} for driver ${mobileNumber}`);
                toast({
                    title: "Device Registered",
                    description: "This device has been registered for your driver account.",
                });
            }
        }
        // --- End Device Binding Check ---

        if (!deviceCheckPassed) {
             setIsSubmittingOtp(false);
             otpForm.setError("otp", { type: "manual", message: "Device not registered." });
             return; // Stop login if device check failed
        }

        // Proceed with successful login
        toast({
            title: "Login Successful",
            description: "Welcome, Driver!",
        });
        setIsOtpModalOpen(false);
        router.push('/driver/dashboard');
    } else {
         toast({ title: "Invalid OTP", description: "Please try again.", variant: "destructive" });
         otpForm.setError("otp", { type: "manual", message: "Invalid OTP code." });
         setIsSubmittingOtp(false); // Re-enable button on failure
    }
     // No need to set submitting false on success if modal closes
  };

  // JSX starts here, ensure no syntax errors before this
  return (
   <>
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6 text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-primary">Driver Login</h1>
          <p className="text-sm text-muted-foreground">Enter your registered mobile number to receive an OTP.</p>
        </div>
        <div className="p-6 pt-0">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleSendOtp)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter registered mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSendingOtp}>
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center">
            <Link href="/student/login" className="text-sm text-accent hover:underline">
              Not a Driver? Go to Student Login
            </Link>
          </div>
        </div>
      </div>

        {/* OTP Verification Modal */}
        <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
           <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter OTP</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code sent to {mobileNumber}.
              </DialogDescription>
            </DialogHeader>
             <Form {...otpForm}>
                 <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4 py-4">
                   <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            {...field}
                            className="text-center text-lg tracking-[0.3em]"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <DialogFooter>
                      <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={isSubmittingOtp}
                         >
                         {isSubmittingOtp ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                 </DialogFooter>
                </form>
             </Form>
          </DialogContent>
        </Dialog>
    </div>
    </>
  );
};

export default DriverLoginPage;

