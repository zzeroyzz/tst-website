import React from "react";
import Image from "next/image";
import Section from "@/components/Section";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Highlight from "@/components/Highlight";
import ResourceCard from "@/components/ResourceCard";
import { resourceCards } from "@/data/resourceData";
import WallOfLove from "@/components/WallOfLove";

const ResourcesPage = () => {
  return (
    <>
    <Section>
      {/* Main container to stack the two parts vertically */}
      <div className="flex flex-col items-center gap-16">
        {/* Part 1: The two-column grid for the main content */}
        <div className="grid md:grid-cols-2 gap-16 items-center w-full">
          {/* Left Column: Image */}
          <div className="hidden md:flex justify-center">
            <Image
              src="/assets/hero-image.png"
              alt="Newsletter illustration"
              width={500}
              height={500}
            />
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              Free Guides & Reflections
            </h1>
            <p className="text-lg">
              Join our free, weekly(ish) newsletter where we share actionable
              tips, practical life advice, and high-quality insights to help you
              on your healing journey, sent directly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 mt-4">
              <Input
                type="email"
                placeholder="Your email"
                name="email"
                required
                wrapperClassName="flex-grow"
              />
              <Button type="submit" className="bg-tst-purple">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-gray-600 mt-2">
              By submitting this form, you&apos;ll be signed up to my free
              newsletter. You can opt-out at any time. For more information,
              see our{" "}
              <a href="/privacy-policy" className="underline">
                privacy policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Part 2: The full-width social proof text below the grid */}
        <p className="text-5xl lg:text-6xl font-bold text-center w-full">
          Join over <Highlight color="#FFD666"> 10,000 </Highlight> friendly readers
        </p>
      </div>
    </Section>
      <WallOfLove />
     <Section className="mt-16 bg-tst-green border-t-2 border-black">
        <div className="mb-12 ">
          <h2 className="text-4xl font-extrabold">Featured guides</h2>
          <p className="text-lg mt-2">
            Access our previous editions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resourceCards.map((card) => (
            <ResourceCard key={card.title} card={card} />
          ))}
        </div>
      </Section>
      </>
  );
};

export default ResourcesPage;
