import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect users from the root path to the student login page by default.
  redirect('/student/login');
}
