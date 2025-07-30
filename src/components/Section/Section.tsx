import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "", minHeight }) => {
  const sectionClasses = `w-full py-16 sm:py-20 lg:py-24 ${className}`;
  const style = minHeight ? { minHeight } : undefined;

  return (
    <section className={sectionClasses} style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-500">
        {children}
      </div>
    </section>
  );
};

export default Section;
