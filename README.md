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
- **Backend & Database**: LocalStorage Mock Backend (Zero configuration required)
- **Deployment**: Vercel

## System Architecture
The application follows a client-side architecture where the React frontend communicates with a simulated database wrapper (`src/lib/localDb.js`) that reads and writes from the browser's `localStorage`. This allows the application to run entirely in the browser without any external backend dependencies while still persisting data across page reloads.

## Project Structure
- `src/components/`: Reusable UI components (buttons, modals, tables)
- `src/context/`: React context for Authentication and Toast notifications
- `src/layouts/`: Dashboard layout with sidebar navigation
- `src/lib/`: LocalStorage database wrapper (`localDb.js`)
- `src/pages/`: Feature pages organized by module (auth, dashboard, flights, etc.)
- `src/routes/`: Route definitions and role-based guards
- `src/services/`: Data access layer that interacts with the local database
- `src/utils/`: Helper functions (formatting, validation, CSV export)

## Local Development
To run this project locally, simply install the dependencies and start the development server:

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
2. Vercel will automatically build and deploy. No environment variables are required!

## User Roles & Login
The application uses a Mock Login system for easy demonstration. You do not need to register an account. Instead, simply select the role you want to demonstrate on the login page:
- **Administrator**: Full access to all modules, including User Management.
- **Flight Operator**: Can schedule flights, manage aircraft/pilots/routes, report emergencies, and view reports.
- **Pilot**: Can view assigned flights, report emergencies, and read alerts.

## Testing
- Unit tests are omitted for this academic demo.
- Manual testing covers role-based routing, form validation, availability checks during scheduling, cascading status updates, and local storage persistence.

## Factory Reset
If you need to reset the application data back to its original state (e.g., before a presentation), you can clear the browser's Local Storage:
1. Open Developer Tools (F12)
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Under **Local Storage**, right-click the domain and click **Clear**
4. Refresh the page to reload the seed data.
