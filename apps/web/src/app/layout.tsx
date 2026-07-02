import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EduCore',
    template: '%s | EduCore',
  },
  description:
    'EduCore is a SaaS platform for schools and other tenants, with branded admission sites, protected staff portals, and API-first products.',
  applicationName: 'EduCore',
  authors: [{ name: 'EduCore' }],
  keywords: [
    'EduCore',
    'education platform',
    'education SaaS',
    'admissions software',
    'tenant domains',
    'multi-tenant software',
    'student intake',
    'API-first',
  ],
  openGraph: {
    type: 'website',
    siteName: 'EduCore',
    title: 'EduCore',
    description:
      'EduCore is a SaaS platform for schools and other tenants, with branded admission sites, protected staff portals, and API-first products.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduCore',
    description:
      'EduCore is a SaaS platform for schools and other tenants, with branded admission sites, protected staff portals, and API-first products.',
  },
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
