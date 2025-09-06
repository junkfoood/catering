import { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { auth } from "~/server/auth";

// Force dynamic rendering since we use auth() which accesses headers
export const dynamic = 'force-dynamic';

export default async function NestedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	if (!session) {
		unauthorized();
	}

	return children;
}
