"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { routes } from "~/utils/route";

export function ClientAuthRedirect() {
	const router = useRouter();
	const { data, status } = useSession();

	useEffect(() => {
		if (status === "authenticated" && data) {
			// Use hard reload to ensure session is available
			window.location.href = routes.dashboard.link;
		}
	}, [data, status, router]);

	if (status === "loading") {
		return <div className="w-full text-center py-8">Loading...</div>;
	}

	return null;
} 