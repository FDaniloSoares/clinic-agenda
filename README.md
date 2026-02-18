# Clinic Agenda

A production-ready SaaS platform for clinic appointment management, built with modern fullstack architecture and Stripe-powered subscription billing.

> Designed to help healthcare clinics manage doctors, patients, and appointments — with built-in analytics and plan-based access control.

**Live:** [clinic-agenda-20ff3e5802b954de7.vercel.app](https://clinic-agenda-20ff3e5802b954de7.vercel.app)

---

## Overview

**Clinic Agenda** is a subscription-based clinic management system that enables healthcare providers to handle their entire operational workflow in one place. From onboarding a new clinic to scheduling appointments and tracking revenue, the platform is built to scale with real business needs.

The subscription model is powered by Stripe, offering recurring monthly billing, a self-serve customer portal, and webhook-driven plan state synchronization — designed with reliability and UX in mind.

---

## Key Features

### Clinic Management
- Multi-clinic support with per-clinic data isolation
- Guided onboarding flow after sign-up (clinic creation step)
- All data scoped to the authenticated clinic via enriched session context

### Doctor Management
- Register doctors with specialty, appointment pricing, and weekly availability windows
- Availability defined by day range and time range (stored in UTC)
- Intelligent time slot generation (30-min intervals) based on real availability

### Patient Management
- Full patient registry with contact info and demographics
- Filterable and sortable data table view
- Create, update, and delete operations with optimistic feedback

### Appointment Scheduling
- Book appointments by selecting available time slots per doctor
- Real-time availability calculation based on existing bookings and doctor schedule
- Full CRUD with instant UI updates via server-side revalidation

### Analytics Dashboard
- Revenue tracking (total and daily breakdown)
- Appointment volume statistics
- Top doctors and specialties by demand
- Daily appointment chart (10-day rolling view)
- Today's appointment list at a glance
- Date range filtering

### Subscription & Billing (Stripe)
- **Essential Plan** — R$ 59/month
  - Up to 3 doctors
  - Unlimited appointments
  - Analytics dashboard
  - Patient records
  - Email support
- Checkout session creation via server action
- Subscription lifecycle management via Stripe webhooks (`invoice.paid`, `customer.subscription.deleted`)
- Self-serve billing portal via Stripe Customer Portal
- Plan state persisted in database and reflected in session

### Authentication
- Email/password sign-up and sign-in
- Google OAuth (social login)
- Session enriched with clinic context and plan data
- Route protection via middleware (unauthenticated → login, no clinic → onboarding)

---

## Tech Stack

### Frontend
| Tech | Role |
|---|---|
| Next.js 15 (App Router) | Framework with React Server Components |
| React 19 | UI rendering |
| TypeScript | Type safety end-to-end |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component primitives |
| TanStack React Query | Server state and cache management |
| TanStack React Table | Sortable/filterable data tables |
| React Hook Form + Zod | Form state and schema validation |
| Recharts | Data visualization (charts) |
| Nuqs | URL-driven query state management |
| Sonner | Toast notification system |

### Backend
| Tech | Role |
|---|---|
| Next.js API Routes | Serverless API layer |
| next-safe-action | Type-safe server actions with Zod |
| better-auth | Authentication (email + Google OAuth) |
| Drizzle ORM | Type-safe PostgreSQL access |
| Neon (serverless Postgres) | Managed database |
| Stripe SDK | Subscriptions, checkout, webhooks, portal |

### Infrastructure
| Tech | Role |
|---|---|
| Vercel | Deployment and serverless runtime |
| Neon | Serverless PostgreSQL on AWS (sa-east-1) |
| Stripe | Payment processing and billing lifecycle |

---

## Architecture Highlights

**Multi-Tenant Isolation**
Data is scoped by `clinicId` across all tables. A `UserToClinicTable` junction enables multi-clinic support, and the auth session is enriched server-side to carry clinic context — removing the need to pass IDs through every request.

**Type-Safe Server Actions**
All mutations go through `next-safe-action` with Zod schema validation. Actions are co-located with their domain logic under `src/actions/`, keeping the codebase organized and the data flow predictable.

**Stripe Webhook Lifecycle**
Subscription state is synchronized asynchronously via Stripe webhooks. `invoice.paid` activates the plan and stores customer/subscription IDs. `customer.subscription.deleted` reverts access — decoupling payment events from the UI flow.

**Server-First Data Fetching**
Dashboard and list views are fetched at the server component level using Drizzle ORM with parallel queries (`Promise.all`). Mutations trigger `revalidatePath()` for immediate cache invalidation without client-side refetching overhead.

**UTC Time Management**
Doctor availability windows are stored in UTC and converted client-side via `dayjs` plugins. Time slot generation is deterministic and respects existing appointments, ensuring no double-booking.

---

## Database Schema

```
users           → Authentication + Stripe subscription state
clinics         → Clinic organizations
userToClinics   → Multi-clinic assignment (junction)
doctors         → Medical professionals with availability config
patients        → Patient registry
appointments    → Scheduled appointments (linked to clinic, doctor, patient)
sessions        → Auth session tokens
accounts        → OAuth provider accounts
verifications   → Email verification tokens
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or a [Neon](https://neon.tech) project)
- Stripe account with a configured product and price

### Environment Variables

```env
DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRODUCT_ID=
STRIPE_ESSENTIAL_PLAN_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=
```

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate and apply migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Project Structure

```
src/
├── actions/          # Type-safe server actions (appointments, doctors, patients, billing)
├── app/
│   ├── (protected)/  # Authenticated routes (dashboard, appointments, doctors, patients, subscription)
│   ├── api/          # API handlers (auth, stripe webhook)
│   └── authentication/
├── components/ui/    # shadcn/ui component library
├── db/               # Drizzle ORM schema and client
├── data/             # Server-side data fetching (dashboard aggregations)
├── helpers/          # Currency and time utilities
├── hooks/            # Custom React hooks
├── lib/              # Auth configuration, safe-action wrapper, utilities
└── providers/        # React Query provider
```

---

## About

Built as a fullstack project demonstrating SaaS product architecture — from subscription billing to multi-tenant data isolation, auth session enrichment, and a performance-oriented frontend built on Next.js App Router with React Server Components.

Part of my portfolio of production-driven web applications. More at [github.com/fdaniel](https://github.com/fdanel).
