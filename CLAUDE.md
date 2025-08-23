# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing

- `npm run test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:verbose` - Run tests with verbose output
- `npm run test:debug` - Run tests in debug mode
- `npm run cy:open` - Open Cypress UI for e2e tests
- `npm run cy:run` - Run Cypress e2e tests headlessly
- `npm run test:e2e` - Run specific e2e tests
- `npm run test:component` - Run Cypress component tests

## Architecture Overview

This is a **Next.js 15** therapy practice website with the following key architectural components:

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Modules for components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with middleware protection
- **Analytics**: Vercel Analytics, Microsoft Clarity, Google Tag Manager
- **Email**: Custom email templates with Zapier integration
- **Testing**: Jest + React Testing Library, Cypress for e2e

### Directory Structure

#### `/src/app/` - App Router Pages

- **Public pages**: `/`, `/contact`, `/therapy-services`, `/about`, `/guides`
- **Authentication**: `/login` with Supabase auth
- **Protected dashboard**: `/dashboard` (requires authentication)
- **API routes**: `/api/` with comprehensive endpoints for:
  - Contact forms and appointment booking
  - Newsletter management
  - Blog/post management with view/like tracking
  - Appointment scheduling and management
  - Questionnaire handling with automated reminders

#### `/src/components/` - React Components

- **Client components**: Located in `/clients/` subdirectory
- **Reusable UI**: Button, Input, Modal components with CSS Modules
- **Business logic**: Appointment management, Lead tracking, Blog editor
- **Skeleton loaders**: Comprehensive loading states in `/skeleton/`

#### `/src/data/` - Static Content

Contains structured data for pages, services, FAQ, testimonials, and animations.

#### `/src/lib/` - Utilities and Helpers

- Email template generation and sending
- Analytics integration
- Appointment and date utilities

### Authentication & Security

- **Middleware**: `middleware.ts` protects `/dashboard` routes using Supabase session
- **Auth flow**: Supabase Auth with redirect handling
- **Protected routes**: Dashboard requires authentication

### Business Domain

This is a **therapy practice website** for "Toasted Sesame Therapy" offering:

- Online therapy services in Georgia
- Neuro-affirming and trauma-informed approach
- Appointment booking and management system
- Newsletter/blog system ("Toasty Tidbits")
- Lead management and questionnaire system

### Key Features

- **Booking system**: Multiple therapy service types with calendar integration
- **Dashboard**: Admin interface for managing appointments, blog posts, newsletters
- **Notifications**: Dashboard notification system for appointment management
- **Blog system**: Public blog with view/like tracking and admin management
- **Email automation**: Contact forms, appointment confirmations, reminders
- **Cron jobs**: Automated questionnaire reminders (runs every 12 hours)

### Testing Setup

- **Unit/Integration**: Jest with jsdom environment
- **Component testing**: React Testing Library with custom test utilities
- **E2E testing**: Cypress with comprehensive test coverage
- **API testing**: Dedicated API route testing with mocks
- **MSW**: Mock Service Worker for API mocking in tests

### Development Notes

- Uses CSS Modules (`.module.css`) for component-specific styling
- Component naming follows PascalCase with dedicated directories
- API routes follow Next.js App Router conventions
- TypeScript strict mode enabled with comprehensive type definitions
- Image optimization configured for Supabase and external sources
- Bundle analyzer available with `ANALYZE=true npm run build`

### Environment & Deployment

- **Deployment**: Vercel with cron job configuration
- **Database**: Supabase with custom email templates
- **Analytics**: Multiple tracking services integrated
- **Performance**: Image optimization, bundle analysis, speed insights

## Project Context & Brand Guidelines

### Business & Audience

- **Practice**: Toasted Sesame Therapy (TST) — virtual-only, Georgia-based therapy practice
- **Audience**: Adults (trauma survivors, neurodivergent folks) seeking clear structure, practical tools, culturally-aware care
- **Goal**: Increase qualified consults at $150/session; reduce no-shows via clear messaging and reminders

