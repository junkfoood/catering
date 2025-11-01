"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, X, Trash2, Eye, Search, List, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Slider } from "@components/ui/slider";
import { Label } from "@components/ui/label";
import type { CatererListData, CatererData } from "~/server/api/routers/caterer";
import { CatererMenuType } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { routeFormatter } from "~/utils/route";

interface ComparisonItem {
	vendor: CatererData; // Use full type with sections for comparison
	menu: CatererData['menus'][0];
}

export default function ComparisonDisplay() {
	const searchParams = useSearchParams();
	const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchMode, setSearchMode] = useState<"text" | "dropdown">("text");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [budget, setBudget] = useState<[number, number]>([3, 60]);
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
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


	// Fetch caterers for dropdown (lightweight)
	const { data: dropdownCaterers } = api.caterer.getCaterersForDropdown.useQuery(undefined, {
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	// Fetch caterers for add dialog (lightweight - no sections for faster loading)
	const { data: allCaterers, isLoading } = api.caterer.getCaterersPaginated.useQuery(
		{ skip: 0, take: 100 },
		{ 
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		}
	);

	// Get URL parameters for faster loading
	const catererId = searchParams.get('caterer');
	const menuId = searchParams.get('menu');

	// Suppress tRPC console errors for invalid queries (optional)
	useEffect(() => {
		const originalError = console.error;
		console.error = (...args) => {
			if (args[0]?.includes?.('caterer.getCaterer') && args[0]?.includes?.('{}')) {
				return; // Suppress this specific error
			}
			originalError.apply(console, args);
		};
		
		return () => {
			console.error = originalError;
		};
	}, []);

	// Fetch specific caterer data if URL parameters exist (faster than waiting for allCaterers)
	const { data: specificCaterer, isLoading: isLoadingSpecific } = catererId && catererId.trim().length > 0 
		? api.caterer.getCaterer.useQuery(
			{ id: catererId },
			{
				staleTime: 5 * 60 * 1000,
				refetchOnWindowFocus: false,
			}
		)
		: { data: null, isLoading: false };

	// Auto-populate caterer from URL parameters (optimized for faster loading)
	useEffect(() => {
		if (catererId && menuId) {
			// Use specific caterer data (faster)
			if (specificCaterer) {
				const menu = specificCaterer.menus.find(m => m.id === menuId);
				if (menu) {
					// Check if this caterer-menu combination is already in comparison
					const exists = comparisonItems.some(
						item => item.vendor.id === specificCaterer.id && item.menu.id === menu.id
					);
					
					if (!exists && comparisonItems.length < 4) {
						setComparisonItems([{ vendor: specificCaterer, menu }]);
					}
				}
			}
		}
	}, [catererId, menuId, specificCaterer, comparisonItems]);

	// Category labels
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
	};

	// Get all available menu types
	const allMenuTypes = Object.values(CatererMenuType);

	// Filter caterers for the add dialog
	const filteredCaterers = allCaterers?.caterers.filter(caterer => {
		const matchesSearch = searchQuery.trim() === "" || 
			caterer.name.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesCategory = selectedCategory === "" || 
			caterer.menus.some(menu => menu.type === selectedCategory);

		return matchesSearch && matchesCategory;
	}) || [];

	// Flatten to vendor-menu pairs for selection, but only include menus that match the selected category and budget
	const vendorMenuPairs = filteredCaterers.flatMap((vendor) =>
		vendor.menus
			.filter(menu => {
				const matchesCategory = selectedCategory === "" || menu.type === selectedCategory;
				const matchesBudget = menu.pricePerPerson >= budget[0] && menu.pricePerPerson <= budget[1];
				return matchesCategory && matchesBudget;
			})
			.map((menu) => ({
				vendor,
				menu,
			}))
	);

	const utils = api.useUtils();
	const [loadingMenuId, setLoadingMenuId] = useState<string | null>(null);

	const addToComparison = async (vendor: CatererListData, menu: CatererListData['menus'][0]) => {
		// Check if this exact vendor-menu combination is already in comparison
		const exists = comparisonItems.some(
			item => item.vendor.id === vendor.id && item.menu.id === menu.id
		);
		
		if (exists || comparisonItems.length >= 4) {
			return; // Limit to 4 items
		}

		setLoadingMenuId(menu.id);
		
		// Fetch full caterer data with sections only when adding to comparison
		try {
			const fullCatererData = await utils.caterer.getCaterer.fetch({ id: vendor.id });
			if (fullCatererData) {
				const fullMenu = fullCatererData.menus.find(m => m.id === menu.id);
				if (fullMenu) {
					const newItem: ComparisonItem = { 
						vendor: fullCatererData, 
						menu: fullMenu 
					};
					setComparisonItems([...comparisonItems, newItem]);
				}
			}
		} catch (error) {
			console.error("Error fetching full menu data:", error);
		} finally {
			setLoadingMenuId(null);
		}
	};

	const removeFromComparison = (index: number) => {
		setComparisonItems(comparisonItems.filter((_, i) => i !== index));
	};

	const clearComparison = () => {
		setComparisonItems([]);
	};

	const toggleSectionExpansion = (sectionKey: string) => {
		setExpandedSections(prev => {
			const newSet = new Set(prev);
			if (newSet.has(sectionKey)) {
				newSet.delete(sectionKey);
			} else {
				newSet.add(sectionKey);
			}
			return newSet;
		});
	};

	// Get unique features across all compared items
	const getUniqueFeatures = () => {
		const features = new Set<string>();
		comparisonItems.forEach(item => {
			// Sections are included in CatererData type
			item.menu.sections?.forEach((section: { title: string }) => {
				features.add(section.title);
			});
		});
		return Array.from(features);
	};

	const formatPrice = (price: number) => {
		return `$${price}`;
	};

	const formatRestrictedAreas = (areas: string[]) => {
		if (areas.length === 0) return "No restrictions";
		return areas.join(", ");
	};

	return (
		<div className="space-y-6">
			{/* Loading indicator for URL parameters */}
			{(catererId && menuId && isLoadingSpecific) && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-center gap-3">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
						<span className="text-blue-800 font-medium">Loading caterer details...</span>
					</div>
				</div>
			)}

			{/* Header with Add Comparison Button */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Compare Caterers ({comparisonItems.length}/4)
					</h2>
					<p className="text-gray-600 mt-1">
						Add up to 4 caterers to compare their menu packages side by side.
					</p>
				</div>
				<div className="flex gap-2">
					{comparisonItems.length > 0 && (
						<Button
							variant="outline"
							onClick={clearComparison}
							className="text-red-600 hover:text-red-700"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Clear All
						</Button>
					)}
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button className="bg-orange-500 hover:bg-orange-600">
								<Plus className="w-4 h-4 mr-2" />
								Add Comparison
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Add Caterer to Comparison</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								{/* Search and Filter */}
								<div className="space-y-4">
									{/* Search Mode Toggle */}
									<div className="flex gap-2">
										<Button
											variant={searchMode === "text" ? "default" : "ghost"}
											size="sm"
											onClick={() => {
												setSearchMode("text");
												setSearchQuery("");
											}}
											className="flex items-center gap-2"
										>
											<Search className="w-4 h-4" />
											Free Text Search
										</Button>
										<Button
											variant={searchMode === "dropdown" ? "default" : "ghost"}
											size="sm"
											onClick={() => {
												setSearchMode("dropdown");
												setSearchQuery("");
											}}
											className="flex items-center gap-2"
										>
											<List className="w-4 h-4" />
											Select Caterer from Dropdown List
										</Button>
									</div>

									<div className="flex gap-4">
										{searchMode === "text" ? (
											<input
												type="text"
												placeholder="Search caterer name..."
												className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
											/>
										) : (
											<div className="flex-1 relative" ref={dropdownRef}>
												<button
													type="button"
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-left bg-white flex items-center justify-between"
													onClick={() => setIsDropdownOpen(!isDropdownOpen)}
												>
													<span className={searchQuery ? "text-gray-900" : "text-gray-500"}>
														{searchQuery || "Select a caterer..."}
													</span>
													<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
													</svg>
												</button>
												
												{isDropdownOpen && (
													<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
														{/* Dropdown list */}
														<div className="max-h-60 overflow-y-auto">
															{dropdownCaterers && dropdownCaterers.length > 0 ? (
																dropdownCaterers
																	.map((caterer) => (
																		<div
																			key={caterer.id}
																			className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
																			onClick={() => {
																				setSearchQuery(caterer.name);
																				setIsDropdownOpen(false);
																			}}
																		>
																			<div className="font-medium text-sm">{caterer.name}</div>
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
										<select
											className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
											value={selectedCategory}
											onChange={(e) => setSelectedCategory(e.target.value)}
										>
											<option value="">All Categories</option>
											{allMenuTypes.map(type => (
												<option key={type} value={type}>
													{categoryLabels[type]}
												</option>
											))}
										</select>
									</div>
									
									{/* Budget Filter */}
									<div>
										<Label className="text-sm font-medium mb-3 block">
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
								</div>

								{/* Menu Items Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
									{isLoading ? (
										<div className="col-span-2 text-center py-8 text-gray-500">
											Loading caterers...
										</div>
									) : vendorMenuPairs.length === 0 ? (
										<div className="col-span-2 text-center py-8 text-gray-500">
											No caterers found matching your criteria.
										</div>
									) : (
										vendorMenuPairs.map(({ vendor, menu }) => {
											const imageSrc = vendor.imageFile
												? `/vendor-images/${vendor.imageFile}`
												: `/vendor-images/400x400.svg`;

											const isAlreadyAdded = comparisonItems.some(
												item => item.vendor.id === vendor.id && item.menu.id === menu.id
											);

											return (
												<Card key={`${vendor.id}-${menu.id}`} className="overflow-hidden">
													<div className="flex">
														<div className="w-20 h-20 flex-shrink-0">
															<img
																src={imageSrc}
																alt={vendor.name}
																className="w-full h-full object-contain"
															/>
														</div>
														<div className="flex-1 p-4">
															<h3 className="font-semibold text-sm">{vendor.name}</h3>
															<h2 className="text-xs mt-1">
																{menu.code}
															</h2>
															<div className="text-lg font-bold text-orange-600 mt-2">
																{formatPrice(menu.pricePerPerson)}
															</div>
															<Button
																size="sm"
																className="mt-2 w-full"
																onClick={() => addToComparison(vendor, menu)}
																disabled={isAlreadyAdded || comparisonItems.length >= 4 || loadingMenuId === menu.id}
															>
																{loadingMenuId === menu.id ? (
																	<>
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																		Loading...
																	</>
																) : isAlreadyAdded ? (
																	"Added"
																) : (
																	"Add to Compare"
																)}
															</Button>
														</div>
													</div>
												</Card>
											);
										})
									)}
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Comparison Table */}
			{comparisonItems.length === 0 ? (
				<Card>
					<CardContent className="text-center py-12">
						<Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							No caterers to compare
						</h3>
						<p className="text-gray-600 mb-4">
							Add caterers to start comparing their menu packages.
						</p>
						<Button
							onClick={() => setIsAddDialogOpen(true)}
							className="bg-orange-500 hover:bg-orange-600"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add First Caterer
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-48 text-black">Menu</TableHead>
								{comparisonItems.map((item, index) => (
									<TableHead key={index} className="w-64">
										<div className="flex items-center justify-between text-black">
											<div>
												<div className="font-bold">{item.vendor.name}</div>
												<div className="text-xs font-semibold">
													{item.menu.code}
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeFromComparison(index)}
												className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{/* Basic Information */}
							<TableRow>
								<TableCell className="font-medium">Price per Person</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index} className="text-lg font-bold text-orange-600">
										{formatPrice(item.menu.pricePerPerson)}
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Minimum Order</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index}>
										{item.menu.minimumOrder} pax
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Free Delivery Minimum</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index}>
										{item.menu.minimumOrderForFreeDelivery} pax
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Delivery Fee</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index}>
										{item.menu.deliveryFee ? formatPrice(item.menu.deliveryFee) : "Free"}
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Max Fried Items</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index}>
										{item.menu.maxFriedItems || "No limit"}
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Delivery Restrictions</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index} className="text-sm">
										{formatRestrictedAreas(item.menu.restrictedAreas)}
									</TableCell>
								))}
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Notes</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index} className="text-sm">
										{item.menu.notes || "No notes"}
									</TableCell>
								))}
							</TableRow>

							{/* Menu Sections */}
							{getUniqueFeatures().map((feature, featureIndex) => (
								<TableRow key={featureIndex}>
									<TableCell className="font-medium">{feature}</TableCell>
									{comparisonItems.map((item, index) => {
										const section = item.menu.sections.find(s => s.title === feature);
										return (
											<TableCell key={index}>
												{section ? (
													<div className="space-y-1">
														{section.description && (
															<p className="text-sm text-gray-600">{section.description}</p>
														)}
														{section.items.length > 0 && (
															<div className="text-sm">
																<span className="font-medium">Items: </span>
																{(() => {
																	const sectionKey = `${index}-${feature}`;
																	const isExpanded = expandedSections.has(sectionKey);
																	const itemsToShow = isExpanded ? section.items : section.items.slice(0, 3);
																	const hasMore = section.items.length > 3;
																	
																	return (
																		<div>
																			<div>
																				{itemsToShow.map(item => item.name).join(", ")}
																				{!isExpanded && hasMore && ` +${section.items.length - 3} more`}
																			</div>
																			{hasMore && (
																				<button
																					onClick={() => toggleSectionExpansion(sectionKey)}
																					className="text-blue-600 hover:text-blue-800 text-xs underline mt-1"
																				>
																					{isExpanded ? "Show less" : "Show all"}
																				</button>
																			)}
																		</div>
																	);
																})()}
															</div>
														)}
													</div>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))}

							{/* Action Row */}
							<TableRow>
								<TableCell className="font-medium">Actions</TableCell>
								{comparisonItems.map((item, index) => (
									<TableCell key={index}>
										<Button
											asChild
											className="bg-orange-500 hover:bg-orange-600"
										>
											<Link href={routeFormatter.caterer(item.vendor, item.menu.id)}>
												<Eye className="w-4 h-4 mr-2" />
												View Details
											</Link>
										</Button>
									</TableCell>
								))}
							</TableRow>
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
