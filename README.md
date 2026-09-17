# Flight Control System

## Overview
A comprehensive Flight Control System web application for academic demonstration. The system manages flight operations including aircraft, pilots, flights, routes, emergencies, alerts, and reports. It features role-based access for Administrator, Flight Operator, and Pilot roles.

## Features
- **Role-Based Access Control**: Different views and capabilities for Administrators, Operators, and Pilots.
- **Aircraft & Pilot Management**: Track availability, maintenance, and assignments.
- **Flight Scheduling**: Create flights with validation against aircraft and pilot availability.
- **Real-time Monitoring**: Monitor flight statuses with cascading effects (e.g., releasing assets on completion).
- **Emergency Management**: Report and resolve emergencies, automatically updating flight statuses and generating alerts.
- **Alerts System**: Notifications for flight delays, status changes, assignments, and emergencies.
- **Reports**: Generate operational reports with CSV export functionality.
- **Responsive Dashboard**: Aviation-inspired modern UI built with Tailwind CSS.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS v3, React Router, Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Deployment**: Vercel

## System Architecture
The application follows a standard client-server architecture where the React frontend communicates directly with the Supabase PostgreSQL database using the Supabase JS client. Business logic and access control are enforced via Supabase Row Level Security (RLS) policies.

## Project Structure
- `src/components/`: Reusable UI components (buttons, modals, tables)
- `src/context/`: React context for Authentication and Toast notifications
- `src/layouts/`: Dashboard layout with sidebar navigation
- `src/lib/`: Supabase client initialization
- `src/pages/`: Feature pages organized by module (auth, dashboard, flights, etc.)
- `src/routes/`: Route definitions and role-based guards
- `src/services/`: Supabase data access layer
- `src/utils/`: Helper functions (formatting, validation, CSV export)
- `supabase/`: SQL migrations for schema, RLS, and seed data

## Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Get your Project URL and anon key from Project Settings > API.
3. Configure authentication to allow Email/Password sign-in.

## Database Setup
1. Open the SQL Editor in your Supabase dashboard.
2. Run `supabase/migrations/001_schema.sql` to create tables and triggers.
3. Run `supabase/migrations/002_rls_policies.sql` to apply security policies.
4. *Optional*: Create some user accounts in Auth, then update profile IDs in `supabase/seed.sql` and run it for demo data.

## Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Vercel Deployment
This project is configured for Vercel deployment with SPA routing (`vercel.json`).
1. Connect your GitHub repository to Vercel.
2. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Vercel will automatically build and deploy.

## User Roles
- **Administrator**: Full access to all modules, including User Management.
- **Flight Operator**: Can schedule flights, manage aircraft/pilots/routes, report emergencies, and view reports.
- **Pilot**: Can view assigned flights, report emergencies, and read alerts.

## Testing
- Unit tests are omitted for this academic demo.
- Manual testing covers role-based routing, form validation, availability checks during scheduling, cascading status updates, and RLS enforcement.

## Future Improvements
- Real-time updates using Supabase Realtime subscriptions.
- Interactive route map visualization.
- Email notifications via Edge Functions.
