import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@prismora/ui';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Prismora — Explore. Experiment. Understand.',
  description: 'An open-source scientific simulation and experimentation platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#f8fafc] text-[#0f172a] dark:bg-[#090d16] dark:text-[#f8fafc] transition-colors">
        <ThemeProvider defaultTheme="dark">
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
