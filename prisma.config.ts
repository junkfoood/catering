import { defineConfig } from '@prisma/internals';

export default defineConfig({
  seeds: {
    default: 'npx tsx -r tsconfig-paths/register prisma/seed.ts',
    prod: 'npx tsx -r tsconfig-paths/register prisma/seed-prod.ts',
  },
});
