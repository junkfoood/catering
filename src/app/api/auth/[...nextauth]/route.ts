import { handlers } from "~/server/auth";
import { warmupAuth } from "~/server/auth/warmup";

// Warm up auth service when the auth route is accessed
warmupAuth().catch(console.error);

export const { GET, POST } = handlers;
