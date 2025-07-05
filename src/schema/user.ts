import { z } from "zod/v4";

export const userSchema = z.object({
	id: z.string().optional(),
	email: z.email(),
	name: z.string().min(1, "Must key in name"),
});
