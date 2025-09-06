# TST Codebase Feature Mapping

*Generated on 2025-01-09*

This document provides a comprehensive mapping of relationships between pages, components, hooks, services, and external APIs in the Toasted Sesame Therapy (TST) codebase.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Appointment Booking Flow](#appointment-booking-flow)
3. [Dashboard & Admin System](#dashboard--admin-system)
4. [CRM & Messaging System](#crm--messaging-system)
5. [Content Management (Blog & Newsletter)](#content-management-blog--newsletter)
6. [Contact Forms & Lead Management](#contact-forms--lead-management)
7. [Reschedule & Cancel Flows](#reschedule--cancel-flows)
8. [External Service Integrations](#external-service-integrations)
9. [State Management & Hooks](#state-management--hooks)
10. [Data Flow Architecture](#data-flow-architecture)

---

## System Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **GraphQL**: Apollo Client with custom resolvers
- **Email**: Resend + Mailchimp
- **SMS**: Twilio
- **Analytics**: Vercel, Clarity, GTM

### Core Directory Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, services, GraphQL
├── contexts/             # React context providers  
├── data/                 # Static content/configuration
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

---

## Appointment Booking Flow

### Pages
- `/book/page.tsx` → Redirects to `/book/trauma`
- `/book/trauma/page.tsx` → Trauma-focused booking variant
- `/book/nd/page.tsx` → Neurodivergent-focused booking variant
- `/book/affirming/page.tsx` → LGBTQIA+ affirming booking variant

### Component Dependencies

#### Primary Flow Components
```
UnifiedBookingFlow.tsx
├── BookingPageHeader.tsx          # Variant-specific headers
├── CalendarStepComponent.tsx      # Date/time selection
│   ├── API: /api/appointment/booked-slots
│   └── Uses: date-fns, date-fns-tz
├── BookingDetailsForm.tsx         # Contact information collection
│   └── Hook: useBookingSubmission.ts
└── AdditionalContent.tsx          # Below-fold content
```

### Service Layer Connections

#### CalendarStepComponent.tsx
- **API Routes**: 
  - `POST /api/appointment/booked-slots` - Fetches existing appointments
- **External Services**: 
  - Direct Supabase queries for availability checking
- **Data Flow**: 
  ```
  UI Calendar → API Route → Supabase → Available Slots → UI Update
  ```

#### BookingDetailsForm.tsx + useBookingSubmission.ts
- **GraphQL Mutations**:
  - `CREATE_LEAD_WITH_APPOINTMENT` - Creates contact + appointment
- **API Routes**:
  - `POST /api/send-appointment-emails` - Sends confirmation emails
- **External Services**:
  - Supabase (contact storage)
  - Resend (email delivery)
  - Twilio (optional SMS workflows)
- **Data Flow**:
  ```
  Form Submit → GraphQL Mutation → Supabase Insert → Email API → Resend + Admin Notification
  ```

### Hooks & State Management
- `useBookingSubmission.ts` - Handles form state, validation, submission
- Form validation via `/src/lib/validation.ts`
- Phone formatting with libphonenumber-lite

---

## Dashboard & Admin System

### Pages
- `/dashboard/page.tsx` - Main admin interface
- `/dashboard/blog/[id]/page.tsx` - Blog post editor
- `/dashboard/blog/create/page.tsx` - New blog post creation  
- `/dashboard/newsletter/[id]/page.tsx` - Newsletter editor

### Component Dependencies

#### Dashboard Navigation & Layout
```
DashboardPage.tsx
├── DashboardView.tsx              # Main dashboard overview
├── AppointmentsDashboard.tsx      # Appointment management
├── LeadsView.tsx                  # Contact/lead management
├── NewsletterView.tsx             # Newsletter creation/management
├── BlogView.tsx                   # Blog post management
├── KanbanBoard.tsx                # Task management
├── CRMView.tsx                    # Customer relationship management
└── DashboardNotifications.tsx    # Real-time notifications
```

#### Service Layer Connections

**AppointmentsDashboard.tsx**
- **Hook**: `useAppointments.ts`
- **API Routes**: 
  - `GET /api/contact/appointments` - Fetch all appointments
- **External Services**: Supabase queries via API routes

**LeadsView.tsx** 
- **GraphQL Queries**: Contact queries via Apollo Client
- **External Services**: Direct Supabase integration

**DashboardNotifications.tsx**
- **API Routes**: 
  - `GET /api/dashboard/notifications` - Fetch recent activities
- **Real-time Updates**: Supabase subscriptions (optional)

### Authentication Flow
- **Middleware**: `middleware.ts` protects `/dashboard` routes
- **Auth Provider**: Supabase Auth with session management
- **Redirect Logic**: Unauthenticated users → `/login`

---

## CRM & Messaging System

### Components Architecture
```
CRMView.tsx
├── ContactsManager.tsx            # Contact database management
├── MessagingInterface.tsx         # SMS/messaging interface  
├── MessageTemplates.tsx           # Template management
├── CRMAnalytics.tsx              # Communication analytics
└── ConversationHistory.tsx        # Message history view
```

### Service Layer Integration

#### MessagingInterface.tsx
- **GraphQL Mutations**:
  - `SEND_MESSAGE` - Send SMS via GraphQL
  - `SEND_BULK_MESSAGES` - Batch messaging
- **External Services**:
  - Twilio SMS API via `/src/lib/twilio/client.ts`
- **Webhook Handling**:
  - `POST /api/twilio/webhook` - Incoming SMS processing

#### Twilio Integration
- **Client**: `/src/lib/twilio/client.ts`
- **Webhook Processor**: `/src/lib/twilio/webhook-processor.ts` 
- **Workflow Triggers**: `/src/lib/twilio/workflow-triggers.ts`
- **Data Flow**:
  ```
  CRM Message → GraphQL → Twilio Client → SMS Sent → Webhook → Database Update
  ```

---

## Content Management (Blog & Newsletter)

### Blog System

#### Components
```
BlogView.tsx
├── BlogEditor.tsx                 # Rich text blog editor
├── BlogPreviewModal.tsx           # Blog post preview
└── BlogDetailModal.tsx            # Blog post details/stats
```

#### API Routes & Services
- `POST /api/posts/[slug]/view` - Track blog post views
- `POST /api/posts/[slug]/like` - Handle post likes  
- `POST /api/upload/image` - Handle image uploads for blog content

#### External Services
- **Supabase**: Blog post storage, view/like tracking
- **Image Hosting**: Supabase Storage for blog images

### Newsletter System

#### Components  
```
NewsletterView.tsx
├── NewsletterEditor.tsx           # Email template editor
└── NewsletterPreviewModal.tsx     # Preview before sending
```

#### API Routes & Services
- `POST /api/newsletter/subscribe` - Newsletter subscriptions
- `POST /api/newsletter/send` - Send newsletter campaigns
- `GET /api/newsletter/preview` - Generate email previews

#### External Services Integration
- **Mailchimp**: Audience management, analytics tracking
- **Resend**: Email delivery for newsletters
- **Custom Templates**: `/src/lib/custom-email-templates.ts`

### Hook Usage
- `usePostInteractions.ts` - Manages blog post likes/views
- State managed locally with API sync for persistence

---

## Contact Forms & Lead Management

### Contact Form Components
```
ContactPageClient.tsx
└── ContactForm.tsx                # Main contact form
    └── CalendarContactForm.tsx    # Alternative calendar-integrated form
```

### Lead Management Components
```
LeadsView.tsx
├── LeadDetailModal.tsx            # Individual lead details
└── LeadCalendar.tsx              # Calendar view of leads
```

### API Integration & Data Flow

#### Contact Form Submission
- **API Route**: `POST /api/contact/route` (Not found in current scan - likely exists)
- **GraphQL Mutations**: `CREATE_CONTACT`, `CREATE_BOOKING_CONTACT`
- **External Services**:
  - Supabase contact storage
  - Email notifications via Resend
  - SMS workflows via Twilio

#### Lead Scoring & Segmentation
- **GraphQL Mutations**: 
  - `UPDATE_CONTACT_SEGMENTS` - Segment management
  - `ADD_CONTACTS_TO_SEGMENT` - Bulk segment operations
- **Workflow Automation**: 
  - `/src/lib/sms/workflows.ts` - Automated follow-up sequences
  - `/src/lib/conversations/flow-manager.ts` - Conversation state management

---

## Reschedule & Cancel Flows

### Pages
- `/cancel-appointment/[uuid]/page.tsx` - Appointment cancellation
- `/reschedule/[uuid]/page.tsx` - Appointment rescheduling  
- `/thank-you-reschedule/page.tsx` - Reschedule confirmation

### Component Dependencies

#### Cancel Flow
```
CancelAppointmentPage.tsx
├── API: /api/appointment/cancel-link/[uuid]  # Fetch appointment details
└── API: /api/appointment/cancel             # Process cancellation
```

#### Reschedule Flow  
```
ReschedulePage.tsx
├── AppointmentRescheduleCalendar.tsx       # New date/time selection
├── API: /api/appointment/reschedule        # Process reschedule
└── API: /api/appointment/available-slots   # Check availability
```

### Service Layer & External Integration

#### UUID-based Security
- **Token Generation**: Contact UUID used as secure cancellation token
- **Validation**: Server-side UUID verification before operations
- **Email Integration**: Cancel/reschedule links embedded in confirmation emails

#### API Routes
- `GET /api/appointment/cancel-link/[uuid]` - Fetch appointment by UUID
- `POST /api/appointment/cancel` - Cancel appointment
- `POST /api/appointment/reschedule` - Reschedule appointment
- `POST /api/appointment/status` - Update appointment status

---

## External Service Integrations

### Supabase Integration
**Tables & Relationships:**
- `contacts` - Primary contact/lead storage
- `crm_messages` - SMS/message history
- `notifications` - Dashboard notifications
- `appointments` (implicit) - Stored as fields in contacts table

**Authentication:**
- Session management for dashboard access
- Role-based access control (admin-only routes)

### Resend Email Service
**Configuration:**
- `/src/lib/email-sender.ts` - Email delivery service
- `/src/lib/appointment-email-templates.ts` - Appointment confirmations
- `/src/lib/custom-email-templates.ts` - Newsletter/welcome emails

**Email Types:**
- Appointment confirmations (client + admin)
- Appointment reminders
- Newsletter subscriptions
- Welcome sequences
- Cancellation confirmations

### Twilio SMS Service
**Configuration:**
- `/src/lib/twilio/client.ts` - SMS client setup
- Phone number formatting & validation
- WhatsApp messaging support

**Workflow Integration:**
- `/src/lib/sms/workflows.ts` - Automated SMS sequences
- `/src/lib/sms/simple-workflows.ts` - Basic reminder workflows
- Webhook processing for incoming messages

### Mailchimp Integration
**Usage:**
- Newsletter subscriber management
- Analytics and engagement tracking
- Audience segmentation
- Custom tag management

**API Integration:**
- Subscriber addition/update
- Merge field management
- Campaign analytics (read-only)

### Analytics Stack
- **Vercel Analytics**: Performance monitoring
- **Microsoft Clarity**: User behavior tracking  
- **Google Tag Manager**: Event tracking
- Custom event tracking for booking conversions

---

## State Management & Hooks

### Custom Hooks

#### Booking & Appointments
- `useBookingSubmission.ts` - Complete booking form management
- `useAppointments.ts` - Appointment data fetching and refresh
- `useInterceptCalendlyAnalytics.ts` - Analytics integration

#### Content & Interactions
- `usePostInteractions.ts` - Blog post like/view tracking
- `useSubscribeModalTrigger.ts` - Newsletter modal triggers
- `useAnimationData.ts` - Animation configuration loading

### Context Providers
- `NavigationContext.tsx` - Global navigation state
- `NavigationProvider` - Navigation loading states
- Apollo Client Provider - GraphQL state management

### State Management Patterns

#### Local State (useState)
- Form data in booking flows
- Modal visibility states  
- Dashboard tab selections
- Component-specific UI state

#### Server State (Apollo Client)
- Contact/lead data
- CRM messaging data
- Dashboard analytics
- Blog post management

#### Persistent State (localStorage)
- Dashboard view preferences
- Sidebar collapse state
- Read notification tracking
- User interface preferences

---

## Data Flow Architecture

### Appointment Booking Data Flow
```
User Input (Calendar + Form)
    ↓
CalendarStepComponent → /api/appointment/booked-slots → Supabase
    ↓
BookingDetailsForm → useBookingSubmission
    ↓
GraphQL Mutation (CREATE_LEAD_WITH_APPOINTMENT)
    ↓
Supabase Insert (contacts table)
    ↓
Email API (/api/send-appointment-emails)
    ↓
Resend Email Service → Client + Admin Notifications
    ↓
Thank You Page Redirect
```

### CRM Messaging Data Flow  
```
CRM Interface (Send Message)
    ↓
GraphQL Mutation (SEND_MESSAGE)
    ↓  
Twilio Client → SMS Sent
    ↓
Twilio Webhook (/api/twilio/webhook)
    ↓
Supabase Update (crm_messages table)
    ↓
Real-time UI Update (via polling/subscription)
```

### Contact Form to Lead Conversion
```
Contact Form Submit
    ↓
Form Validation (client-side)
    ↓
GraphQL Mutation (CREATE_CONTACT)
    ↓
Supabase Insert (contacts table)
    ↓
Optional SMS Workflow Trigger
    ↓
Dashboard Notification Creation
    ↓
Success Response
```

### Newsletter Subscription Flow
```
Newsletter Form Submit
    ↓
/api/newsletter/subscribe
    ↓
Mailchimp API (subscriber addition)
    ↓
Custom Welcome Email (Resend)
    ↓
Success Confirmation
```

### Blog Content Management Flow
```
Blog Editor (Dashboard)
    ↓
Content Validation
    ↓
Image Upload (/api/upload/image) → Supabase Storage
    ↓
Blog Post Save (GraphQL/Supabase)
    ↓
Public Blog Update
    ↓
View/Like Tracking (/api/posts/[slug]/view, /api/posts/[slug]/like)
```

---

## Key Architectural Patterns

### API Design
- **RESTful Routes**: Traditional CRUD operations via `/api/` routes
- **GraphQL Layer**: Complex queries and mutations via Apollo Client
- **Hybrid Approach**: REST for simple operations, GraphQL for complex data fetching

### Error Handling
- Client-side validation with server-side verification
- Graceful degradation for external service failures
- User-friendly error messages with technical logging

### Security
- Supabase Row Level Security (RLS)
- UUID-based secure tokens for sensitive operations
- Webhook signature verification for external services
- Environment variable protection for API keys

### Performance Optimization
- Server-side rendering with Next.js App Router
- Component code splitting and lazy loading
- Image optimization via Next.js Image component  
- Efficient GraphQL queries with minimal over-fetching

### Scalability Considerations
- Separation of concerns (UI/Business Logic/Data)
- Microservice-style API route organization
- Modular component architecture
- Extensible webhook and workflow systems

---

*This feature map represents the current state of the TST codebase as analyzed on 2025-01-09. The system demonstrates a well-architected therapy practice management platform with strong separation of concerns and comprehensive external service integration.*