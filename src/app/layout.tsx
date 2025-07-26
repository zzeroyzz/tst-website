import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

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
  return (
    <html lang="en">
      <body
        className={`${workSans.variable} font-sans bg-tst-cream text-black antialiased`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
