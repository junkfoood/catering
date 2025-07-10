import { type User, UserRole } from "@prisma/client";
import { isAdmin } from "..";

export const generalPermissions = {
	activated: ({ user }: { user: User }) => user.activated,
	admin: ({ user }: { user?: User }) => isAdmin(user),
};
