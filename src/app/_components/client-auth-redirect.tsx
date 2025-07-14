"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { routes } from "~/utils/route";

export function ClientAuthRedirect() {
	const router = useRouter();
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "authenticated" && session) {
			router.push(routes.dashboard.link);
		}
	}, [session, status, router]);

	return null;
} 