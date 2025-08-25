import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { NextRequest } from 'next/server';
import { typeDefs } from '@/lib/graphql/typeDefs';
import { resolvers } from '@/lib/graphql/resolvers';
import { createClient } from '@supabase/supabase-js';

interface Context {
  req: NextRequest;
  supabase: any;
  user: any;
  session: any;
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  context: async req => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    return {
      req,
      supabase,
      user: null, // Add proper user context from request if needed
      session: null, // Add proper session context from request if needed
    };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
