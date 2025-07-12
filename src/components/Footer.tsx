import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className="bg-tst-purple border-t-2 border-black p-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div>
          <h2 className={styles.logo}>TST</h2>
        </div>

        {/* Links and Copyright */}
        <div className="text-right font-bold">
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/policy" className="hover:underline">
                Policies
              </Link>
            </li>
            <li>
              <Link href="/client-portal" className="hover:underline">
                Client Portal
              </Link>
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
