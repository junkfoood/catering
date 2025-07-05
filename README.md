# CIOO NextJS Template

The CIOO NextJS Template is a comprehensive ...

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
- [Neon](https://neon.tech) (For hosting the Postgres DB with Branching)

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

## Getting Started

To get started with the CIOO NextJS Template, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `pnpm install`.
3. Duplicate the `.env.example` file to an `.env` file in the root directory of the project. You can ask any existing devs for the required API keys for AWS & Techpass
4. Create your own PostgresDB:
   - We recommend creating one at [Neon](https://neon.tech)
   - Copy the Connection String
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
|   |   |- (activated) - All routes for activated users
|   |   |- (admin) - All routes for admin users
|   |   |- page.tsx - Entrypoint into the app
|   |
|   |- components - Rich Text Editor
|   |- schema - Zod Schemas
|   |- server - NextJS Server
|   |   |- api - NextJS API Routes
|   |   |   |- routers - tRPC API Routers
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