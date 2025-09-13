import type { Prisma } from "@prisma/client";

export const DateTimeFormats = {
	month: "LLL",
	shortDate: "d LLL",
	fullDate: "d LLL y",
	dateTime: "d LLL y, h:mma",
	parse: {
		csv: "L/d/y",
	},
};

export const formatText = {};

export const properCase = (name: string) => {
	return name
		.split(" ")
		.filter((word) => word)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export const displayName = (
	user?: Prisma.UserGetPayload<{
		select: {
			name: true;
			email: true;
		};
	}> | null,
) => `${user?.name ? properCase(user?.name) : user?.email}`;
