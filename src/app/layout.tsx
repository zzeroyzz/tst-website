import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav/Nav";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next"

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
        {/* Add the schema scripts to the head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }}
        />
      </head>
      <body
        className={`${workSans.variable} font-sans bg-tst-cream text-black antialiased`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <Nav />
        <main>{children}
           <Analytics />
        </main>
        <Footer />
      </body>
    </html>
  );
}
