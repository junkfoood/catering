import { auth } from "./index";

let isWarmedUp = false;
let warmupPromise: Promise<void> | null = null;

/**
 * Warm up the authentication service to prevent configuration errors
 * This should be called early in the application lifecycle
 */
export async function warmupAuth(): Promise<void> {
	if (isWarmedUp) {
		return;
	}

	if (warmupPromise) {
		return warmupPromise;
	}

	warmupPromise = (async () => {
		try {
			console.log("Warming up authentication service...");
			
			// Add a delay to ensure all auth providers are initialized
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Try to get the auth instance to ensure it's properly initialized
			await auth();
			
			isWarmedUp = true;
			console.log("Authentication service warmed up successfully");
		} catch (error) {
			console.error("Failed to warm up authentication service:", error);
			// Don't throw the error, just log it
		}
	})();

	return warmupPromise;
}

/**
 * Check if the auth service has been warmed up
 */
export function isAuthWarmedUp(): boolean {
	return isWarmedUp;
}
