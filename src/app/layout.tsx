import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav/Nav";
import Footer from "@/components/Footer/Footer";
import { Analytics } from "@vercel/analytics/next"
import CookieConsent from "@/components/CookieConsent/CookieConsent";
import Script from 'next/script';
import ConditionalLayout from '@/components/ConditionalLayout/ConditionalLayout';
import ToasterClient from "@/components/clients/ToasterClient/ToasterClient";
import { SpeedInsights } from "@vercel/speed-insights/next"

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Toasted Sesame Therapy | Compassionate, Personalized Therapy in Georgia",
  description: 'A therapy space for the deep feelers, drained hearts, and healing seekers. Neuro-affirming and trauma-informed online therapy for adults in Georgia.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};
export const viewport: Viewport = {
  themeColor: '#F9F5F2',
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
  <meta name="msapplication-TileColor" content="#F9F5F2" />

  {/* connection hints first */}
  <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />
  <link rel="dns-prefetch" href="https://www.clarity.ms" />

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
        <ToasterClient />

        <ConditionalLayout>
          <Nav />
          <main>{children}
            <Analytics />
            <SpeedInsights/>
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
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
        <Script id="microsoft-clarity-init" strategy="afterInteractive">
  {`
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
  `}
</Script>
)}
      </body>
    </html>
  );
}
