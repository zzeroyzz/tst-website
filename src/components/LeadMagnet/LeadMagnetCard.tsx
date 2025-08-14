import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

// Assuming these are your style classes - you'll need to import your actual styles
const styles = {
  wrapper: "block cursor-pointer transition-transform hover:scale-105",
  shadow: "absolute inset-0 bg-black rounded-lg transform translate-x-1 translate-y-1 -z-10",
  card: "relative bg-white border-2 border-black rounded-lg p-6 min-h-[300px] flex flex-col"
};

interface LeadMagnetProps {
  guide: {
    id: string;
    iconUrl: string;
    alt: string;
    bgColor: string;
    tags: string[];
  };
}

const LeadMagnetCard: React.FC<LeadMagnetProps> = ({ guide }) => (
  <Link href="/guides" className={styles.wrapper}>
    <div className={styles.shadow}></div>
    <div className={clsx(styles.card, guide.bgColor)} id={guide.id}>
      <div className="mb-4 flex justify-center flex-shrink-0">
        <Image src={guide.iconUrl} alt={guide.alt} width={100} height={100} />
      </div>

      <div className="mb-4 flex-grow">
        <div className="mb-4">
          <p className="text-lg font-bold mb-1 text-center">Nervous to go to the doctor?</p>
          <p className="text-lg font-bold mb-1 text-center">Don't feel heard?</p>
          <p className="text-lg font-bold mb-3 text-center">Worried you'll forget something important?</p>
        </div>

        <p className="text-md font-medium mb-3 text-center">This free guide helps you:</p>

        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-md mr-2">•</span>
            <span className="text-md">Walk in calm</span>
          </li>
          <li className="flex items-start">
            <span className="text-md mr-2">•</span>
            <span className="text-md">Speak up with confidence</span>
          </li>
          <li className="flex items-start">
            <span className="text-md mr-2">•</span>
            <span className="text-md">Remember everything you need to say</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-between items-end flex-shrink-0">
        <div className="flex-1">
          <h4 className="font-bold mb-2 text-left text-sm">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <div
                key={tag}
                className="bg-tst-cream text-sm font-medium px-3 py-1 rounded-full border-2 border-black"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 5L19 12L12 19"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

export default LeadMagnetCard;
