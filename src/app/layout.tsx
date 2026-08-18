import type { Metadata } from 'next';
import './globals.css';
import CsrfProvider from '@/components/CsrfProvider';

export const metadata: Metadata = {
  title: 'WhoIsDésir® Media — Creative Business Operations Platform',
  description: 'Creative Business Operations Platform for WhoIsDésir® Media Agency',
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
