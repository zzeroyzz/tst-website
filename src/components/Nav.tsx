"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/Button";
import MobileMenu from "@/components/MobileMenu";
import HoverLink from './HoverLink';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

const MenuToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="relative z-50">
      <AnimatePresence initial={false} mode="wait">
        <motion.button
          key={isOpen ? "close" : "open"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="relative w-12 h-12"
        >
          {isOpen ? (
            <>
              <div className="absolute inset-0 bg-black rounded-lg transform translate-x-1 translate-y-1"></div>
              <div className="relative w-full h-full bg-tst-purple border-2 border-black rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-1 bg-black rounded-full"></div>
              <div className="w-8 h-1 bg-black rounded-full"></div>
            </div>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

const Nav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGetStartedClick = () => {
    if (pathname === "/") {
      const contactForm = document.getElementById("contact-form");
      if (contactForm) {
        contactForm.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#contact-form");
    }
  };

  const isDashboardPage = pathname.startsWith('/dashboard');

  return (
    <nav className="relative w-full max-w-7xl mx-auto min-h-110 p-1">
      <div className="flex items-center justify-between p-4">
        <div className="flex-shrink-0">
          <Link href="/" className="font-extrabold text-3xl">
            <Image
              src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg"
              alt="TST logo"
              width={100}
              height={10}
              className="mx-auto"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex items-center space-x-8 font-bold">
            {!isDashboardPage && (
              <li>
                <HoverLink href="/resources">
                  Download Free Therapy Guides
                </HoverLink>
              </li>
            )}
            {user && (
              <li>
                <HoverLink href="/dashboard">
                  Dashboard
                </HoverLink>
              </li>
            )}
          </ul>
          {!isDashboardPage && (
            <div>
              <Button onClick={handleGetStartedClick} className="bg-tst-purple">
                Get Started
              </Button>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <MenuToggle
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </nav>
  );
};

export default Nav;
