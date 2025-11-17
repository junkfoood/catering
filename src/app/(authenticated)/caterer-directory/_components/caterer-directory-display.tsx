"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { Card, CardContent } from "@components/ui/card";
import { PageShell } from "~/app/_components/ui/page-shell";
import type { CatererData } from "~/server/api/routers/caterer";
import type { Caterer } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export default function CatererDirectoryDisplay({
	caterers,
}: {
	caterers: CatererData[];
}) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredCaterers = useMemo(() => {
		if (!searchQuery.trim()) {
			return caterers;
		}
		const query = searchQuery.toLowerCase().trim();
		return caterers.filter((caterer) =>
			caterer.name.toLowerCase().includes(query)
		);
	}, [caterers, searchQuery]);

	return (
		<PageShell
			body={
				<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Caterer Directory</h1>
					<p className="text-gray-600 mt-2">
						Browse all caterers and view their PDFs
					</p>
				</div>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<Input
						type="text"
						placeholder="Search caterers..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Results Count */}
				<div className="text-sm text-gray-600">
					{filteredCaterers.length} {filteredCaterers.length === 1 ? "caterer" : "caterers"} found
				</div>

				{/* Caterer Grid */}
				{filteredCaterers.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p>No caterers found matching your search.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredCaterers.map((caterer) => {
							const imageSrc = caterer.imageFile
								? `/vendor-images/${caterer.imageFile}`
								: `/vendor-images/400x400.svg`;
							
							const hasPdf = !!(caterer as Caterer & { directory?: string | null }).directory;

							return (
								<Link
									key={caterer.id}
									href={hasPdf ? `/caterer-directory/${caterer.id}` : "#"}
									className={hasPdf ? "block" : "block cursor-not-allowed"}
								>
									<Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
										<CardContent className="p-0">
											<div className="aspect-square relative bg-gray-100">
												<Image
													src={imageSrc}
													alt={caterer.name}
													fill
													className="object-contain p-4"
												/>
											</div>
											<div className="p-4">
												<h3 className="text-lg font-semibold text-gray-900 truncate">
													{caterer.name}
												</h3>
												{!hasPdf && (
													<p className="text-sm text-gray-500 mt-1">
														PDF not available
													</p>
												)}
											</div>
										</CardContent>
									</Card>
								</Link>
							);
						})}
					</div>
				)}
				</div>
			}
		/>
	);
}

