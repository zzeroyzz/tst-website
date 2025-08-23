'use client';

import React from 'react';
import { ApolloWrapper as ClientApolloWrapper } from './client';

interface ApolloWrapperProps {
  children: React.ReactNode;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return <ClientApolloWrapper>{children}</ClientApolloWrapper>;
}
