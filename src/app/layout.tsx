import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast"; // Import Toaster

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TST - Toasted Sesame Therapy",
  description: "A new therapy practice.",
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
