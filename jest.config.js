const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // ✅ Transform ESM modules that Jest can't handle
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase|@testing-library)/)'
  ],

  // ✅ Handle CSS and other assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle absolute imports if you're using them
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // ✅ Ensure proper module resolution
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // ✅ Add globals for modern JS features
  globals: {
    'ts-jest': {
      useESM: true
    }
  },

  // ✅ Set module type
  preset: 'ts-jest/presets/default-esm',
};

module.exports = createJestConfig(customJestConfig);
