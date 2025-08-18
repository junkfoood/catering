import type { Prisma } from "@prisma/client";
import z from "zod/v4";
import { activeUserProcedure, createTRPCRouter } from "~/server/api/trpc";

export const catererRouter = createTRPCRouter({
	getCaterers: activeUserProcedure.query(async ({ ctx }) => {
		return await ctx.db.caterer.findMany({
			include: includeCatererListData,
		});
	}),
	getCaterer: activeUserProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.caterer.findUnique({
				where: { id: input.id },
				include: includeCatererData,
			});
		}),
	getRestrictedAreas: activeUserProcedure.query(async ({ ctx }) => {
		return await ctx.db.restrictedArea.findMany();
	}),
});

export const includeCatererListData = {
	menus: {
		include: {
			restrictedAreas: true,
		},
	},
} satisfies Prisma.CatererInclude;

export type CatererListData = Prisma.CatererGetPayload<{
	include: typeof includeCatererListData;
}>;

export const includeCatererMenuData = {
	sections: {
		include: {
			items: true,
		},
	},
	restrictedAreas: true,
} satisfies Prisma.CatererMenuInclude;

export type CatererMenuData = Prisma.CatererMenuGetPayload<{
	include: typeof includeCatererMenuData;
}>;

export const includeCatererData = {
	menus: {
		include: includeCatererMenuData,
	},
} satisfies Prisma.CatererInclude;

export type CatererData = Prisma.CatererGetPayload<{
	include: typeof includeCatererData;
}>;
