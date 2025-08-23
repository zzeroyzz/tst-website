This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Testing Setup Guide

## Quick Start

1. **Install dependencies:**

```bash
npm install --save-dev jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw whatwg-fetch ts-jest @jest/globals
```

2. **Create configuration files:**
   - `jest.config.js` - Main Jest configuration
   - `jest.setup.js` - Test setup and mocks
   - `src/__tests__/test-utils.tsx` - Custom test utilities

3. **Add test scripts to package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:api": "jest --selectProjects=node",
    "test:components": "jest --selectProjects=jsdom"
  }
}
```

## Running Tests

- **All tests:** `npm test`
- **Watch mode:** `npm run test:watch`
- **Coverage:** `npm run test:coverage`
- **API tests only:** `npm run test:api`
- **Component tests only:** `npm run test:components`

## Test Structure

```
src/
├── __tests__/
│   ├── test-utils.tsx          # Custom testing utilities
│   └── integration/            # Integration tests
├── app/api/
│   └── contact/
│       ├── route.ts
│       └── route.test.ts       # API route tests
└── components/
    ├── ContactForm.tsx
    └── ContactForm.test.tsx    # Component
```
