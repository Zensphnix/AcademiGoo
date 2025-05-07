
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw, AlertCircle, CalendarCheck2 } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Schema for the Renewal action (simple trigger)
const renewSchema = z.object({});
type RenewFormValues = z.infer<typeof renewSchema>;

// Mock function to fetch current pass data
const fetchCurrentPassInfo = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const expiry = new Date();
    // Set expiry to be within 10 days for testing the reminder
    expiry.setDate(expiry.getDate() + 8);
    return {
        passId: 'PASS12345',
        studentName: typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Shashi Sharma' : 'Shashi Sharma',
        currentRoute: 'Route 5 – North Campus Line',
        validTill: expiry.toISOString(),
        renewalFee: 500, // Example fee
    };
};


const RenewPassPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isRenewing, setIsRenewing] = useState(false);
  const [passInfo, setPassInfo] = useState<{ passId: string; studentName: string; currentRoute: string; validTill: string; renewalFee: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);

  const renewForm = useForm<RenewFormValues>({
    resolver: zodResolver(renewSchema),
  });

  useEffect(() => {
    setIsLoading(true);
    fetchCurrentPassInfo()
      .then(data => {
        setPassInfo(data);
        const expiryDate = parseISO(data.validTill);
        const daysLeft = differenceInDays(expiryDate, new Date());
        setDaysUntilExpiry(daysLeft);
      })
      .catch(err => {
        console.error("Failed to load pass info:", err);
        toast({ title: "Error", description: "Could not load current pass details.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  }, [toast]);


  const handleRenewSubmit = async (data: RenewFormValues) => {
    if (!passInfo) return;

    setIsRenewing(true);
    const fee = passInfo.renewalFee;
    console.log(`Processing RENEWAL request for pass ${passInfo.passId}. Fee: ₹${fee}`);
    // TODO: Implement actual renewal API call (including payment if applicable)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRenewing(false);

    toast({
      title: `Pass Renewal Successful`,
      description: `Your payment of ₹${fee} was successful. Your pass validity has been extended.`, // Add payment confirmation
    });

    // Update local state to reflect the new expiry date (assuming 1 year extension)
    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    setPassInfo(prev => prev ? { ...prev, validTill: newExpiry.toISOString() } : null);
    setDaysUntilExpiry(differenceInDays(newExpiry, new Date()));

    // Consider redirecting to the main bus pass view page after renewal
    // router.push('/student/bus-pass');
  };

  const formattedExpiryDate = passInfo ? format(parseISO(passInfo.validTill), 'MMMM dd, yyyy') : 'Loading...';

  return (
    <div className="container mx-auto py-6 flex justify-center">
      <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-lg">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl text-primary font-semibold">Manage Your Bus Pass</h2>
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        {/* Current Pass Info */}
        <div className="p-6 border-b space-y-3">
            <h3 className="text-lg font-medium text-foreground mb-2">Current Pass Details</h3>
            {isLoading ? (
                 <>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-1/4" /> {/* Fee */}
                 </>
            ) : passInfo ? (
                 <>
                    <p className="text-sm"><span className="font-semibold text-muted-foreground">Pass ID:</span> {passInfo.passId}</p>
                    <p className="text-sm"><span className="font-semibold text-muted-foreground">Holder:</span> {passInfo.studentName}</p>
                    <p className="text-sm"><span className="font-semibold text-muted-foreground">Route:</span> {passInfo.currentRoute}</p>
                    <p className="text-sm"><span className="font-semibold text-muted-foreground">Valid Until:</span> <span className="font-semibold text-foreground">{formattedExpiryDate}</span></p>
                    <p className="text-sm"><span className="font-semibold text-muted-foreground">Renewal Fee:</span> ₹{passInfo.renewalFee}</p>

                    {/* Expiry Reminder Alert */}
                    {daysUntilExpiry !== null && daysUntilExpiry <= 10 && (
                        <Alert variant={daysUntilExpiry < 0 ? "destructive" : "default"} className="mt-4 bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800">
                             <AlertCircle className={`h-4 w-4 ${daysUntilExpiry < 0 ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'}`} />
                             <AlertTitle className={daysUntilExpiry < 0 ? 'text-destructive' : 'text-yellow-800 dark:text-yellow-300'}>
                                 {daysUntilExpiry < 0 ? "Pass Expired!" : "Expiry Reminder"}
                             </AlertTitle>
                            <AlertDescription className={daysUntilExpiry < 0 ? 'text-destructive/90' : 'text-yellow-700 dark:text-yellow-400'}>
                                Your bus pass {daysUntilExpiry < 0 ? `expired ${Math.abs(daysUntilExpiry)} day(s) ago` : `expires in ${daysUntilExpiry} day(s)`}. Renew now to avoid service interruption.
                            </AlertDescription>
                        </Alert>
                    )}
                 </>
            ) : (
                 <p className="text-destructive">Could not load pass information.</p>
            )}
        </div>

        {/* Action Buttons Section */}
        <div className="p-6 space-y-6">
            {/* Renewal Action */}
            <Form {...renewForm}>
              <form onSubmit={renewForm.handleSubmit(handleRenewSubmit)}>
                 <h3 className="text-md font-medium mb-2">Renew Pass</h3>
                 <FormDescription className="mb-4">
                    Click the button below to initiate the renewal process for your current bus pass.
                 </FormDescription>
                 <Button
                    type="submit"
                    disabled={isRenewing || isLoading || !passInfo || (daysUntilExpiry !== null && daysUntilExpiry < -30)} // Disable if expired too long ago
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                 >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isRenewing ? 'Processing Renewal...' : `Renew Pass (₹${passInfo?.renewalFee ?? '...'})`}
                 </Button>
                  {/* Add message if renewal is not possible */}
                  {daysUntilExpiry !== null && daysUntilExpiry < -30 && (
                     <p className="text-xs text-destructive text-center mt-2">Pass expired too long ago. Please apply for a new pass or contact the office.</p>
                 )}
              </form>
            </Form>

             {/* Divider Removed as Reissue button is removed */}
             {/* <hr className="my-6" /> */}

            {/* Reissue Action Removed */}
            {/*
            <div>
                <h3 className="text-md font-medium mb-2">Reissue Pass</h3>
                 <p className="text-sm text-muted-foreground mb-4">
                    If your pass is lost, damaged, or stolen, you can request a reissue here. A fee of ₹{passInfo?.reissueFee ?? '...'} may apply.
                 </p>
                 <Button
                     type="button"
                     variant="outline"
                     onClick={() => setIsReissueModalOpen(true)}
                     disabled={isLoading || !passInfo || isReissuing || (passInfo && passInfo.reissuesThisSemester >= passInfo.reissueLimit)}
                     className="w-full"
                 >
                    <Siren className="mr-2 h-4 w-4" />
                    Request Reissue
                 </Button>
                  {passInfo && passInfo.reissuesThisSemester >= passInfo.reissueLimit && (
                     <p className="text-xs text-destructive text-center mt-2">Reissue limit reached for this semester.</p>
                  )}
             </div>
            */}
        </div>


         {/* Reissue Pass Modal Removed */}
         {/*
        <AlertDialog open={isReissueModalOpen} onOpenChange={setIsReissueModalOpen}>
            <AlertDialogContent>
                 ... (Reissue modal content remains the same) ...
            </AlertDialogContent>
        </AlertDialog>
        */}

      </div>
    </div>
  );
};

export default RenewPassPage;
