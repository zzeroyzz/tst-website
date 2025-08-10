import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav/Nav";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next"
import CookieConsent from "@/components/CookieConsent/CookieConsent";
import Script from 'next/script';
import ConditionalLayout from '@/components/ConditionalLayout/ConditionalLayout';

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Toasted Sesame Therapy | Compassionate, Personalized Therapy',
  description: 'A therapy space for the deep feelers, drained hearts, and healing seekers. Neuro-affirming and trauma-informed online therapy for adults in Georgia.',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' }
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Define your schema objects here
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Toasted Sesame Therapy",
    "url": "https://toastedsesametherapy.com", // Remember to replace this with your actual domain
  };

  const medicalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": "https://toastedsesametherapy.com/#medicalbusiness", // Remember to replace this
    "name": "Toasted Sesame Therapy",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Atlanta",
      "addressRegion": "GA",
      "addressCountry": "US"
    },
    "url": "https://toastedsesametherapy.com", // Remember to replace this
    "logo": "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg"
  };

  return (
    <html lang="en">
      <head>
         <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }}
        />

        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id=GTM-N6VXX6CK'+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-N6VXX6CK');
            `,
          }}
        />
      </head>
      <body
        className={`${workSans.variable} font-sans bg-tst-cream text-black antialiased`}
      >
        <Toaster position="top-center" reverseOrder={false} />

        <ConditionalLayout>
          <Nav />
          <main>{children}
            <Analytics />
          </main>
          <Footer />
        </ConditionalLayout>

        <CookieConsent />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N6VXX6CK"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  );
}
