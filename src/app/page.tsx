export const dynamic = "force-dynamic";

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
					<h1 className="text-4xl mb-8 font-bold md:text-5xl lg:text-7xl z-10 flex space-x-10">
  					<span><strong>(W)</strong>here's</span>
  					<span><strong>(t)</strong>he</span>
  					<span><strong>(F)</strong>ood</span>
					</h1>
					</div>
				</>
			}
		/>
	);
}
