import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Kwenda High School', template: '%s | Kwenda High School' },
  description:
    'Kwenda High School — Excellence, Integrity, Legacy. Discover our world-class education, vibrant community, and pathway to the future.',
  keywords: ['Kwenda High School', 'secondary school', 'admissions', 'education', 'Kenya'],
  openGraph: {
    title: 'Kwenda High School',
    description: 'Excellence. Integrity. Legacy.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
