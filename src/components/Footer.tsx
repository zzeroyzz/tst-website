import React from "react";
import Link from "next/link";
import Image from "next/image";
import HoverLink from './HoverLink';

const Footer = () => {
  return (
    <footer className="bg-tst-purple border-t-2 border-black">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8">

          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-4">
              <Image
                src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg"
                alt="TST logo"
                width={180}
                height={90}
                className="hover:scale-105 transition-transform duration-200"
              />
            </Link>
            <p className="text-white/80 text-sm text-center md:text-left max-w-xs">
              Supporting your healing journey with compassionate, personalized therapy.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <HoverLink
                  href="/contact"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Get Started
                </HoverLink>
              </li>
              <li>
                <HoverLink
                  href="/about"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  About Kay
                </HoverLink>
              </li>
              <li>
                <HoverLink
                  href="/guides"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Grab Your Free Resources
                </HoverLink>
              </li>

              <li>
                <HoverLink
                  href="//toasty-tidbits-archives"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Newsletter Archive
                </HoverLink>
              </li>
              <li>
                <HoverLink
                  href="/contact"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Contact
                </HoverLink>
              </li>
            </ul>
          </div>

          {/* Legal & Portal */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-bold text-lg mb-4">Legal & Portal</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <HoverLink
                  href="/policy"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Privacy Policy
                </HoverLink>
              </li>
              <li>
                <HoverLink
                  href="/policy"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Practice Policy
                </HoverLink>
              </li>
              <li>
                <HoverLink
                  href="https://toastedsesametherapyllc.clientsecure.me/sign-in"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Client Portal
                </HoverLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Copyright */}
            <p className="text-white/80 text-sm text-center md:text-left font-bold">
              &copy; {new Date().getFullYear()} Toasted Sesame Therapy. All rights reserved.
            </p>
            <p className="text-white/80 text-sm text-center md:text-right">
               This site is not for crisis support. <br/>Crisis resources are available on the <Link href="/policy" className=" underline font-bold">Policy Page</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
