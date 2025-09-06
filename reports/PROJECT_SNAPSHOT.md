# PROJECT_SNAPSHOT.md
# Toasted Sesame Therapy (TST) - Comprehensive Project Analysis

Generated on: 2025-09-06

## Business Overview

**Toasted Sesame Therapy** is a virtual-only therapy practice based in Georgia, specializing in neuro-affirming and trauma-informed care for adults. The practice serves deep feelers, drained hearts, and healing seekers with a focus on:

- **Primary Specialties**: Anxiety, trauma (CPTSD), ADHD support, depression
- **Approach**: Neuro-affirming, trauma-informed, somatic, identity-affirming
- **Target Demographics**: LGBTQIA+ individuals, neurodivergent adults, BIPOC clients, highly sensitive persons
- **Service Model**: Individual therapy sessions (50 minutes, virtual/phone), $150/session
- **Geographic Coverage**: Georgia residents only (licensing requirement)

### Core Business Values
- **Neuro-Affirming**: Working with brains, not against them
- **Trauma-Informed**: Safety-first, regulation-focused healing
- **Somatic**: Body wisdom integration and nervous system regulation
- **Identity Work**: Safe spaces for gender, sexuality, race, and neurodivergence exploration

## Technical Architecture

### Framework & Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with middleware protection
- **State Management**: Apollo Client (GraphQL) + React Context
- **Communication**: Twilio (SMS), Resend (email), Mailchimp (campaigns)

### Architecture Patterns

#### 1. App Router Structure (`/src/app/`)
```
/app/
├── (auth)/
│   ├── /login
│   └── /dashboard/* (protected routes)
├── (public)/
│   ├── / (home)
│   ├── /therapy-services
│   ├── /about
│   ├── /contact
│   ├── /book (appointment booking)
│   └── /mental-health-healing-blog
└── /api/ (API routes)
    ├── /appointment/* (booking system)
    ├── /contact/* (form handling)
    ├── /newsletter/* (campaign management)
    ├── /cron/* (automated workflows)
    └── /graphql (Apollo Server)
```

#### 2. Component Architecture (`/src/components/`)
- **113 total components** organized by feature
- **Client Components**: Located in `/clients/` subdirectory
- **Reusable UI**: Button, Input, Modal with CSS Modules
- **Business Components**: Appointment management, CRM, Blog editor
- **Skeleton Loading**: Comprehensive loading states

#### 3. Data Layer
- **Static Content**: `/src/data/` - Services, FAQ, testimonials
- **Type Definitions**: `/src/types/` - Contact, Lead, Notification models
- **Utilities**: `/src/lib/` - Email templates, SMS workflows, analytics

## Key User Flows

### 1. Appointment Booking System
**Critical Path**: Visitor → Consultation Booking → Payment → Confirmation

**Implementation**:
- **Availability API**: `/api/appointment/available-slots` - Real-time slot checking
- **Booking Logic**: 50-minute sessions, 30-minute intervals, business hours (9 AM - 5 PM ET)
- **Conflict Resolution**: Database-driven slot validation
- **Confirmation Flow**: Email + SMS notifications via Resend/Twilio

**Key Components**:
- `BookingCalendar` - Interactive slot selection
- `AppointmentForm` - Contact information capture
- `ConfirmationPage` - Booking success with next steps

### 2. Reschedule/Cancel Flow
**Path**: Email link → Secure form → Database update → Notifications

**Implementation**:
- **Cancel API**: `/api/appointment/cancel` with secure token validation
- **Reschedule API**: `/api/appointment/reschedule` with availability checking
- **Email Templates**: Personalized confirmation emails
- **Database Updates**: Status tracking, audit trail

### 3. Dashboard/CRM System
**Path**: Login → Protected Dashboard → Lead Management → Communication

**Components**:
- **DashboardView**: Analytics overview, recent activity
- **LeadsView**: Contact management, status tracking
- **AppointmentsDashboard**: Calendar management, booking oversight
- **CRMView**: Communication history, workflow management
- **KanbanBoard**: Task management system

### 4. Newsletter & Blog Management
**Path**: Admin → Content Creation → Campaign Management → Distribution

**Features**:
- **BlogView**: Rich text editing, media management
- **NewsletterView**: Mailchimp integration, subscriber management
- **Content API**: `/api/posts`, `/api/newsletter` with CRUD operations

### 5. Contact Forms & Lead Management
**Path**: Contact Form → Database Storage → Auto-Workflows → CRM

**Automation**:
- **Lead Capture**: Contact forms with validation
- **Auto-Reminders**: Cron-triggered SMS/Email sequences
- **Status Tracking**: New → Contacted → Qualified → Scheduled → Converted

## Critical Components

### Authentication & Security
- **Middleware**: `/middleware.ts` - Supabase session validation
- **Protected Routes**: Dashboard requires authentication
- **API Security**: Bearer tokens, CRON secret validation

### Email System
- **Templates**: `/src/lib/custom-email-templates.ts` (29KB+ of templates)
- **Sending**: Resend integration with retry logic
- **Campaigns**: Mailchimp integration for newsletters

### SMS Automation
- **Workflows**: `/src/lib/twilio/workflow-triggers.ts`
- **Reminders**: Automated appointment reminders
- **Follow-ups**: Post-appointment and questionnaire reminders

### Database Schema
**Core Tables** (inferred from types):
- **contacts**: Lead/client information with appointment data
- **notifications**: System-generated alerts and reminders
- **posts**: Blog content with view/like tracking
- **appointments**: Session scheduling and status

