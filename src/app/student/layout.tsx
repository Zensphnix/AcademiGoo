// Assumes login/signup are moved to `src/app/(auth)/student/login` and `src/app/(auth)/student/signup`

import type { ReactNode } from 'react';
import StudentLayoutComponent from '@/components/common/layout/student-layout'; // Renamed to avoid conflict

export default function StudentLayout({ children }: { children: ReactNode }) {
  // This layout will apply to all pages under /student/*
  // EXCEPT those in the (auth) group (login, signup)
  return <StudentLayoutComponent>{children}</StudentLayoutComponent>;
}
