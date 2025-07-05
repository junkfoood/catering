import { chainMiddleware } from "./middlewares/chain";
import { withCSP } from "./middlewares/with-csp";

// Chain the middlewares together
export const middleware = chainMiddleware([withCSP]);

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		{
			source: "/((?!_next/static|_next/image|favicon.ico).*)",
		},
	],
};
