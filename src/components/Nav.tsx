import Link from "next/link";
import React from "react";
import Image from "next/image";
import Button from "@/components/Button";

const Nav: React.FC = () => {
  return (<nav className="w-full max-w-7xl mx-auto min-h-110  p-1">
        <div className="flex items-center justify-between p-4">
          <div className="flex-shrink-0">
            <Link href="/" className="font-extrabold text-3xl">
                    <Image
              src="/assets/v1_tst_logo_small.png"
              alt="TST logo"
              width={100}
              height={10}
              className="mx-auto"
            />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-8 font-bold">
              <li>
                <Link href="/resources">Download Free Therapy Guides</Link>
              </li>
            </ul>

           <div>
                <Button className="bg-tst-purple">Get Started</Button>
              </div>
          </div>

          <div className="md:hidden">
            <button className="px-3 py-2 border-2 border-black rounded-lg font-bold">
              Menu
            </button>
          </div>
        </div>
      </nav>
  );
};

export default Nav;
