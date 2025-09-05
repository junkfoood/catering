import type { NextFetchEvent, NextRequest } from "next/server";

import { env } from "~/env";
import type { MiddlewareFactory } from "./types";

export const withCSP: MiddlewareFactory = (next) => {
	return async (request: NextRequest, event: NextFetchEvent) => {
		// In development env, skip CSP headers

		if (env.NODE_ENV === "development") {
			return next(request, event);
		}

		const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
		//style-src: 'unsafe-inline' required for shadcn + tailwind
		const cspHeader = request.nextUrl.pathname.includes("/openapi")
			? `
          default-src 'self' unpkg.com;
          script-src 'self' cdn.jsdelivr.net 'unsafe-eval' https: 'unsafe-inline';
          style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com unpkg.com;
          img-src 'self' cdn.jsdelivr.net blob: data: *.blob.vercel-storage.com;
          connect-src 'self' *.blob.vercel-storage.com *.amplitude.com;
          font-src 'self' fonts.gstatic.com data:;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        `
			: `
          default-src 'self';
          script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
          style-src 'self' 'unsafe-inline' fonts.googleapis.com;
          img-src 'self' blob: data: *.blob.vercel-storage.com;
          connect-src 'self' *.blob.vercel-storage.com *.amplitude.com;
          font-src 'self' fonts.gstatic.com;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        `;
		// Replace newline characters and spaces
		const contentSecurityPolicyHeaderValue = cspHeader
			.replace(/\s{2,}/g, " ")
			.trim();

		request.headers.set("x-nonce", nonce);
		request.headers.set(
			"Content-Security-Policy",
			contentSecurityPolicyHeaderValue,
		);

		const response = await next(request, event);

		response.headers.set(
			"Content-Security-Policy",
			contentSecurityPolicyHeaderValue,
		);
		response.headers.set("X-Frame-Options", "SAMEORIGIN");
		response.headers.set("X-Content-Type-Options", "nosniff");
		return response;
	};
};
