
"use client";

import type { FC } from 'react';
import ComplaintStatusTable from '@/components/student/complaint-status-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ComplaintStatusPage: FC = () => {
   const router = useRouter();
  return (
     <div className="container mx-auto py-6 space-y-4">
         <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
           <ArrowLeft className="mr-1 h-4 w-4" /> Back
         </Button>
         <ComplaintStatusTable />
     </div>
  );
};

export default ComplaintStatusPage;

