'use client';

import React from 'react';
import { RoughNotation } from 'react-rough-notation';

interface HighlightProps {
  children: React.ReactNode;
  color: string;
}

const Highlight: React.FC<HighlightProps> = ({ children, color }) => {
  return (
    <RoughNotation type="circle" show={true} color={color} padding={[2, 10]}>
      {children}
    </RoughNotation>
  );
};

export default Highlight;
