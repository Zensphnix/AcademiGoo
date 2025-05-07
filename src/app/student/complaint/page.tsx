"use client";

import type { FC } from 'react';
import ComplaintForm from '@/components/student/complaint-form';

const ComplaintPage: FC = () => {
  return (
    // Container removed, component handles its own layout
    <div className="flex justify-center py-6"> {/* Keep flex justify-center */}
        <ComplaintForm />
    </div>
  );
};

export default ComplaintPage;
