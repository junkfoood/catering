import { Metadata } from "next";
import { api } from "~/trpc/server";
import CaterersDisplay from "./_components/caterers-display";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "See GovTech Products",
};

export default async function LandingPage() {
	const caterers = await api.caterer.getCaterers();
	const restrictedAreas = await api.caterer.getRestrictedAreas();

	return (
		<CaterersDisplay caterers={caterers} restrictedAreas={restrictedAreas} />
	);
}
