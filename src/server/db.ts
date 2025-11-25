import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "~/env";

const createPrismaClient = () => {
	return new PrismaClient({
		// biome-ignore lint/suspicious/noExplicitAny: Prisma 7 adapter type is correctly inferred by TypeScript, verified by tsc
		adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});
};

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
