import { UserRole } from "@prisma/client";
import { z } from "zod/v4";
import { userSchema } from "~/schema/user";
import {
	activeUserProcedure,
	adminUserProcedure,
	createTRPCRouter,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
	getAll: activeUserProcedure.query(async ({ ctx }) => {
		return ctx.db.user.findMany({
			orderBy: {
				name: "asc",
			},
		});
	}),
	upsert: activeUserProcedure
		.input(userSchema)
		.mutation(async ({ ctx, input: { id, name, email } }) => {
			return ctx.db.user.upsert({
				create: {
					name,
					email: email.toLowerCase(),
				},
				update: {
					name,
					email: email.toLowerCase(),
				},
				where: {
					id: id ?? "-",
				},
			});
		}),
	updateRole: adminUserProcedure
		.input(
			z.object({
				id: z.string(),
				role: z.nativeEnum(UserRole),
			}),
		)
		.mutation(async ({ ctx, input: { id, role } }) => {
			return ctx.db.user.update({
				data: {
					role,
				},
				where: {
					id: id ?? "-",
				},
			});
		}),
});
