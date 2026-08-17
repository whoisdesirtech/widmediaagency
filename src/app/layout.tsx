import type { Metadata } from 'next';
import './globals.css';
import CsrfProvider from '@/components/CsrfProvider';

export const metadata: Metadata = {
  title: 'WhoIsDésir® Media — Freelancer Talent Agreement System',
  description: 'Modular Freelancer Talent Agreement System for WhoIsDésir® Media Agency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CsrfProvider />
        {children}
      </body>
    </html>
  );
}
