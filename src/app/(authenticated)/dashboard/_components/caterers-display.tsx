"use client";

import { useState } from "react";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Slider } from "@components/ui/slider";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Separator } from "@components/ui/separator";
import { CatererListData } from "~/server/api/routers/caterer";
import { PageShell } from "~/app/_components/ui/page-shell";
import { CatererMenuType } from "@prisma/client";
import Link from "next/link";
import { routeFormatter } from "~/utils/route";

export default function CaterersDisplay({
	caterers,
}: {
	caterers: CatererListData[];
}) {
	const [budget, setBudget] = useState<[number, number]>([2, 60]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

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
	const [vendorsToShow, setVendorsToShow] = useState(5);

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
		const vendorMenuPairs = caterers.flatMap((vendor) =>
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

			const matchesSearch =
				searchQuery.trim() === "" ||
				vendor.name.toLowerCase().includes(searchQuery.toLowerCase());

			//Filtering for Location (show only menus that can deliver to selected areas)
			let matchesLocation = true;
			if (selectedLocations.length > 0) {
				// Exclude menu if ANY selected location is in menu.restrictedAreas
				matchesLocation = selectedLocations.every(
					selectedArea => !menu.restrictedAreas.includes(selectedArea)
				);
			}

			// Debug: Log filtering results for troubleshooting
			/*if (process.env.NODE_ENV === 'development') {
				console.log(`Filtering ${vendor.name} - ${menu.code}:`, {
					price: menu.pricePerPerson,
					budget: budget[0],
					matchesBudget,
					matchesCategory,
					matchesSearch,
					matchesLocation,
					selectedCategories,
					selectedLocations
				});
			}*/

			return matchesCategory && matchesBudget && matchesSearch && matchesLocation;
		});

	return (
		<PageShell
			header={
				<section className="bg-gradient-to-br from-orange-50 to-orange-100 py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							Find the Perfect Caterer for Your Event
						</h1><br></br>
						<div className="max-w-2xl mx-auto relative">
							<Search className="absolute left-4 top-2.5 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<Input
								type="text"
								placeholder="Search for caterer name..."
								className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-orange-200 focus:border-orange-400"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{/*<Button className="absolute right-0 top-1/2 transform -translate-y-1/2 -mt-5 rounded-full bg-orange-500 hover:bg-orange-600">
								Search
							</Button>*/}
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
								<CardContent className="space-y-6">
									{/* Budget Filter */}
									<div>
										<Label className="text-sm font-medium mb-3 block">
											Budget per Pax: ${budget[0]}
										</Label>
										<Slider
											value={budget}
											onValueChange={setBudget}
											max={60}
											min={2}
											step={1}
											className="w-full"
										/>
										<div className="flex justify-between text-xs text-gray-500 mt-1">
											<span>$2</span>
											<span>$60</span>
										</div>
									</div>

									<Separator />

									{/* Categories Filter */}
									<div>
										<Label className="text-sm font-medium mb-3 block">
											Categories
										</Label>
										<div className="space-y-2">
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
														className="text-sm text-gray-700"
													>
														{categoryLabels[category]}
													</Label>
												</div>
											))}
										</div>
									</div>

									<Separator />

									{/* Location Filter */}
									<div>
										<Label className="text-sm font-medium mb-3 block">
											Delivery Restrictions:
										</Label>
										<div className="space-y-2">
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
														className="text-sm text-gray-700"
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
									Available Vendor Packages
								</h2>
								<p className="text-gray-600">{filteredVendorMenuPairs.length} vendors found</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{filteredVendorMenuPairs.slice(0, vendorsToShow).map(({ vendor, menu }) => {
									const imageSrc = vendor.imageFile
									? `/vendor-images/${vendor.imageFile}`
									: `/vendor-images/400x400.svg`;
								console.log(`Vendor: ${vendor.name}, Image: ${imageSrc}`);

									return (
										<Card key={vendor.id + menu.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
														<h3 className="text-xl font-bold text-gray-900">
															{vendor.name}
														</h3>
														<div className="text-right">
															<div className="text-2xl font-bold text-orange-600">
																${menu.pricePerPerson}
															</div>
															<div className="text-sm text-gray-500">per pax</div>
														</div>
													</div>

													{/*<div className="flex items-center gap-1 mb-3">
														<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
														<span className="font-medium">4.5</span>
														<span className="text-gray-500">(100 reviews)</span>
													</div>

													<p className="text-gray-600 mb-4">Lorem Ipsum</p>

													<div className="flex flex-wrap gap-2 mb-4">
														<Badge variant="secondary">Western</Badge>
													</div>*/}

													<div className="flex gap-3">
														<Button
															className="flex-1 bg-orange-500 hover:bg-orange-600"
															asChild
														>
															<Link href={routeFormatter.caterer(vendor)}>
																View Details
															</Link>
														</Button>
														<Button
															variant="outline"
															className="flex-1 bg-transparent"
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

							{/* Load More */}
							{filteredVendorMenuPairs.length > vendorsToShow && filteredVendorMenuPairs.length > 0 && (
								<div className="text-center mt-8">
									<Button variant="outline"
										size="lg"
										onClick={() => setVendorsToShow((prev) => prev + 5)}
									>
										Load More Vendors
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			}
		/>
	);
}
