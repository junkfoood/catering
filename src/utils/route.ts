import type { Caterer, User } from "@prisma/client";

export interface Route {
	label?: string;
	link: string;
	auth?: (user: User) => boolean;
}

export interface NestedRoute {
	label: string;
	link?: string;
	auth?: (user: User) => boolean;
	routes: Route[];
}

export const routes = {
	anonDashboard: {
		label: "Dashboard",
		link: "/",
	},
	menu: {
		label: "Menus",
		link: "/menu",
	},
	chatbot: {
		label: "Menu Advisor",
		link: "/chatbot",
	},
	comparison: {
		label: "Comparison",
		link: "/comparison",
	},
	api: {
		reference: {
			label: "API Reference",
			link: "/api/v1/openapi",
		},
	},
};

export const routeFormatter = {
	caterer: (caterer: Caterer, menuId?: string) => 
		menuId ? `/caterer/${caterer.id}?menu=${menuId}` : `/caterer/${caterer.id}`,
};
