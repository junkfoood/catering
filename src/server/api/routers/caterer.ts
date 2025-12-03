import type { Prisma } from "@prisma/client";
import z from "zod/v4";
import { activeUserProcedure, createTRPCRouter } from "~/server/api/trpc";

export const catererRouter = createTRPCRouter({
	getCaterers: activeUserProcedure.query(async ({ ctx }) => {
		return await ctx.db.caterer.findMany({
			include: includeCatererData,
			orderBy: {
				name: 'asc',
			},
		});
	}),
	getCaterersPaginated: activeUserProcedure
		.input(
			z.object({
				skip: z.number().default(0),
				take: z.number().default(5),
			}),
		)
		.query(async ({ ctx, input }) => {
			const [caterers, total] = await Promise.all([
				ctx.db.caterer.findMany({
					skip: input.skip,
					take: input.take,
					include: includeCatererDataLightweight, // Use lightweight version without sections/items
					orderBy: {
						name: 'asc',
					},
				}),
				ctx.db.caterer.count(),
			]);
			

			
			return {
				caterers,
				total,
				hasMore: input.skip + input.take < total,
			};
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
	getCaterersForDropdown: activeUserProcedure.query(async ({ ctx }) => {
		// Lightweight query for dropdown - only basic caterer info
		return await ctx.db.caterer.findMany({
			select: {
				id: true,
				name: true,
				_count: {
					select: {
						menus: true,
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		});
	}),
	getCaterersPaginatedWithSections: activeUserProcedure
		.input(
			z.object({
				skip: z.number().default(0),
				take: z.number().default(5),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Full data with sections for comparison page
			const [caterers, total] = await Promise.all([
				ctx.db.caterer.findMany({
					skip: input.skip,
					take: input.take,
					include: includeCatererData, // Full include with sections/items
					orderBy: {
						name: 'asc',
					},
				}),
				ctx.db.caterer.count(),
			]);
			
			return {
				caterers,
				total,
				hasMore: input.skip + input.take < total,
			};
		}),
});

export type CatererListData = Prisma.CatererGetPayload<{
	include: typeof includeCatererDataLightweight;
}>;

export const includeCatererMenuData = {
	sections: {
		include: {
			items: {
				orderBy: {
					order: "asc",
				},
			},
		},
		orderBy: {
			order: "asc",
		},
	},
} satisfies Prisma.CatererMenuInclude;

export type CatererMenuData = Prisma.CatererMenuGetPayload<{
	include: typeof includeCatererMenuData;
}>;

// Lightweight include for menu listings - excludes sections and items for faster loading
export const includeCatererDataLightweight = {
	menus: true, // Only include menus without nested sections/items
} satisfies Prisma.CatererInclude;

export const includeCatererData = {
	menus: {
		include: includeCatererMenuData,
	},
} satisfies Prisma.CatererInclude;

export type CatererData = Prisma.CatererGetPayload<{
	include: typeof includeCatererData;
}>;
