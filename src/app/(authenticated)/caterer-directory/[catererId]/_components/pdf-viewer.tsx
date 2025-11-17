"use client";

import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@components/ui/button";
import Link from "next/link";
import type { CatererData } from "~/server/api/routers/caterer";
import type { Caterer } from "@prisma/client";

export default function PdfViewer({ caterer }: { caterer: CatererData }) {
	const catererWithDir = caterer as Caterer & { directory?: string | null };
	const pdfPath = `/caterer-pdfs/${catererWithDir.directory}`;
	const pdfUrl = pdfPath;

	const handleDownload = () => {
		const link = document.createElement("a");
		link.href = pdfUrl;
		link.download = catererWithDir.directory || `${caterer.name}.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/caterer-directory">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Directory
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{caterer.name}
							</h1>
							<p className="text-sm text-gray-600">PDF Document</p>
						</div>
					</div>
					<Button onClick={handleDownload} variant="outline">
						<Download className="w-4 h-4 mr-2" />
						Download PDF
					</Button>
				</div>

				{/* PDF Viewer */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<div className="aspect-[8.5/11] w-full" style={{ minHeight: "600px" }}>
						<iframe
							src={pdfUrl}
							className="w-full h-full border-0"
							title={`${caterer.name} PDF`}
						/>
					</div>
				</div>

				{/* Fallback message for browsers that don't support PDF viewing */}
				<div className="mt-4 text-center text-sm text-gray-600">
					<p>
						If the PDF doesn't display,{" "}
						<a
							href={pdfUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-orange-600 hover:underline"
						>
							open it in a new tab
						</a>
						{" "}or{" "}
						<button
							onClick={handleDownload}
							className="text-orange-600 hover:underline"
						>
							download it
						</button>
						.
					</p>
				</div>
			</div>
		</div>
	);
}

