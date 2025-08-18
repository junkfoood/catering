import { Metadata } from "next";
import { api } from "~/trpc/server";
import CaterersDisplay from "./_components/caterers-display";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "See GovTech Products",
};

export default async function LandingPage() {
  try {
    const caterers = await api.caterer.getCaterers();
    const restrictedAreas = await api.caterer.getRestrictedAreas();
    return (
      <CaterersDisplay caterers={caterers} restrictedAreas={restrictedAreas} />
    );
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return (
      <div style={{ color: "red", padding: 32 }}>
        <h1>Dashboard Error</h1>
        <pre>{error?.message || JSON.stringify(error)}</pre>
      </div>
    );
  }
}
