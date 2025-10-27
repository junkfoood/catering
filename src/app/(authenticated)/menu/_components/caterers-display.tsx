"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, MapPin, Star, Filter, Loader2, ChevronDown, Type, List } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Slider } from "@components/ui/slider";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Separator } from "@components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import type { CatererListData } from "~/server/api/routers/caterer";
import { PageShell } from "~/app/_components/ui/page-shell";
import { CatererMenuType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routeFormatter } from "~/utils/route";
import { api } from "~/trpc/react";

export default function CaterersDisplay({
	initialCaterers,
	totalCaterers,
	hasMore,
}: {
	initialCaterers: CatererListData[] | null;
	totalCaterers: number;
	hasMore: boolean;
}) {
	const router = useRouter();
	const [allCaterers, setAllCaterers] = useState<CatererListData[]>(initialCaterers || []);


	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasLoadedAll, setHasLoadedAll] = useState(!hasMore);
	const [budget, setBudget] = useState<[number, number]>([3, 60]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
	const [searchMode, setSearchMode] = useState<"text" | "dropdown">("text");
	const [selectedCaterer, setSelectedCaterer] = useState<string>("all");
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);


	const handleCategoryChange = (category: string, checked: boolean) => {
		if (checked) {
			setSelectedCategories([...selectedCategories, category]);
		} else {
			setSelectedCategories(selectedCategories.filter((c) => c !== category));
		}
	};

	const handleLocationChange = (location: string, checked: boolean) => {
		if (checked) {
			setSelectedLocations([...selectedLocations, location]);
		} else {
			setSelectedLocations(selectedLocations.filter((l) => l !== location));
		}
	};

	// 1. Add the static restrictedAreas array at the top of the component
	const restrictedAreas = [
		"All except West",
		"Off-Shore Island",
		"Central Business District",
		"Sentosa",
		"Jurong Island",
		"Airline Road",
	];

	//Pagination
	const [vendorsToShow, setVendorsToShow] = useState(6);

		//Labels for Categories
		const categoryLabels: Record<CatererMenuType, string> = {
			SMALL_QTY_REFRESHMENT: "Small Quantity Refreshments",
			SMALL_QTY_BUFFET: "Small Quantity Buffet",
			PACKED_MEALS: "Packed Meals",
			TEA_RECEPTION: "Tea Reception",
			BUFFET_1: "Buffet 1",
			BUFFET_2: "Buffet 2",
			BBQ_BUFFET: "BBQ Buffet",
			THEME_BUFFET: "Theme Buffet",
			ETHNIC_FOOD_MALAY: "Ethnic Food Malay",
			ETHNIC_FOOD_INDIAN: "Ethnic Food Indian",
			// Add others in future
		};

		//Flatten to vendor-menu pairs first
		const vendorMenuPairs = allCaterers.flatMap((vendor) =>
			vendor.menus.map((menu) => ({
				vendor,
				menu,
			}))
		);



		//Filter the vendor-menu pairs
		const filteredVendorMenuPairs = vendorMenuPairs.filter(({ vendor, menu }) => {
			//Filtering for Category
			const matchesCategory =
				selectedCategories.length === 0 ||
				selectedCategories.includes(menu.type);

			//Filtering for Budget
			const matchesBudget = menu.pricePerPerson >= budget[0] && menu.pricePerPerson <= budget[1];

			const matchesSearch = searchMode === "text" 
				? (searchQuery.trim() === "" || vendor.name.toLowerCase().includes(searchQuery.toLowerCase()))
				: (selectedCaterer === "all" || vendor.name === selectedCaterer);

			//Filtering for Location (show only menus that can deliver to selected areas)
			let matchesLocation = true;
			if (selectedLocations.length > 0) {
				// Exclude menu if ANY selected location is in menu.restrictedAreas
				matchesLocation = selectedLocations.every(
					selectedArea => !menu.restrictedAreas.includes(selectedArea)
				);
			}



			return matchesCategory && matchesBudget && matchesSearch && matchesLocation;
		});

		// Infinite scroll handler
		const handleScroll = useCallback(() => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight - 1000 && // Load when 1000px from bottom
				!isLoadingMore &&
				vendorsToShow < totalCaterers
			) {
				setVendorsToShow((prev) => prev + 6);
			}
		}, [isLoadingMore, vendorsToShow, totalCaterers]);

		// Add scroll listener
		useEffect(() => {
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		}, [handleScroll]);

		// Load vendors in batches as needed
	const { data: batchData, isLoading: isLoadingBatch } = api.caterer.getCaterersPaginated.useQuery(
		{ skip: vendorsToShow, take: 6 },
		{
			enabled: hasMore && vendorsToShow < totalCaterers && !isLoadingMore,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	// Preload dropdown data in the background
	const { data: dropdownData } = api.caterer.getCaterersPaginated.useQuery(
		{ skip: 0, take: 100 },
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
		}
	);

	// Update allCaterers when batch data is loaded
	useEffect(() => {
		if (batchData && batchData.caterers.length > 0) {
			setAllCaterers(prev => {
				// Create a map to track existing caterers by ID
				const existingCaterers = new Map(prev.map(caterer => [caterer.id, caterer]));
				
				// Add new caterers, skipping duplicates
				const newCaterers = batchData.caterers.filter(caterer => !existingCaterers.has(caterer.id));
				
				return [...prev, ...newCaterers];
			});
			setIsLoadingMore(false);
		}
	}, [batchData]);

	// Set loading state based on tRPC query
	useEffect(() => {
		setIsLoadingMore(isLoadingBatch);
	}, [isLoadingBatch]);

	return (
		<PageShell
			header={
				<section className="bg-gradient-to-br from-orange-50 to-orange-100 py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							Find the Perfect Caterer for Your Event
						</h1><br></br>
						<div className="max-w-2xl mx-auto">
							{/* Search Mode Toggle */}
							<div className="flex justify-center mb-4">
								<div className="flex bg-gray-100 rounded-lg p-1">
									<Button
										variant={searchMode === "text" ? "default" : "ghost"}
										onClick={() => {
											setSearchMode("text");
											setSelectedCaterer("all");
										}}
										className="flex items-center gap-2 py-4 px-4 text-lg h-auto"
									>
										<Type className="w-4 h-4" />
										Free Text
									</Button>
									<Button
										variant={searchMode === "dropdown" ? "default" : "ghost"}
										onClick={() => {
											setSearchMode("dropdown");
											setSearchQuery("");
										}}
										className="flex items-center gap-2 py-4 px-4 text-lg h-auto"
									>
										<List className="w-4 h-4" />
										Select Caterer from Dropdown List
									</Button>
								</div>
							</div>
							
							{/* Search Input */}
							<div className="relative">
								{searchMode === "text" ? (
									<>
										<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
										<Input
											type="text"
											placeholder="Search for caterer name..."
											className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-orange-200 focus:border-orange-400"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</>
								) : (
									<div className="relative" ref={dropdownRef}>
										<button
											type="button"
											className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-2 border-orange-200 focus:border-orange-400 text-left bg-white flex items-center justify-between"
											onClick={() => setIsDropdownOpen(!isDropdownOpen)}
										>
											<div className="flex items-center">
												<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
												<span className={selectedCaterer !== "all" ? "text-gray-900" : "text-gray-500"}>
													{selectedCaterer === "all" ? "Select a caterer..." : selectedCaterer}
												</span>
											</div>
											<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</button>
										
										{isDropdownOpen && (
											<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
												{/* Dropdown list */}
												<div className="max-h-60 overflow-y-auto">
													{/* All Caterers option */}
													<div
														className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 text-left"
														onClick={() => {
															setSelectedCaterer("all");
															setIsDropdownOpen(false);
														}}
													>
														<div className="font-medium text-sm text-left">All Caterers</div>
													</div>
													
													{dropdownData?.caterers && dropdownData.caterers.length > 0 ? (
														dropdownData.caterers
															.sort((a, b) => a.name.localeCompare(b.name))
															.map((caterer) => (
																<div
																	key={caterer.id}
																	className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-left"
																	onClick={() => {
																		setSelectedCaterer(caterer.name);
																		setIsDropdownOpen(false);
																	}}
																>
																	<div className="font-medium text-sm text-left">{caterer.name}</div>
																	<div className="text-xs text-gray-500 text-left">{caterer.menus.length} menu(s)</div>
																</div>
															))
													) : (
														<div className="px-3 py-2 text-sm text-gray-500 text-center">
															No caterers available
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</section>
			}
			body={
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						{/* Filters Sidebar */}
						<div className="lg:col-span-1">
							<Card className="sticky top-4">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Filter className="w-5 h-5" />
										Filters
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Budget Filter */}
									<div>
										<Label className="text-sm font-medium mb-2 block">
											Budget per Pax: ${budget[0]} - ${budget[1]}
										</Label>
										<Slider
											value={budget}
											onValueChange={value => setBudget([value[0], value[1]] as [number, number])}
											max={60}
											min={3}
											step={1}
											className="w-full"
										/>
										<div className="flex justify-between text-xs text-gray-500 mt-1">
											<span>$3</span>
											<span>$60</span>
										</div>
									</div>

									<Separator className="my-3" />

									{/* Categories Filter */}
									<div>
										<Label className="text-sm font-medium mb-2 block">
											Categories
										</Label>
										<div className="space-y-1">
											{Object.values(CatererMenuType).map((category) => (
												<div
													key={category}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={category}
														checked={selectedCategories.includes(category)}
														onCheckedChange={(checked) =>
															handleCategoryChange(category, checked as boolean)
														}
													/>
													<Label
														htmlFor={category}
														className="text-xs text-gray-700"
													>
														{categoryLabels[category]}
													</Label>
												</div>
											))}
										</div>
									</div>

									<Separator className="my-3" />

									{/* Location Filter */}
									<div>
										<Label className="text-sm font-medium mb-2 block">
											Delivery Restrictions:
										</Label>
										<div className="space-y-1">
											{restrictedAreas.map((location) => (
												<div key={location} className="flex items-center space-x-2">
													<Checkbox
														id={location}
														checked={selectedLocations.includes(location)}
														onCheckedChange={(checked) =>
															handleLocationChange(location, checked as boolean)
														}
													/>
													<Label
														htmlFor={location}
														className="text-xs text-gray-700"
													>
														{location}
													</Label>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Vendor Listings */}
						<div className="lg:col-span-3">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									Available Menu Packages
								</h2>
								<div className="flex items-center gap-2">
									<p className="text-gray-600">{filteredVendorMenuPairs.length} menu packages found</p>
									{isLoadingMore && (
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Loading more...</span>
										</div>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{filteredVendorMenuPairs.slice(0, vendorsToShow).map(({ vendor, menu }) => {
									const imageSrc = vendor.imageFile
									? `/vendor-images/${vendor.imageFile}`
									: `/vendor-images/400x400.svg`;

									return (
										<Card key={`${vendor.id}-${menu.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
											<div className="md:flex">
												<div className="md:w-1/3 h-45">
													<img
														src={imageSrc}
														alt={vendor.name}
														className="w-full h-full object-contain rounded-t"
													/>
												</div>
												<div className="md:w-2/3 p-6">
													<div className="flex justify-between items-start mb-2">
														<div>
															<h3 className="text-xl font-bold text-gray-900">
																{vendor.name}
															</h3>
															<div className="flex items-center gap-1 mt-1">
																<Badge variant="secondary">
																	{categoryLabels[menu.type]}
																	{menu.code.trim().slice(-4)}
																</Badge>
															</div>
														</div>
														<div className="text-right">
															<div className="text-2xl font-bold text-orange-600">
																${menu.pricePerPerson}
															</div>
															<div className="text-sm text-gray-500">per pax</div>
														</div>
													</div>

													<div className="flex gap-3">
														<Button
															className="flex-1 bg-orange-500 hover:bg-orange-600"
															asChild
														>
															<Link href={routeFormatter.caterer(vendor, menu.id)}>
																View Details
															</Link>
														</Button>
														<Button
															variant="outline"
															className="flex-1 bg-transparent"
															onClick={() => {
																// Prefetch the comparison page data
																router.prefetch(`/comparison?caterer=${vendor.id}&menu=${menu.id}`);
																// Open in new tab
																window.open(`/comparison?caterer=${vendor.id}&menu=${menu.id}`, '_blank');
															}}
														>
															Compare
														</Button>
													</div>
												</div>
											</div>
										</Card>
									);
								})}
							</div>
							
							{/* Loading indicator - shows when loading OR when there are more items to load */}
							{(isLoadingMore || (filteredVendorMenuPairs.length > vendorsToShow && filteredVendorMenuPairs.length > 0)) && (
								<div className="text-center mt-8">
									<div className="flex items-center justify-center gap-2 text-gray-600">
										<Loader2 className="w-5 h-5 animate-spin" />
										<span>Loading more menu packages...</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			}
		/>
	);
}
