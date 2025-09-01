import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  padding?: 'default' | 'small' | 'large' | 'none';
  paddingTop?: 'default' | 'small' | 'large' | 'none';
  paddingBottom?: 'default' | 'small' | 'large' | 'none';
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  minHeight,
  padding,
  paddingTop,
  paddingBottom,
}) => {
  // Define padding classes based on variant
  const getPaddingClasses = () => {
    // If specific top/bottom padding is set, use those instead of general padding
    if (paddingTop !== undefined || paddingBottom !== undefined) {
      const topClass = getPaddingTopClass(paddingTop || 'default');
      const bottomClass = getPaddingBottomClass(paddingBottom || 'default');
      return `${topClass} ${bottomClass}`;
    }

    // Otherwise use general padding (backward compatibility)
    switch (padding || 'default') {
      case 'small':
        return 'py-8 sm:py-12 lg:py-16';
      case 'large':
        return 'py-20 sm:py-24 lg:py-32';
      case 'none':
        return '';
      case 'default':
      default:
        return 'py-16 sm:py-20 lg:py-24';
    }
  };

  const getPaddingTopClass = (variant: string) => {
    switch (variant) {
      case 'small':
        return 'pt-8 sm:pt-12 lg:pt-16';
      case 'large':
        return 'pt-20 sm:pt-24 lg:pt-32';
      case 'none':
        return '';
      case 'default':
      default:
        return 'pt-16 sm:pt-20 lg:pt-24';
    }
  };

  const getPaddingBottomClass = (variant: string) => {
    switch (variant) {
      case 'small':
        return 'pb-8 sm:pb-12 lg:pb-16';
      case 'large':
        return 'pb-20 sm:pb-24 lg:pb-32';
      case 'none':
        return '';
      case 'default':
      default:
        return 'pb-16 sm:pb-20 lg:pb-24';
    }
  };

  const sectionClasses = `w-full ${getPaddingClasses()} ${className}`;
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
