import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Blood Sugar Dashboard',
  description: 'Read-only blood sugar and insulin dashboard'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
