'use client';

import React from 'react';
import { MapPinCheckInside, Video, Brain, Heart, Rainbow } from 'lucide-react';
import IconCircle from '@/components/IconCircle/IconCircle';
import { motion, Variants, useInView } from 'framer-motion';


interface BookingPageHeaderProps {
  variant: 'nd' | 'affirming' | 'trauma';
}

const TRUST_INDICATORS = [
  { text: 'Licensed in Georgia', icon: MapPinCheckInside },
  { text: 'Secure Telehealth', icon: Video },
  { text: 'Affirming Care', icon: Heart }
] as const;

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const getVariantContent = (variant: BookingPageHeaderProps['variant']) => {
  switch (variant) {
    case 'nd':
      return {
        headline: 'Therapy that fits your brain',
        icon: <Brain className="w-6 h-6" />,
        color: 'bg-purple-100 border-black text-purple-800',
        tagText: 'Neurodivergent-Friendly',
      };
    case 'affirming':
      return {
        headline: 'All of you is welcome here',
        icon: <Rainbow className="w-6 h-6" />,
        color: 'bg-pink-100  border-black  text-pink-800',
        tagText: 'LGBTQIA-Affirming',
      };
    case 'trauma':
      return {
        headline: (
  <>
    When life feels heavy,<br/>
    here’s a calm place to land
  </>
),
        icon: <Heart className="w-6 h-6" />,
        color: 'bg-blue-100  border-black  text-blue-800',
        tagText: 'Trauma-Informed',
      };
  }
};

const BookingPageHeader: React.FC<BookingPageHeaderProps> = ({ variant }) => {
  const content = getVariantContent(variant);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-brutalist ${content.color}`}
        >
          {content.icon}
          <span className="font-medium">Fit or Free Session</span>
        </div>

        <motion.h1 className="text-4xl md:text-5xl font-extrabold leading-tight"  variants={itemVariants}>
          {content.headline}
        </motion.h1>

        <motion.h3 className="text-xl text-gray-600 max-w-3xl mx-auto"  variants={itemVariants}>
          Virtual therapy for Georgia adults with a licensed therapist. <span className="font-bold"> Free 15‑minute consult. </span> First full session is on us if it doesn’t feel right.
        </motion.h3>
      </div>

      {/* Trust Strip */}
        <div
              className="flex flex-row gap-4 flex-wrap justify-center">

              {TRUST_INDICATORS.map((indicator, index) => (
            <div key={index} className="flex items-center gap-3 ">
              <IconCircle
                icon={<indicator.icon className="w-4 h-4" />}
                size="xs"
                bgColor="bg-green-500"
              />
              <span className="font-medium ">{indicator.text}</span>
            </div>
          ))}
            </div>
    </div>
  );
};

export default BookingPageHeader;
