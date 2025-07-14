"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { routes } from "~/utils/route";

export function ClientAuthRedirect() {
	const router = useRouter();
	const sessionResult = useSession();
	const data = sessionResult?.data;
	const status = sessionResult?.status;

	useEffect(() => {
		if (status === "authenticated" && data) {
			router.push(routes.dashboard.link);
		}
	}, [data, status, router]);

	return null;
} 