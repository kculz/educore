import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EduCore SaaS — Multi-Tenant School Portal",
    template: "%s | EduCore SaaS Portal",
  },
  description: "Enterprise School Administration & Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#040810] text-slate-100">
        {children}
      </body>
    </html>
  );
}
