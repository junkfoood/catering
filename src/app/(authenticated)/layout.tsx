import { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { auth } from "~/server/auth";
import { Suspense } from "react";

// Force dynamic rendering since we use auth() which accesses headers
export const dynamic = 'force-dynamic';

function LoadingFallback() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
				<p className="text-sm text-gray-600">Loading...</p>
			</div>
		</div>
	);
}

export default async function NestedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	if (!session) {
		unauthorized();
	}

	return (
		<Suspense fallback={<LoadingFallback />}>
			{children}
		</Suspense>
	);
}
