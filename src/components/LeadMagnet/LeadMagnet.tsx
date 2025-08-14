import React from "react";
import Link from "next/link";
import Section from "@/components/Section/Section";
import Image from "next/image";
import styles from "./LeadMagnet.module.css";
import clsx from "clsx";
import { guides } from "@/data/leadData";

interface Guide {
  questions: string[];
  subtitle: string;
  benefits: string[];
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
      <div className="mb-4 flex justify-center flex-shrink-0">
        <Image src={guide.iconUrl} alt={guide.alt} width={100} height={100} />
      </div>

      <div className="mb-4 flex-grow">
        <div className="mb-4">
          {guide.questions.map((question, index) => (
            <p key={index} className="text-lg font-bold mb-1 text-center">{question}</p>
          ))}
        </div>

        <p className="text-md font-medium mb-3 text-center">{guide.subtitle}</p>

        <ul className="space-y-2">
          {guide.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="text-md mr-2">•</span>
              <span className="text-md">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between items-end flex-shrink-0">
        <div className="flex-1">
          <h4 className="font-bold mb-2 text-left text-sm">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <div
                key={tag}
                className="bg-tst-cream text-sm font-medium px-3 py-1 rounded-full border-2 border-black shadow-brutalist"
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
            <LeadMagnetCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default LeadMagnet;
