"use client";

import React from 'react';
import { motion } from 'framer-motion';
import ProfileImage from '@/components/ProfileImage';
import { aboutPageContent } from '@/data/aboutData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const AboutPage = () => {
  return (
    <main>
        <div className="grid lg:grid-cols-2">

            {/* Image Column - This is now hidden on mobile and only appears on desktop */}
            <div className="hidden lg:flex items-center justify-center bg-tst-yellow p-8 h-screen sticky top-0">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProfileImage />
                </motion.div>
            </div>

            {/* Text Content Column */}
            <div className="p-8 md:p-16 lg:p-24">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <motion.h1 className="text-5xl font-extrabold mb-8" variants={itemVariants}>
                      {aboutPageContent.title}
                    </motion.h1>

                    {/* Mobile-Only Image - Appears below the title and is hidden on desktop */}
                    <motion.div className="lg:hidden mb-8 flex justify-center" variants={itemVariants}>
                        <ProfileImage />
                    </motion.div>

                    <motion.div className="space-y-4" variants={itemVariants}>
                        {aboutPageContent.paragraphs.map((text, index) => (
                          <p key={index} className="text-lg">
                              {text}
                          </p>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </main>
  );
};

export default AboutPage;
