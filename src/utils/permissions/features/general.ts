import { type User, UserRole } from "@prisma/client";
import { isAdmin } from "..";

export const generalPermissions = {
	activated: ({ user }: { user: User }) => user.activated,
	admin: ({ user }: { user?: User }) => isAdmin(user),
	management: ({ user }: { user?: User }) =>
		isAdmin(user) || user?.role === UserRole.MANAGEMENT,
};
