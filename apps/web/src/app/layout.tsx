import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@prismora/ui';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Prismora — Explore. Experiment. Understand.',
  description: 'An open-source scientific simulation and experimentation platform.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/prismora-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#F8FAFC] text-[#172033]">
        <ThemeProvider defaultTheme="light">
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
