import React from 'react';
import CircleIcon from '@/components/CircleIcon/CircleIcon';

interface TestimonialCardProps {
  quote: string;
  iconUrl: string;
  bgColor: string;
  altText: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  iconUrl,
  bgColor,
  altText,
}) => {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <CircleIcon
        size="md"
        bgColor={bgColor}
        iconUrl={iconUrl}
        altText={altText}
      />
      <p className="max-w-xs">&quot;{quote}&quot;</p>
    </div>
  );
};

export default TestimonialCard;
