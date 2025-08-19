import type { Prisma } from "@prisma/client";
import z from "zod/v4";
import { activeUserProcedure, createTRPCRouter } from "~/server/api/trpc";

export const catererRouter = createTRPCRouter({
	getCaterers: activeUserProcedure.query(async ({ ctx }) => {
		return await ctx.db.caterer.findMany({
			include: includeCatererData,
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
		getAllRestrictedAreas: activeUserProcedure.query(async ({ ctx }) => {
			// Fetch only the restrictedAreas field from all menus
			const menus = await ctx.db.catererMenu.findMany({
			  select: { restrictedAreas: true }
			});
			// Flatten and deduplicate
			const allAreas = Array.from(
			  new Set(menus.flatMap(menu => menu.restrictedAreas))
			);
			return allAreas;
		  }),
});

export type CatererListData = Prisma.CatererGetPayload<{
	include: typeof includeCatererData;
}>;

export const includeCatererMenuData = {
	sections: {
		include: {
			items: true,
		},
	},
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
