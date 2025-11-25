import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"),
	},
	migrations: {
		seed: "tsx -r tsconfig-paths/register prisma/seed.ts",
	},
});

