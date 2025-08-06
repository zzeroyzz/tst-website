import React from "react";
import Link from "next/link";
import Section from "@/components/Section/Section";
import Image from "next/image";
import styles from "./LeadMagnet.module.css";
import clsx from "clsx";
import { guides } from "@/data/leadData";

interface Guide {
  title: string;
  description: string;
  iconUrl: string;
  tags: string[];
  bgColor: string;
  alt: string;
  id: string;
}

interface LeadMagnetProps {
  guide: Guide;
}

const LeadMagnetCard: React.FC<LeadMagnetProps> = ({ guide }) => (
  <Link href="/guides" className={styles.wrapper}>
    <div className={styles.shadow}></div>
    <div className={clsx(styles.card, guide.bgColor)} id={guide.id}>
      <div className="mb-3 flex justify-center flex-shrink-0">
        <Image src={guide.iconUrl} alt={guide.alt} width={100} height={100} />
      </div>
      <h3 className="text-lg font-bold mb-3 text-center leading-tight flex-shrink-0">{guide.title}</h3>
      <p className="text-center text-md leading-relaxed flex-grow mb-3">{guide.description}</p>
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

const LeadMagnet = () => {
  return (
    <Section>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-5xl font-extrabold mb-12">
          Grab Your Free Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <LeadMagnetCard key={guide.title} guide={guide} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default LeadMagnet;
