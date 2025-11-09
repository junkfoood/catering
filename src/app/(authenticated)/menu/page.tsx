import type { Metadata } from "next";
import { api } from "~/trpc/server";
import CaterersDisplay from "./_components/caterers-display";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: "Menus",
	description: "See Caterers Menus",
};

export default async function LandingPage() {
  try {
    // Load only the first 6 caterers initially to prevent timeout
    const initialData = await api.caterer.getCaterersPaginated({ skip: 0, take: 6 });
    return (
      <CaterersDisplay 
        initialCaterers={initialData.caterers} 
        totalCaterers={initialData.total}
        hasMore={initialData.hasMore}
      />
    );
  } catch (error: any) {
    // Log error without exposing sensitive data
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Dashboard error:", errorMessage);
    return (
      <div style={{ color: "red", padding: 32 }}>
        <h1>Dashboard Error</h1>
        <p>An error occurred while loading the page. Please try again later.</p>
        {errorMessage !== "Unknown error" && (
          <p className="text-sm mt-2">Error: {errorMessage}</p>
        )}
      </div>
    );
  }
}
