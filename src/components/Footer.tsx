import React from "react";
import Link from "next/link";
import Image from "next/image";
import HoverLink from './HoverLink';
const Footer = () => {
  return (
    <footer className="bg-tst-purple border-t-2 border-black p-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-extrabold text-3xl">
            <Image
              src="/assets/TST_Logo.svg"
              alt="TST logo"
              width={200}
              height={100}
              className="mx-auto"
            />
          </Link>

        {/* Links and Copyright */}
        <div className="text-right font-bold">
          <ul className="flex flex-col gap-2">
            <li>
              <HoverLink href="/policy">
                Policies
              </HoverLink>
            </li>
            <li>
              <HoverLink href="/client-portal">
                Client Portal
              </HoverLink>
            </li>
          </ul>
          <p className="text-sm mt-4">
            &copy; {new Date().getFullYear()} Toasted Sesame Therapy.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
