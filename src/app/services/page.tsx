"use client";

import React from "react";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import Button from "@/components/Button";
import FAQ from "@/components/FAQ";
import ServiceOfferingCard from "@/components/ServiceOfferingCard";
import FallingPills from "@/components/FallingPills";
import AnimatedImage from "@/components/AnimatedImage";
import { usePathname, useRouter } from "next/navigation";
import {
    individualTherapyData,
    ourApproachData
} from "@/data/servicesPageData";

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};


const ServicesPage = () => {
  const pathname = usePathname();
  const router = useRouter();
 const handleClick = () => {
    if (pathname === "/") {
      const contactForm = document.getElementById("contact-form");
      if (contactForm) {
        contactForm.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#contact-form");
    }
  };
  return (
    <main>
      {/* 1. Hero Section (Reverted to single-column layout) */}
      <Section>
        <motion.div
            className="flex flex-col items-center gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {/* Top part of the hero */}
          <motion.div
            className="text-center max-w-4xl mx-auto flex flex-col gap-6 items-center"
            variants={itemVariants}
           >
            <h1 className="text-5xl lg:text-6xl font-extrabold">
              Therapy That Fits You, As You Are.
            </h1>
            <p className="text-lg">
              Explore our therapeutic approach and find the support that meets
              your unique needs.
            </p>
            <Button
              onClick={handleClick}
              className="bg-tst-yellow"
            >
              Book a Free Consultation
            </Button>
          </motion.div>

          <motion.div
            className="w-full max-w-5xl mx-auto mt-16"
            variants={itemVariants}
          >
            <FallingPills/>
          </motion.div>
        </motion.div>
      </Section>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Section>
           <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold">
              Individual Therapy
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
             <ServiceOfferingCard
               service={individualTherapyData}
             />
          </div>
        </Section>
      </motion.div>

      {/* 3. Our Approach Section */}
       <Section
         className="bg-tst-purple border-t-2 border-black"
       >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl font-extrabold">
            A Closer Look at Our Approach
          </h2>
        </motion.div>
        <motion.div
            className="max-w-5xl mx-auto flex flex-col gap-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
          {ourApproachData.map((item, index) => (
            <motion.div
              key={item.title}
              className="grid md:grid-cols-2 gap-12 items-center"
              variants={itemVariants}
            >
              <div className={`w-full ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                 <AnimatedImage
                   animationData={item.animationData}
                 />
              </div>
              <div className={`flex flex-col gap-4 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <h3 className="text-3xl font-bold">
                  {item.title}
                </h3>
                <p>
                  {item.description}
                </p>
                <div className="mt-2">
                    <h4 className="font-bold mb-2">
                      What this means for you:
                    </h4>
                    <ul className="list-disc list-inside flex flex-col gap-1">
                        {item.benefits.map((benefit) => (
                          <li key={benefit}>
                            {benefit}
                          </li>
                        ))}
                    </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>


      {/* 4. FAQ Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div id="faq-section" className="border-t-2 border-black">
          <Section className="bg-tst-teal">
            <FAQ/>
          </Section>
        </div>
      </motion.div>
    </main>
  );
};

export default ServicesPage;
