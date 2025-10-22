# CIOO NextJS Template

A comprehensive catering management system built for government agencies to browse, compare, and manage catering services. The system provides detailed menu information, pricing calculations, and streamlined procurement processes.

## Tech Stack

- [NextJS 15](https://nextjs.org/) + Turbopack

**Frontend**

- [shadcn/ui](https://ui.shadcn.com/) (UI System)
- [Tailwind CSS V4](https://tailwindcss.com/) (CSS Styling)

**Backend**

- [AuthJS V5](https://authjs.dev/) ([TechPass](https://https://portal.techpass.gov.sg/) - EntraID)
- [sgID](https://github.com/opengovsg/mockpass) (Mock Login on Mockpass)
- [Prisma](https://www.prisma.io/) (ORM to control the Postgres DB)
- [tRPC V11](https://trpc.io/) (For handling server calls)
- [Zod](https://zod.dev/) (Validation)
- [T3 Env](https://github.com/t3-oss/t3-env) (Typed Env Validation)
- [Playwright](https://playwright.dev/) (E2E Tests)

**Hosting**

- [Vercel](https://vercel.com) (For hosting the NextJS app)
- [Supabase](https://supabase.com) (For hosting the Postgres DB with real-time features)

**Useful Libraries**
- [argon2](https://github.com/ranisalt/node-argon2) (For hashing verification)
- [Amplitude](amplitude/analytics-browser) (For user activity tracking)
- [Biome](https://biomejs.dev/) (Formatter and Linter - replaces ESlint & Prettier)
- [Lucide](https://lucide.dev/) (For icons)
- [Luxon](https://moment.github.io/luxon/#/) (For date manipulation with good timezone support)
- [Papaparse](https://www.papaparse.com/docs) (For CSV parsing)
- [Radash](https://radash-docs.vercel.app/docs/getting-started) (For utility functions)
- [React Hook Form](https://react-hook-form.com/) (For forms, used as part of shadcn)
- [Scalar](https://scalar.com/) (For API Documentation)

## Features

### Menu Browsing & Search
- **Dual Search Options**: Free text search and dropdown selection of all caterers
- **Advanced Filtering**: Filter by budget range, menu categories, and delivery restrictions
- **Alphabetical Sorting**: All caterers and menus are sorted alphabetically for easy navigation
- **Infinite Scroll**: Seamless loading of additional menu packages

### Detailed Menu Information
- **Comprehensive Pricing**: Real-time calculation including subtotal, discounts, delivery fees, and admin fees
- **Flexible Admin Fee**: Optional 1.5% admin fee toggle for different procurement requirements
- **Delivery Options**: Support for various delivery scenarios including CBD, odd hours, and lift access
- **Menu Categories**: Support for different catering types (buffets, packed meals, ethnic food, etc.)

### Comparison & Selection
- **Side-by-side Comparison**: Compare multiple caterers and menu packages
- **Detailed Breakdown**: Complete pricing breakdown with itemized costs
- **AOR Generation**: Automated generation of Authority to Order Request (AOR) documents

### User Management
- **Role-based Access**: Different access levels for users and administrators
- **Authentication**: Secure login with TechPass integration
- **User Management**: Admin interface for managing user roles and permissions

## Getting Started

To get started with the Catering Management System, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `pnpm install`.
3. Duplicate the `.env.example` file to an `.env` file in the root directory of the project. You can ask any existing devs for the required API keys for AWS & Techpass
4. Create your own PostgresDB:
   - We recommend creating one at [Supabase](https://supabase.com)
   - Copy the Connection String from your Supabase project settings
   - Paste the Connection String into the `.env` file as `DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<database>"`
5. Set Up your Postgres DB using Prisma ORM
    - Edit the `prisma.schema` file as you need. 
    - Create a migration by running `npx prisma migrate dev`.
    - Deploy a migration by running `npx prisma migrate deploy`. 
    - Reset your DB, run all migrations, and seed the database by running `npx prisma migrate reset`
        - Seeding is automatically done using `prisma.seed.ts`
6. Run the development server by running `pnpm dev`.
7. Login to the system
   - Use "Login with sgID" - we are using Mockpass and `Lim Yong Xiang` is the admin
   - For Techpass, you will need to run `pnpm dev --experimental-https` instead, and connect to `https://localhost:3000`

## Recent Updates

### Search & Navigation Improvements
- **Enhanced Search Interface**: Added toggle between free text search and dropdown selection
- **Alphabetical Ordering**: Implemented database-level sorting for consistent alphabetical ordering
- **Improved Performance**: Fixed infinite re-rendering issues and console errors

### Pricing & Calculation Features
- **Admin Fee Toggle**: Added optional 1.5% admin fee with user-controlled toggle (default: unchecked)
- **Real-time Calculations**: Dynamic pricing updates based on user selections
- **Comprehensive Breakdown**: Detailed itemized pricing with delivery options and surcharges

### User Experience Enhancements
- **Tooltip Information**: Added helpful tooltips for AOR reference information
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Error Handling**: Improved error handling and loading states

## Directory Structure

```
|- e2e - Playwright E2E tests
|
|- prisma - Prisma schema & migrations
|   |- seed-data - Prisma seed data
|   |- schema.prisma - Prisma schema
|   |- seed.ts - Mock Data Seed Script
|   |- seed-prod.ts - Prod Data Seed Script
|
|- src
|   |- app - NextJS App Router
|   |   |- _components - NextJS Components
|   |   |- (authenticated) - All routes for authenticated users
|   |   |   |- menu - Menu browsing and search
|   |   |   |- caterer - Individual caterer details
|   |   |   |- comparison - Menu comparison tool
|   |   |- (admin) - All routes for admin users
|   |   |- page.tsx - Entrypoint into the app
|   |
|   |- components - Rich Text Editor
|   |- schema - Zod Schemas
|   |- server - NextJS Server
|   |   |- api - NextJS API Routes
|   |   |   |- routers - tRPC API Routers
|   |   |   |   |- caterer.ts - Caterer data and pagination
|   |   |   |   |- user.ts - User management
|   |   |   |- root.ts - tRPC API Root
|   |   |- auth - AuthJS Config
|   |   |- db.ts - Prisma Client
|   |
|   |- styles - TailwindCSS Styles
|   |- trpc - TRPC Client
|   |- server - NextJS Server
|   |- utils
|   |   |- permissions - Permission Check Utils
|   |   |- validation - Validation Check Utils
|   |   |- format.ts - Formatting Utils
|   |   |- route.ts - All Route References
|   |   |- utils.ts - All Misc Utils
|   |
|   |- env.ts - T3 Env Validation
```

## Deployment

You need the following environment variables on:
* Vercel
    * Copy your `.env` file into Vercel's Environment Variables