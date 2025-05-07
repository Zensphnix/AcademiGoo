// Using route groups approach (Recommended):
// 1. Move the login page to `src/app/(auth)/admin/login/page.tsx`
// 2. This layout file (`src/app/admin/layout.tsx`) will automatically apply to all routes under `/admin` EXCEPT those in the `(auth)` group.

import type { ReactNode } from 'react';
import AdminLayoutComponent from '@/components/common/layout/admin-layout'; // Renamed to avoid conflict

export default function AdminLayout({ children }: { children: ReactNode }) {
  // This layout now correctly applies only to authenticated admin pages
  // if the login page is in a separate route group like `(auth)`.
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}

// If NOT using route groups (less ideal), the previous client-side check or a server-side check based on pathname would be needed here, but route groups are preferred.
