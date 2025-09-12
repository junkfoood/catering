"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { routes } from "~/utils/route";

export function ClientAuthRedirect() {
	const router = useRouter();
	const { data, status } = useSession();
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (status === "authenticated" && data && !isRedirecting) {
			setIsRedirecting(true);
			
			// Add a small delay to ensure auth state is fully initialized
			const timer = setTimeout(() => {
				// Use hard reload to ensure session is available
				window.location.href = routes.menu.link;
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [data, status, router, isRedirecting]);

	if (status === "loading" || isRedirecting) {
		return (
			<div className="w-full text-center py-8">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
					<p className="text-sm text-gray-600">
						{isRedirecting ? "Redirecting..." : "Loading..."}
					</p>
				</div>
			</div>
		);
	}

	return null;
} 