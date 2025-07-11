import { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { auth } from "~/server/auth";

export default async function NestedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	if (!session) {
		unauthorized();
	}

	return children;
}
