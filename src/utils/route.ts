import { Caterer, User } from "@prisma/client";
import { permissions } from "./permissions";

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
	dashboard: {
		label: "Dashboard",
		link: "/dashboard",
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
