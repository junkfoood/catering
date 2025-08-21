import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "~/app/_components/ui/page-shell";
import { api } from "~/trpc/server";
import { routeFormatter, routes } from "~/utils/route";
import { auth } from "~/server/auth";
import CatererDisplay from "./_components/caterer-display";
import { HeaderBreadcrumb } from "~/app/_components/custom/header-breadcrumb";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ catererID: string }>;
}): Promise<Metadata> {
	const { catererID } = await params;
	const caterer = await api.caterer.getCaterer({
		id: decodeURIComponent(catererID),
	});

	if (!caterer) {
		return {
			title: "Caterer Not Found",
			description: "The requested caterer could not be found.",
		};
	}

	return {
		title: `${caterer.name} (${caterer.id})`,
		description: `View caterer ${caterer.name} with ${caterer.id}. Manage menus, track caterer status, and oversee caterer allocations.`,
	};
}

export default async function CatererPage({
	params,
	searchParams,
}: {
	params: Promise<{ catererID: string }>;
	searchParams: Promise<{ menu?: string }>;
}) {
	const { catererID } = await params;
	const { menu: menuId } = await searchParams;
	const caterer = await api.caterer.getCaterer({
		id: decodeURIComponent(catererID),
	});

	if (!caterer) {
		notFound();
	}

	return (
		<PageShell
			header={
				<HeaderBreadcrumb
					breadcrumbs={[
						routes.dashboard,
						{
							label: caterer.name,
							link: routeFormatter.caterer(caterer),
						},
					]}
				/>
			}
			body={
				<div className="flex flex-col gap-8 grow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground">{caterer.id}</p>
							<div className="flex items-center gap-2">
								<h1 className="text-3xl font-bold">{caterer.name}</h1>
							</div>
						</div>
					</div>
					<CatererDisplay caterer={caterer} initialMenuId={menuId} />
				</div>
			}
		/>
	);
}
