import { PageShell } from "@components/ui/page-shell";
import { redirect } from "next/navigation";
import { AuroraText } from "~/app/_components/ui/magicui/aurora-text";
import { auth } from "~/server/auth";
import { routes } from "~/utils/route";

// Skip env validation for debugging
process.env.SKIP_ENV_VALIDATION = "true";

export default async function LandingPage() {
	try {
		const session = await auth();

		if (session) {
			redirect(routes.dashboard.link);
		}
	} catch (error) {
		console.error('Auth error:', error);
		// Continue to show the landing page even if auth fails
	}

	return (
		<PageShell
			body={
				<div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
					<h1 className="text-4xl mb-8 font-bold tracking-tighter md:text-5xl lg:text-7xl z-10">
						Welcome to <AuroraText>Cater Compare</AuroraText>
					</h1>
				</div>
			}
		/>
	);
}
