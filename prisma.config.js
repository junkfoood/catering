export default {
  seeds: {
    default: "npx tsx -r tsconfig-paths/register prisma/seed.ts",
    prod: "npx tsx -r tsconfig-paths/register prisma/seed-prod.ts"
  }
};