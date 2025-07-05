import { PageShell } from "@components/ui/page-shell";
import { forbidden, unauthorized } from "next/navigation";
import { auth } from "~/server/auth";
import { permissions } from "~/utils/permissions/index";

export default async function NestedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	if (!session) {
		unauthorized();
	}

	if (!permissions.general.admin({ user: session?.user })) {
		forbidden();
	}

	return children;
}
