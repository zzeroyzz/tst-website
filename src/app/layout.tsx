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
  description: 'A therapy space for the deep feelers, drained hearts, and healing seekers. Neuro-affirming and trauma-informed online therapy for adults in Georgia.'
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
