import React from "react";
import Link from "next/link";
import Section from "./Section";
import Image from "next/image";
import styles from "./GuideCard.module.css";
import clsx from "clsx";
import { guides } from "@/data/leadData"; // Import data from the new file

const GuideCard = ({ guide }) => (
  <Link href="/resources" className={styles.wrapper}>
    <div className={styles.shadow}></div>
    <div className={clsx(styles.card, guide.bgColor)}>
      <div className="mb-4">
        <Image src={guide.iconUrl} alt={guide.title} width={48} height={48} />
      </div>
      <h3 className="text-2xl font-bold mb-2">{guide.title}</h3>
      <p className="mb-4">{guide.description}</p>
      <div className="flex-grow"></div>
      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-bold mb-2 text-left">Tags</h4>
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
        <div>
          <svg
            width="32"
            height="32"
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
          Browse Our Free Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <GuideCard key={guide.title} guide={guide} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default LeadMagnet;
