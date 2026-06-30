import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'EduCore',
  description: 'EduCore platform scaffold for Unified Edge Solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
