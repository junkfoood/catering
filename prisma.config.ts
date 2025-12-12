import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		"Missing required environment variable: DATABASE_URL. Please ensure it is set in your .env file or environment.",
	);
}

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: databaseUrl,
	},
	migrations: {
		seed: "tsx -r tsconfig-paths/register prisma/seed.ts",
	},
});