**Key Fields**:
```typescript
Contact {
  id, uuid, name, last_name, email, phone_number
  status: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'converted' | 'lost'
  appointment_status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  scheduled_appointment_at, questionnaire_completed_at
  auto_reminder_count, last_auto_reminder_sent
}
```

## External Dependencies

### Communication Services
- **Twilio**: SMS notifications, appointment reminders
- **Resend**: Transactional email delivery
- **Mailchimp**: Newsletter campaigns and marketing automation

### Infrastructure
- **Supabase**: Database, authentication, storage
- **Vercel**: Hosting, serverless functions, cron jobs
- **Apollo Server**: GraphQL API layer

### Analytics & Tracking
- **Vercel Analytics**: Performance monitoring
- **Microsoft Clarity**: User behavior tracking
- **Google Tag Manager**: Conversion tracking

### Development & Testing
- **Jest + RTL**: Unit and integration testing
- **Cypress**: End-to-end testing with component testing
- **MSW**: API mocking for tests
- **ESLint + Prettier**: Code quality and formatting

## Design Principles

### Neo-Brutalist Design System
**Visual Identity**:
- **Primary Colors**: Black & White foundation
- **Secondary**: Light sky blue
- **Accents**: Crimson, millennial pink, lilac, brown
- **Typography**: Work Sans with confident hierarchy
- **Shadows**: Brutalist box shadows (4px 4px 0 #000)
- **Borders**: Bold, high-contrast boundaries

**Tailwind Configuration**:
```javascript
colors: {
  'tst-white': '#FFFFFF',
  'tst-cream': '#F9F5F2', 
  'tst-yellow': '#F7BD01',
  'tst-purple': '#C5A1FF',
  'tst-teal': '#69D4E9',
  'tst-green': '#7FBC8C',
  'tst-red': '#FF6B6B'
}
```

### Accessibility Standards
- **WCAG AA Compliance**: Color contrast, keyboard navigation
- **Semantic HTML**: Proper landmarks, headings hierarchy
- **Skip Links**: Direct content access
- **Focus Management**: Visible focus indicators

## Data Model Overview

### Contact Management System
**Primary Entity**: Contact record with comprehensive tracking

**Lifecycle States**:
1. **Lead Capture** → Contact form submission
2. **Qualification** → Questionnaire completion
3. **Scheduling** → Appointment booking
4. **Conversion** → Session completion
5. **Retention** → Ongoing relationship

### Appointment System
**Booking Logic**:
- **Business Hours**: 9 AM - 5 PM ET
- **Session Length**: 50 minutes
- **Booking Intervals**: 30-minute slots
- **Buffer Time**: 30-minute minimum advance booking

**Status Tracking**:
- Real-time availability checking
- Conflict resolution
- Automated reminder workflows
- No-show and cancellation handling

### Notification System
**Multi-Channel Approach**:
- **Dashboard Notifications**: Real-time admin alerts
- **Email Workflows**: Template-driven campaigns
- **SMS Reminders**: Automated appointment notifications
- **Audit Trail**: Complete communication history

## Critical Workflows

### 1. New Client Onboarding
```
Contact Form → Database Storage → Auto-Questionnaire → Reminder Workflow → Booking Prompt
```

### 2. Appointment Lifecycle
```
Availability Check → Booking → Confirmation → Reminders → Completion → Follow-up
```

### 3. Content Marketing
```
Blog Creation → SEO Optimization → Newsletter Integration → Analytics Tracking
```

### 4. Automated Communication
**Cron Jobs** (Vercel):
- **Cleanup**: Every 2 hours - Past appointment cleanup
- **Reminders**: Every 6 hours - Questionnaire and appointment reminders

## Performance & Optimization

### Build Optimizations
- **Bundle Analyzer**: ANALYZE=true flag for bundle inspection
- **Image Optimization**: WebP/AVIF formats, Supabase CDN
- **Code Splitting**: Dynamic imports for dashboard components
- **CSS Optimization**: Tailwind purging with safelist

### Caching Strategy
- **Apollo Client**: Cache-first queries, cache-and-network updates
- **Next.js**: Static generation for public pages
- **Supabase**: Edge functions for global performance

### Monitoring
- **Vercel Speed Insights**: Core Web Vitals tracking
- **Error Boundaries**: Graceful failure handling
- **Loading States**: Skeleton components for UX

## Development Standards

### Code Quality
- **TypeScript**: Strict mode enforcement
- **ESLint**: Custom rules with Next.js config
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit linting and formatting

### Testing Strategy
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: API route testing with MSW
- **E2E Tests**: Cypress with real user workflows
- **Component Tests**: Cypress component testing

### Deployment Pipeline
- **Vercel Integration**: Automatic deployment from main branch
- **Environment Management**: Separate staging/production configs
- **Cron Configuration**: Automated workflow scheduling
- **Domain Management**: Custom domain with SSL

---

## Summary

Toasted Sesame Therapy represents a sophisticated therapy practice platform combining modern web technologies with thoughtful UX design. The codebase demonstrates enterprise-level architecture with comprehensive testing, automated workflows, and robust business logic supporting the complete client lifecycle from initial contact through ongoing therapy relationships.

The technical implementation prioritizes accessibility, performance, and maintainability while serving the unique needs of trauma-informed, neuro-affirming therapy practice. The system successfully balances complex business requirements with clean, scalable code architecture.