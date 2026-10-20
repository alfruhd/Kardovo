import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Sacred Garden — Luxury Digital Wedding Invitation',
  description: 'Config-driven, mobile-first luxury wedding invitation platform.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen selection:bg-brand-primary/20 selection:text-brand-text"
      >
        {children}
      </body>
    </html>
  );
}
