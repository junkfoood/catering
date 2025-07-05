/* eslint-disable no-undef */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

const booleanStringSchema = z.preprocess((value) => {
	if (!value) return false;
	if (typeof value === "boolean") return value;
	if (value === "true") {
		return true;
	} else if (value === "false") {
		return false;
	} else {
		throw new Error(`The string must be 'true' or 'false'`);
	}
}, z.boolean());

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z
			.url()
			.refine(
				(str) => !str.includes("YOUR_MYSQL_URL_HERE"),
				"You forgot to change the default URL",
			),
		NODE_ENV: z
			.enum(["development", "test", "production"] as const)
			.default("development"),
		AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string().min(1)
				: z.string().min(1).optional(),
		APP_PROTOCOL: z
			.enum(["http", "https"] as const)
			.optional()
			.default("https"),
		APP_URL: z.string().optional(),
		VERCEL_URL: z.string().optional().default("localhost:3000"),
		SGID_CLIENT_ID: z.string().min(1),
		SGID_CLIENT_SECRET: z.string().min(1),
		SGID_OPENID_CONFIG: z.union([z.string().url(), z.string()]).optional(),
		SGID_HOSTNAME: z.union([z.string().url(), z.string()]).optional(),
		// Remember to set SGID redirect URI in SGID dev portal.
		SGID_REDIRECT_URI: z.union([z.string().url(), z.string()]).optional(),
		SGID_PRIVATE_KEY: z.string().min(1),
		LOG_QUERY: booleanStringSchema.optional().default(false),
		AUTH_TECHPASS_DIRECTORY_ID:
			process.env.NODE_ENV === "production"
				? z.string().min(1)
				: z.string().min(1).optional(),
		AUTH_TECHPASS_APPLICATION_ID:
			process.env.NODE_ENV === "production"
				? z.string().min(1)
				: z.string().min(1).optional(),
		AUTH_TECHPASS_SECRET:
			process.env.NODE_ENV === "production"
				? z.string().min(1)
				: z.string().min(1).optional(),
		FEATURE_FLAG_MOCKPASS: booleanStringSchema.optional().default(false),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		APP_PROTOCOL: process.env.APP_PROTOCOL,
		APP_URL: process.env.APP_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		AUTH_SECRET: process.env.AUTH_SECRET,
		VERCEL_URL: process.env.VERCEL_URL,
		SGID_CLIENT_ID: process.env.SGID_CLIENT_ID,
		SGID_OPENID_CONFIG: process.env.SGID_OPENID_CONFIG,
		SGID_HOSTNAME: process.env.SGID_HOSTNAME,
		SGID_CLIENT_SECRET: process.env.SGID_CLIENT_SECRET,
		SGID_PRIVATE_KEY: process.env.SGID_PRIVATE_KEY,
		SGID_REDIRECT_URI: process.env.SGID_REDIRECT_URI,
		LOG_QUERY: process.env.LOG_QUERY,
		AUTH_TECHPASS_DIRECTORY_ID: process.env.AUTH_TECHPASS_DIRECTORY_ID,
		AUTH_TECHPASS_APPLICATION_ID: process.env.AUTH_TECHPASS_APPLICATION_ID,
		AUTH_TECHPASS_SECRET: process.env.AUTH_TECHPASS_SECRET,
		FEATURE_FLAG_MOCKPASS: process.env.FEATURE_FLAG_MOCKPASS,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
