import type { FC } from 'react';
import ComplaintResolutionTable from '@/components/admin/complaint-resolution-table';

const ComplaintResolutionPage: FC = () => {
  return (
    // Container and padding removed, handled by the table component now
    <ComplaintResolutionTable />
  );
};

export default ComplaintResolutionPage;
