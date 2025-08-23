import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/lib/graphql/schema.graphql',
  documents: 'src/lib/graphql/**/*.ts',
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      plugins: [],
    },
    'src/lib/graphql/generated/hooks.ts': {
      plugins: ['typescript-react-apollo'],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
};

export default config;
