'use client';

import React from 'react';
import { createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import {
  ApolloClient,
  InMemoryCache,
  ApolloNextAppProvider,
} from '@apollo/experimental-nextjs-app-support';

// HTTP Link
const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

// Auth link for future authentication
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      // Future auth headers can be added here
    },
  };
});

// Error handling link - simplified for compatibility
const errorLink = onError(() => {
  // Basic error logging - can be enhanced later
  console.error('GraphQL operation error occurred');
});

// Enhanced cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        contacts: {
          merge: false, // Replace entirely to avoid stale data
        },
        messages: {
          merge: false,
        },
        notifications: {
          merge: false,
        },
        upcomingAppointments: {
          merge: false,
        }
      }
    },
    Contact: {
      fields: {
        messages: {
          merge: false,
        },
        segments: {
          merge: false,
        }
      },
    }
  },
});

// Combine links
const link = from([errorLink, authLink, httpLink]);

function makeClient() {
  return new ApolloClient({
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-and-network',
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      },
      mutate: {
        errorPolicy: 'all',
      }
    },
  });
}

export const apolloClient = makeClient();

interface ApolloWrapperProps {
  children: React.ReactNode;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloWrapper>{children}</ApolloWrapper>;
}
