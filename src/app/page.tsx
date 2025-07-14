import { PageShell } from "@components/ui/page-shell";
import { AuroraText } from "~/app/_components/ui/magicui/aurora-text";
import { ClientAuthRedirect } from "./_components/client-auth-redirect";

export default function LandingPage() {
	return (
		<PageShell
			body={
				<>
					<ClientAuthRedirect />
					<div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
						<h1 className="text-4xl mb-8 font-bold tracking-tighter md:text-5xl lg:text-7xl z-10">
							Welcome to <AuroraText>Catering Compare</AuroraText>
						</h1>
					</div>
				</>
			}
		/>
	);
}
