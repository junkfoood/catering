import type { Metadata } from "next";
import { api } from "~/trpc/server";
import CatererDirectoryDisplay from "./_components/caterer-directory-display";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: "Caterer Directory",
	description: "Browse all caterers and view their PDFs",
};

export default async function CatererDirectoryPage() {
	try {
		const caterers = await api.caterer.getCaterers();
		return (
			<CatererDirectoryDisplay caterers={caterers} />
		);
	} catch (error: any) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("Caterer Directory error:", errorMessage);
		return (
			<div style={{ color: "red", padding: 32 }}>
				<h1>Caterer Directory Error</h1>
				<p>An error occurred while loading the page. Please try again later.</p>
				{errorMessage !== "Unknown error" && (
					<p className="text-sm mt-2">Error: {errorMessage}</p>
				)}
			</div>
		);
	}
}

