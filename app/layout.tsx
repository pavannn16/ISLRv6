import { inter } from '@/lib/fonts';
import '../styles/globals.css';
import { Metadata } from 'next';
import { Suspense } from 'react';
import MaintenanceCheckWrapper from '@/components/maintenance-check-wrapper';

export const metadata: Metadata = {
  title: 'SignEase',
  description: 'SignEase - Indian Sign Language Recognition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <MaintenanceCheckWrapper>
            {children}
          </MaintenanceCheckWrapper>
        </Suspense>
      </body>
    </html>
  );
}
