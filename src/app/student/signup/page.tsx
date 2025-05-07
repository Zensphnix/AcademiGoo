
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Card imports
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid college email address.' }).regex(/^[a-zA-Z0-9._%+-]+@university\.edu$/, { message: "Email must end with @university.edu" }),
  role: z.enum(['Student', 'Teacher'], { required_error: 'Please select your role.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const LOCAL_STORAGE_USERNAME_KEY = 'userName'; // Define key for consistency

const SignupPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: undefined,
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    console.log('Signup attempt:', data);
    // Simulate signup logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store the full name in localStorage upon successful signup
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, data.fullName);
    }

    toast({
      title: "Account Registered Successfully!",
      description: "Please log in with your new account.",
    });
    router.push('/student/login'); // Redirect to login page after successful signup
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      {/* Replaced Card with div and applied styling */}
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg">
        {/* Equivalent to CardHeader */}
        <div className="p-6 text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-primary">Create your AcademiGo Account</h1>
          <p className="text-sm text-muted-foreground">Join the community to manage your campus travel.</p>
        </div>
        {/* Equivalent to CardContent */}
        <div className="p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Email</FormLabel>
                    <FormControl>
                       {/* Placeholder text matches wireframe */}
                      <Input placeholder="yourname@university.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                 {/* Button text matches wireframe */}
                {form.formState.isSubmitting ? 'Registering...' : 'Register Account'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
             {/* Link text matches wireframe */}
            <Link href="/student/login" className="text-sm text-accent hover:underline">
              Already have an account? Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
