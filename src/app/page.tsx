"use client";

export const dynamic = "force-dynamic";

import { PageShell } from "@components/ui/page-shell";
import { ClientAuthRedirect } from "./_components/client-auth-redirect";
import SplitText from "./_components/ui/split-text";

export default function LandingPage() {
	return (
		<PageShell
			body={
				<>
					<ClientAuthRedirect />
					<div className="relative flex min-h-[400px] sm:h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg px-4">
					<SplitText
						text="Welcome to (W)here's (t)he (F)ood!"
						className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-center mb-4 sm:mb-8 leading-tight"
						delay={50}
						duration={0.4}
						ease="power2.out"
						splitType="chars"
						from={{ opacity: 0, y: 20 }}
						to={{ opacity: 1, y: 0 }}
						threshold={0.2}
						rootMargin="-50px"
						textAlign="center"
						tag="h1"
						onLetterAnimationComplete={() => console.log('All letters have animated!')}
					/>
					</div>


				</>
			}
		/>
	);
}
