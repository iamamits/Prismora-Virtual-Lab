import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@prismora/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://prismoravirtuallab.vercel.app'),
  title: {
    default: 'Prismora — Advanced 3D Scientific Simulation & Virtual Laboratory',
    template: '%s | Prismora Virtual Lab',
  },
  description:
    'Free, open-source 3D interactive scientific simulation platform for Physics, Chemistry, Biology, ECE Circuits, Computer Architecture, and Automata. Aligned with NCERT Class 11 & 12, NEET, JEE, and AICTE curricula.',
  keywords: [
    'Prismora',
    'scientific simulations',
    'virtual laboratory',
    'PhET alternative',
    'TinkerCAD circuits',
    'virtual arduino uno',
    'human reproduction 3D',
    'NCERT science experiments',
    'Class 11 physics simulation',
    'Class 12 physics simulation',
    'CBSE chemistry lab',
    'NEET biology simulator',
    'circuit construction kit',
    'rutherford scattering',
    'photoelectric effect',
    'acid base titration',
    'inside the cpu',
    'cybershield automata',
  ],
  authors: [{ name: 'Amit Singh & The Prismora Team', url: 'https://github.com/iamamits/Prismora-Virtual-Lab' }],
  creator: 'Prismora Open Science Foundation',
  publisher: 'Prismora Virtual Laboratory',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'xP4hnImFe2i5vK-69GpwdqH0yezOAYRKFG_sZWs9EW0',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://prismoravirtuallab.vercel.app',
    title: 'Prismora — Advanced 3D Scientific Simulation & Virtual Laboratory',
    description:
      'Explore, experiment, and understand science through authentic 3D interactive simulations for Physics, Chemistry, Biology, and ECE Engineering.',
    siteName: 'Prismora Virtual Lab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prismora — Advanced 3D Scientific Simulation & Virtual Laboratory',
    description:
      'Free, open-source 3D interactive scientific simulation platform for Physics, Chemistry, Biology, and ECE Circuits.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/prismora-icon.svg',
  },
};

// JSON-LD structured data for Google Rich Results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://prismoravirtuallab.vercel.app/#organization',
      name: 'Prismora Virtual Laboratory',
      url: 'https://prismoravirtuallab.vercel.app',
      description: 'Open-access interactive scientific simulation and virtual engineering laboratory.',
      sameAs: ['https://github.com/iamamits/Prismora-Virtual-Lab'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://prismoravirtuallab.vercel.app/#website',
      url: 'https://prismoravirtuallab.vercel.app',
      name: 'Prismora',
      publisher: { '@id': 'https://prismoravirtuallab.vercel.app/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://prismoravirtuallab.vercel.app/explore?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Prismora Virtual Lab Suite',
      operatingSystem: 'All Web Browsers',
      applicationCategory: 'EducationalApplication',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'INR',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1480',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        {/* Explicit Google Search Console verification meta tag */}
        <meta name="google-site-verification" content="xP4hnImFe2i5vK-69GpwdqH0yezOAYRKFG_sZWs9EW0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#F8FAFC] text-[#172033]">
        <ThemeProvider defaultTheme="light">
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