### Brand & Design Aesthetic

- **Design Style**: Neo‑Brutalist (boxy blocks, bold borders, high contrast, minimal gradients, purposeful shadows)
- **Primary Palette**: Black & White
- **Secondary**: Light sky blue
- **Accent Colors**: Crimson, millennial pink, lilac, black, brown (use sparingly and consistently)
- **Tone**: Warm, supportive, direct. Short, helpful sentences. Avoid jargon
- **Typography**: Clean sans with optional grotesk/mono accents. Big H1s, confident hierarchy

### Pages & CTAs

- **Primary CTA**: "Book a consultation" (or equivalent)
- **Secondary**: "Learn more / Resources"
- **Pages**: Home/landing, Services, About, FAQs, Resources/Lead magnets, Contact/Scheduling

### Accessibility & Usability Priorities

- WCAG AA contrast as minimum; visible focus; keyboard‑friendly flows
- Large tap targets and simple forms (collect essentials only)
- Clear error states and plain‑language copy

## Design Review Workflow

### Automated Design Review System

This project includes a comprehensive automated design review system using:

**Core Features:**

- **Playwright MCP Integration**: Live environment testing with actual UI components
- **Standards-Based Evaluation**: WCAG AA+, visual hierarchy, accessibility, responsive design
- **Tailwind Token Alignment**: Ensures design consistency with project's design system
- **Multi-Phase Review Process**: Systematic evaluation covering interaction flows, responsiveness, visual polish

**Available Commands:**

- `/design-review [url]` - Run live design review on any URL using Playwright MCP
- Design review agent available via `@agent-code-reviewer` for PR reviews
- Tailwind tokens analysis for design system consistency

### Design Principles Checklist

All design reviews follow this structured evaluation:

1. **Readability & Hierarchy**: Font sizes, line length, spacing, text structure
2. **Color & Contrast**: WCAG AA compliance, interactive states, accent color usage
3. **Interaction & Focus**: Focus rings, touch targets, keyboard navigation
4. **Structure & Semantics**: Proper headings, button/link usage, landmarks
5. **Performance**: Image optimization, loading speed, layout stability
6. **Content & Clarity**: Clear CTAs, user-focused copy, essential form fields
7. **Mobile**: Responsive breakpoints, comfortable tap targets, no gesture requirements

### Review Output Format

- **P1**: Blocks task completion or seriously harms comprehension
- **P2**: Noticeable usability issue with workarounds
- **P3**: Nice-to-have polish
- Includes Quick Wins (48-hour fixes) and Longer-Term improvements

## Specialized Tools & Commands

### Lyra - AI Prompt Optimization Specialist

The project includes Lyra, a master-level prompt optimization tool using the 4-D methodology:

1. **Deconstruct**: Extract core intent, entities, context
2. **Diagnose**: Audit clarity gaps and completeness
3. **Develop**: Select optimal techniques (creative, technical, educational, complex)
4. **Deliver**: Construct optimized prompt with implementation guidance

**Operating Modes:**

- **DETAIL MODE**: Comprehensive optimization with clarifying questions
- **BASIC MODE**: Quick fixes with core techniques

### Design System Management

- **Tailwind Token Analysis**: Read `tailwind.config.js/ts` for design system tokens
- **Token Compliance**: Flag off‑token values and recommend closest alternatives
- **Neo‑Brutalist Overlay**: Apply TST-specific design principles to all reviews

## Review Expectations

- Always align design tokens to Tailwind config (colors/spacing/radii/type/shadows)
- Apply Neo‑Brutalist principles overlay for TST brand consistency
- When proposing fixes, prefer Tailwind utilities using tokens over raw CSS
- Provide "Quick Wins" when changes can be made with utility classes alone
- Reference project context from `project-context.md` for brand-aligned solutions
