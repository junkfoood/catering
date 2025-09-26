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
			
			// Use router.push instead of window.location.href to avoid hard reload
			// and potential redirect loops
			const timer = setTimeout(() => {
				router.push(routes.menu.link);
			}, 500); // Reduced delay

			return () => clearTimeout(timer);
		}
	}, [data, status, router, isRedirecting]);

	// Only show loading if we're actually loading or redirecting
	if (status === "loading") {
		return (
			<div className="w-full text-center py-8">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
					<p className="text-sm text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Show redirecting only when we're actually redirecting
	if (isRedirecting) {
		return (
			<div className="w-full text-center py-8">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
					<p className="text-sm text-gray-600">Redirecting...</p>
				</div>
			</div>
		);
	}

	return null;
} 