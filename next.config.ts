import { NextConfig } from "next";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env";

const config: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "j0pwuvoglzve8yok.public.blob.vercel-storage.com",
				port: "",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "https",
				hostname: "lkyo0ehvrpkhhtwe.public.blob.vercel-storage.com",
				port: "",
				pathname: "/**",
				search: "",
			},
		],
	},
	experimental: {
		authInterrupts: true,
		scrollRestoration: true,
	},
};

export default config;
