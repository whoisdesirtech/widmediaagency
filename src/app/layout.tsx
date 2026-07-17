import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhoIsDésir® Media — Freelancer Talent Agreement System',
  description: 'Modular Freelancer Talent Agreement System for WhoIsDésir® Media Agency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
