import type { Metadata } from "next";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import PdfViewer from "./_components/pdf-viewer";
import type { Caterer } from "@prisma/client";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ catererId: string }>;
}): Promise<Metadata> {
	const { catererId } = await params;
	try {
		const caterer = await api.caterer.getCaterer({ id: catererId });
		if (!caterer) {
			return {
				title: "Caterer PDF",
			};
		}
		return {
			title: `${caterer.name} - PDF`,
			description: `View PDF for ${caterer.name}`,
		};
	} catch {
		return {
			title: "Caterer PDF",
		};
	}
}

export default async function CatererPdfPage({
	params,
}: {
	params: Promise<{ catererId: string }>;
}) {
	const { catererId } = await params;
	
	try {
		const caterer = await api.caterer.getCaterer({ id: catererId });
		
		if (!caterer) {
			notFound();
		}
		
		const catererWithDir = caterer as Caterer & { directory?: string | null };
		
		if (!catererWithDir.directory) {
			return (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							PDF Not Available
						</h1>
						<p className="text-gray-600 mb-4">
							No PDF is available for {caterer.name}.
						</p>
						<a
							href="/caterer-directory"
							className="text-orange-600 hover:underline"
						>
							← Back to Directory
						</a>
					</div>
				</div>
			);
		}

		return <PdfViewer caterer={caterer} />;
	} catch (error: any) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("Caterer PDF page error:", errorMessage);
		notFound();
	}
}

