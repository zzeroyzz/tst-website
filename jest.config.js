/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase|@testing-library|isows)/)'
  ],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-utils.js',
    '<rootDir>/src/__tests__/test-utils.tsx',
    '<rootDir>/src/__tests__/mocks/'
  ]
};

module.exports = createJestConfig(customJestConfig);
