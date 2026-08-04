import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Blood Sugar Dashboard',
  description: 'Blood sugar dashboard with doctor review and patient entry tools'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
