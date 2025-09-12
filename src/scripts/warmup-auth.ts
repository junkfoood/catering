#!/usr/bin/env tsx

/**
 * Script to warm up the authentication service
 * This can be run during deployment or startup to prevent configuration errors
 */

import { warmupAuth } from "../server/auth/warmup";

async function main() {
	console.log("Starting authentication service warmup...");
	
	try {
		await warmupAuth();
		console.log("✅ Authentication service warmup completed successfully");
		process.exit(0);
	} catch (error) {
		console.error("❌ Authentication service warmup failed:", error);
		process.exit(1);
	}
}

// Run the warmup
main();
