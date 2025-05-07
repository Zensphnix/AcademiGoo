
import type { FC } from 'react';
import UserManagementTable from '@/components/admin/user-management-table';

const AdminUsersPage: FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">User Management</h2>
      <UserManagementTable />
    </div>
  );
};

export default AdminUsersPage;
