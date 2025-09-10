"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Eye } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { CatererListData } from "~/server/api/routers/caterer";
import { CatererMenuType } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { routeFormatter } from "~/utils/route";

interface ComparisonItem {
	vendor: CatererListData;
	menu: CatererListData['menus'][0];
}

export default function ComparisonDisplay() {
	const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");

	// Fetch all caterers for the add dialog
	const { data: allCaterers, isLoading } = api.caterer.getCaterersPaginated.useQuery(
		{ skip: 0, take: 100 }, // Get more caterers for selection
		{ staleTime: 5 * 60 * 1000 }
	);

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

	// Flatten to vendor-menu pairs for selection
	const vendorMenuPairs = filteredCaterers.flatMap((vendor) =>
		vendor.menus.map((menu) => ({
			vendor,
			menu,
		}))
	);

	const addToComparison = (vendor: CatererListData, menu: CatererListData['menus'][0]) => {
		const newItem: ComparisonItem = { vendor, menu };
		
		// Check if this exact vendor-menu combination is already in comparison
		const exists = comparisonItems.some(
			item => item.vendor.id === vendor.id && item.menu.id === menu.id
		);
		
		if (!exists && comparisonItems.length < 4) { // Limit to 4 items
			setComparisonItems([...comparisonItems, newItem]);
		}
	};

	const removeFromComparison = (index: number) => {
		setComparisonItems(comparisonItems.filter((_, i) => i !== index));
	};

	const clearComparison = () => {
		setComparisonItems([]);
	};

	// Get unique features across all compared items
	const getUniqueFeatures = () => {
		const features = new Set<string>();
		comparisonItems.forEach(item => {
			item.menu.sections.forEach(section => {
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
								<div className="flex gap-4">
									<input
										type="text"
										placeholder="Search caterer name..."
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
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
															<Badge variant="secondary" className="text-xs mt-1">
																{categoryLabels[menu.type]}
															</Badge>
															<div className="text-lg font-bold text-orange-600 mt-2">
																{formatPrice(menu.pricePerPerson)}
															</div>
															<Button
																size="sm"
																className="mt-2 w-full"
																onClick={() => addToComparison(vendor, menu)}
																disabled={isAlreadyAdded || comparisonItems.length >= 4}
															>
																{isAlreadyAdded ? "Added" : "Add to Compare"}
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
								<TableHead className="w-48">Feature</TableHead>
								{comparisonItems.map((item, index) => (
									<TableHead key={index} className="w-64">
										<div className="flex items-center justify-between">
											<div>
												<div className="font-semibold">{item.vendor.name}</div>
												<Badge variant="secondary" className="text-xs">
													{categoryLabels[item.menu.type]}
												</Badge>
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
																{section.items.slice(0, 3).map(item => item.name).join(", ")}
																{section.items.length > 3 && ` +${section.items.length - 3} more`}
															</div>
														)}
														{section.selectionLimit && (
															<div className="text-xs text-gray-500">
																Select {section.selectionLimit}
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
