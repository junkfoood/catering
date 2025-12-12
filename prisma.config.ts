import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: process.env.DATABASE_URL,
	},
	migrations: {
		seed: "tsx -r tsconfig-paths/register prisma/seed.ts",
	},
});

