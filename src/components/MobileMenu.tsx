"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleBookConsultationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    setTimeout(() => {
      if (pathname === "/") {
        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
          contactForm.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push("/#contact-form");
      }
    }, 200);
  };

  return (
    <motion.div
      initial={{ y: "-110%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "-110%", opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="absolute top-full left-0 w-full p-4 md:hidden"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-black rounded-lg transform translate-x-1 translate-y-1"></div>
        <div className="relative bg-tst-purple border-2 border-black rounded-lg p-8">
          <ul className="flex flex-col items-center gap-6 text-2xl font-bold">
            {/* Reverted to the two original links */}
            <li>
              <Link href="/resources" onClick={onClose} className="hover:underline">
                Download Free Therapy Guides
              </Link>
            </li>
            <li>
              <a href="#contact-form" onClick={handleBookConsultationClick} className="hover:underline">
                Book a Free Consultation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
