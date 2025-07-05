import { type User, UserRole } from "@prisma/client";
import { generalPermissions } from "./features/general";

export const isAdmin = (user?: User) => {
	if (!user) {
		return false;
	}

	return user.role === UserRole.ADMIN;
};

export const permissions = {
	general: generalPermissions,
};
