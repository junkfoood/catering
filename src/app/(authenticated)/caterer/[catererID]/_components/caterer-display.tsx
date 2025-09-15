"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Star,
	MapPin,
	Phone,
	Mail,
	Calculator,
	ShoppingCart,
	Check,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import type { CatererData, CatererMenuData } from "~/server/api/routers/caterer";

const discountFields = [
	{ key: "discount_below_500", label: "Below $500" },
	{ key: "discount_500_2000", label: "$500 - $2,000" },
	{ key: "discount_2000_4000", label: "$2,000 - $4,000" },
	{ key: "discount_above_4000", label: "Above $4,000" },
];

export default function CatererDisplay({ 
	caterer, 
	initialMenuId 
}: { 
	caterer: CatererData;
	initialMenuId?: string;
}) {
	const [selectedMenu, setSelectedMenu] = useState<CatererMenuData | null>(() => {
		if (initialMenuId) {
			const menu = caterer.menus.find(m => m.id === initialMenuId);
			return menu ?? caterer.menus[0] ?? null;
		}
		return caterer.menus[0] ?? null;
	});
	const [paxCount, setPaxCount] = useState(20);
	const [selectedItems, setSelectedItems] = useState<{
		[sectionId: string]: string[];
	}>({});
	const [deliveryCharges, setDeliveryCharges] = useState<string[]>([]);
	const [floors, setFloors] = useState(1);

	// Update pax count to respect minimum order when selected menu changes
	useEffect(() => {
		if (selectedMenu) {
			setPaxCount(prev => Math.max(prev, selectedMenu.minimumOrder ?? 1));
		}
	}, [selectedMenu]);

	const handleItemSelection = (
		sectionId: string,
		itemId: string,
		checked: boolean,
	) => {
		const section = selectedMenu?.sections.find((s) => s.id === sectionId);
		if (!section) return;

		setSelectedItems((prev) => {
			const currentSelections = prev[sectionId] || [];

			if (checked) {
				if (currentSelections.length < section.selectionLimit) {
					return { ...prev, [sectionId]: [...currentSelections, itemId] };
				}
			} else {
				return {
					...prev,
					[sectionId]: currentSelections.filter((id) => id !== itemId),
				};
			}

			return prev;
		});
	};

	const calculateTotal = () => {
		if (!selectedMenu)
			return { 
				subtotal: 0, 
				discount: 0, 
				discountRate: 0,
				adminFee: 0, 
				baseDelivery: 0,
				additionalDelivery: 0,
				additionalDeliveryItems: [],
				delivery: 0, 
				total: 0 
			};

		const subtotal = selectedMenu.pricePerPerson * paxCount;
		
		// Calculate base delivery fee and additional delivery fees separately
		let baseDelivery = 0;
		let additionalDelivery = 0;
		const additionalDeliveryItems: { label: string; amount: number }[] = [];
		
		// Check if minimum order is met for free delivery
		if (paxCount >= (selectedMenu.minimumOrderForFreeDelivery ?? 0)) {
			baseDelivery = 0; // Free delivery
		} else {
			baseDelivery = selectedMenu.deliveryFee ?? 0; // Use caterer menu delivery fee
		}
		
		// Calculate additional delivery fees (surcharges)
		if (deliveryCharges.includes("cbd")) {
			additionalDelivery += 35;
			additionalDeliveryItems.push({ label: "CBD Surcharge", amount: 35 });
		}
		if (deliveryCharges.includes("odd-hours")) {
			additionalDelivery += 30;
			additionalDeliveryItems.push({ label: "Odd Hours Surcharge", amount: 30 });
		}
		if (deliveryCharges.includes("no-lift")) {
			const liftCharge = 25 * floors;
			additionalDelivery += liftCharge;
			additionalDeliveryItems.push({ 
				label: `Lift Surcharge (${floors} floor${floors > 1 ? 's' : ''})`, 
				amount: liftCharge 
			});
		}
		
		const totalDelivery = baseDelivery + additionalDelivery;
		
		// Calculate discount based on total order value (subtotal + delivery)
		const orderValue = subtotal + totalDelivery;
		let discountRate = 0;
		
		if (orderValue < 500) {
			discountRate = 0; // No discount
		} else if (orderValue >= 500 && orderValue < 2000) {
			discountRate = 0.05; // 5% discount
		} else if (orderValue >= 2000 && orderValue < 4000) {
			discountRate = 0.10; // 10% discount
		} else {
			discountRate = 0.15; // 15% discount for $4000+
		}

		// Calculate alphabet discount based on total order value (subtotal + delivery)
		let alphabet = "";
		
		if (orderValue < 500) {
			alphabet = "A"; // No discount
		} else if (orderValue >= 500 && orderValue < 2000) {
			alphabet = "B"; // 5% discount
		} else if (orderValue >= 2000 && orderValue < 4000) {
			alphabet = "C"; // 10% discount
		} else {
			alphabet = "D"; // 15% discount for $4000+
		}		
		
		const discount = orderValue * discountRate;
		
		// Calculate admin fee on the total after discounts (subtotal + delivery - discount)
		const discountedSubtotal = subtotal * (1 - discountRate);
		const discountedDelivery = totalDelivery * (1 - discountRate);
		const adminFee = (discountedSubtotal + discountedDelivery) * 0.015; // 1.5% admin fee
		
		const total = discountedSubtotal + discountedDelivery + adminFee;

		return { 
			subtotal, 
			discount, 
			discountRate,
			adminFee, 
			baseDelivery,
			additionalDelivery,
			additionalDeliveryItems,
			delivery: totalDelivery, 
			total,
			alphabet
		};
	};

	const isSelectionComplete = () => {
		if (!selectedMenu) return false;

		return selectedMenu.sections.every((section) => {
			const selections = selectedItems[section.id] || [];
			return selections.length === section.selectionLimit;
		});
	};

	const pricing = calculateTotal();

	// Create the image source variable
	const imageSrc = caterer.imageFile
		? `/vendor-images/${caterer.imageFile}`
		: "/vendor-images/400x400.svg";

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-4">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Vendor Info & Menu Selection */}
					<div className="lg:col-span-2 space-y-6">
						{/* Vendor Header */}
						<Card>
							<CardContent className="p-6">
								<div className="flex flex-col md:flex-row gap-6">
									<img
										src={imageSrc}
										alt={caterer.name}
										className="w-70 h-full object-contain rounded-t"
									/>
									<div className="flex-1">
										<div className="flex items-start justify-between mb-4">
										<h1 className="text-2xl font-bold text-gray-900 mb-2">
													{caterer.name}
												</h1>
											{/*<div>

												<Badge variant="secondary" className="mb-2">
													Western
												</Badge>
											</div>
											<Button variant="outline">
												<ShoppingCart className="w-4 h-4 mr-2" />
												Add to Compare
											</Button>*/}
										</div>

										{/*<div className="flex items-center gap-4 mb-4">
											<div className="flex items-center gap-1">
												<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
												<span className="font-medium">4.5</span>
												<span className="text-gray-500">(100 reviews)</span>
											</div>
											<div className="flex items-center gap-1 text-gray-600">
												<MapPin className="w-4 h-4" />
												<span className="text-sm">Singapore</span>
											</div>
										</div>*/}

										<p className="text-gray-600 mb-4">
											Lorem ipsum dolor sit amet consectetur adipisicing elit.
											Quisquam, quos.
										</p>

										<div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
											{caterer.telephone && (
												<div className="flex items-center gap-1">
													<Phone className="w-4 h-4" />
													<span>{caterer.telephone}</span>
												</div>
											)}
											{caterer.email && (
												<div className="flex items-center gap-1">
													<Mail className="w-4 h-4" />
													<a 
														href={`mailto:${caterer.email}`}
														className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
													>
														{caterer.email}
													</a>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Menu Configuration */}
						<Card>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
									<div className="md:col-span-3">
										<Label htmlFor="menu">Menu</Label>
										<Select
											value={selectedMenu?.id.toString()}
											onValueChange={(value) => {
												const menu = caterer.menus.find((m) => m.id === value);
												setSelectedMenu(menu || null);
												// Update pax count to respect minimum order
												if (menu) {
													setPaxCount(prev => Math.max(prev, menu.minimumOrder ?? 1));
												}
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{caterer.menus.map((menu) => (
													<SelectItem key={menu.id} value={menu.id}>
														{`${menu.code}`}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="md:col-start-4 md:col-span-2 md:row-span-2">
										<Label>Minumum Order for Free Delivery</Label>
										<div className="text-2xl font-bold text-black-600 text-center">
											{selectedMenu?.minimumOrderForFreeDelivery} pax
										</div>
										<div className="text-sm text-gray-600 text-center mt-1">
											Min Order: {selectedMenu?.minimumOrder} pax
										</div>
									</div>

									<div className="md:col-start-6 md:row-span-2">
										<Label>Price per Pax</Label>
										<div className="text-2xl font-bold text-orange-600">
											${selectedMenu?.pricePerPerson.toFixed(2)}
										</div>
										{selectedMenu && (
											<div className="text-xs relative group">
												<span>Discount Info ⓘ</span>
												<div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10">
													{discountFields.map(({ key, label }) => {
														const value = (selectedMenu as any)[key];
														if (value == null || value === 0) return null;
														return (
															<div key={key}>
																{value}% discount applied to {label}
															</div>
														);
													})}
												</div>
											</div>
										)}
									</div>
									<div>
										<Label htmlFor="pax">Number of Pax</Label>
										<Input className="text-center"
											type="number"
											value={paxCount}
											onChange={(e) => {
												const newValue = Number.parseInt(e.target.value) || 0;
												setPaxCount(newValue);
											}}
											onBlur={(e) => {
												const newValue = Number.parseInt(e.target.value) || 0;
												const minOrder = selectedMenu?.minimumOrder ?? 1;
												setPaxCount(Math.max(newValue, minOrder));
											}}
											min={selectedMenu?.minimumOrder ?? 1}
										/>
									</div>
								</div>

								{/* Delivery Charges */}
								<div>
									<Label className="text-base font-medium mb-3 block">
										Additional Delivery Charges
									</Label>
									<div className="space-y-2">
										<div className="flex items-center space-x-2">
											<Checkbox
												checked={deliveryCharges.includes("cbd")}
												onCheckedChange={(checked) => {
													if (checked) {
														setDeliveryCharges([...deliveryCharges, "cbd"]);
													} else {
														setDeliveryCharges(
															deliveryCharges.filter((c) => c !== "cbd"),
														);
													}
												}}
											/>
											<Label 
												htmlFor="cbd" 
												className="text-sm cursor-pointer"
												onClick={() => {
													const isChecked = deliveryCharges.includes("cbd");
													if (isChecked) {
														setDeliveryCharges(deliveryCharges.filter((c) => c !== "cbd"));
													} else {
														setDeliveryCharges([...deliveryCharges, "cbd"]);
													}
												}}
											>
												CBD areas which will pass through ERPs (+$35)
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<Checkbox
												checked={deliveryCharges.includes("odd-hours")}
												onCheckedChange={(checked) => {
													if (checked) {
														setDeliveryCharges([
															...deliveryCharges,
															"odd-hours",
														]);
													} else {
														setDeliveryCharges(
															deliveryCharges.filter((c) => c !== "odd-hours"),
														);
													}
												}}
											/>
											<Label 
												htmlFor="odd-hours" 
												className="text-sm cursor-pointer"
												onClick={() => {
													const isChecked = deliveryCharges.includes("odd-hours");
													if (isChecked) {
														setDeliveryCharges(deliveryCharges.filter((c) => c !== "odd-hours"));
													} else {
														setDeliveryCharges([...deliveryCharges, "odd-hours"]);
													}
												}}
											>
												Odd hours between 12am before 6am (+$30)
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<Checkbox
												checked={deliveryCharges.includes("no-lift")}
												onCheckedChange={(checked) => {
													if (checked) {
														setDeliveryCharges([...deliveryCharges, "no-lift"]);
													} else {
														setDeliveryCharges(
															deliveryCharges.filter((c) => c !== "no-lift"),
														);
													}
												}}
											/>
											<Label 
												htmlFor="no-lift" 
												className="text-sm cursor-pointer"
												onClick={() => {
													const isChecked = deliveryCharges.includes("no-lift");
													if (isChecked) {
														setDeliveryCharges(deliveryCharges.filter((c) => c !== "no-lift"));
													} else {
														setDeliveryCharges([...deliveryCharges, "no-lift"]);
													}
												}}
											>
												No lift access (+$25 per floor)
											</Label>
										</div>
										{deliveryCharges.includes("no-lift") && (
											<div className="ml-6 mt-2">
												<Label htmlFor="floors" className="text-sm">
													Number of floors:
												</Label>
												<Input
													id="floors"
													type="number"
													value={floors}
													onChange={(e) => setFloors(Number(e.target.value) || 1)}
													min={1}
													className="w-20 mt-1"
												/>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Menu Items Selection */}
						{selectedMenu && (
							<Card>
								<CardHeader>
									<CardTitle>Menu Items Selection</CardTitle>
								</CardHeader>
								<CardContent>
									<Tabs defaultValue="0" className="w-full">
										<TabsList className="grid grid-cols-4 gap-1 gap-y-3 p-1 auto-rows-fr">
											{selectedMenu.sections.map((section, index) => (
												<TabsTrigger 
													key={section.id} 
													value={index.toString()}
													className="flex items-center gap-1 min-w-0 text-xs sm:text-sm justify-center"
												>
													<span className="truncate">{section.title}</span>
													{(selectedItems[section.id]?.length ?? 0) === section.selectionLimit && (
														<Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-green-600" />
													)}
												</TabsTrigger>
											))}
										</TabsList>

										{selectedMenu.sections.map((section, index) => (
											<TabsContent
												key={section.id}
												value={index.toString()}
												className="space-y-4"
											>
												<div className="bg-blue-50 p-4 rounded-lg">
													<h3 className="font-medium text-blue-900 mb-2">
														{section.title}
													</h3>
													<p className="text-sm text-blue-700 mb-2">
														{selectedMenu?.notes || section.description}
													</p>
													<p className="text-xs text-blue-600">
														Select {section.selectionLimit} item(s)
													</p>
												</div>

												<div className="grid gap-3">
													{section.items.map((item) => {
														const isSelected =
															selectedItems[section.id]?.includes(item.id) ||
															false;
														const currentSelections =
															selectedItems[section.id]?.length || 0;
														const canSelect =
															currentSelections < section.selectionLimit ||
															isSelected;

														return (
															<div
																key={item.id}
																className={`p-4 border rounded-lg transition-colors cursor-pointer ${
																	isSelected
																		? "border-orange-200 bg-orange-50"
																		: canSelect
																			? "border-gray-200 hover:border-gray-300"
																			: "border-gray-100 bg-gray-50"
																}`}
																onClick={() => {
																	if (canSelect) {
																		handleItemSelection(
																			section.id,
																			item.id,
																			!isSelected,
																		);
																	}
																}}
															>
																<div className="flex items-start space-x-3">
																	<Checkbox
																		checked={isSelected}
																		disabled={!canSelect}
																		onCheckedChange={(checked) =>
																			handleItemSelection(
																				section.id,
																				item.id,
																				checked as boolean,
																			)
																		}
																		className="mt-1"
																		onClick={(e) => e.stopPropagation()}
																	/>
																	<div className="flex-1">
																		<div className="flex items-center gap-2 mb-1">
																			<h4 className="font-medium text-gray-900">
																				{item.name}
																			</h4>
																			{item.vegetarian && (
																				<Badge
																					variant="outline"
																					className="text-green-600 border-green-200 text-xs"
																				>
																					Vegetarian
																				</Badge>
																			)}
																			{item.fried && (
																				<Badge
																					variant="outline"
																					className="text-orange-900 border-orange-700 text-xs"
																				>
																					Deep Fried
																				</Badge>
																			)}
																		</div>
																	</div>
																</div>
															</div>
														);
													})}
												</div>
											</TabsContent>
										))}
									</Tabs>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Card className="sticky top-4">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calculator className="w-5 h-5" />
									Order Summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{selectedMenu && (
									<>
										<div className="space-y-2">
											<div className="text-sm">
												<div className="flex justify-between items-center">
													<span className="font-medium">Selected Items:</span>
													<span className={`font-medium ${isSelectionComplete() ? 'text-green-600' : 'text-red-600'}`}>
														{isSelectionComplete() ? 'Complete ✓' : 'X Incomplete Menu Selection'}
													</span>
												</div>
												<div className="mt-1 space-y-1">
													{selectedMenu.sections.map((section) => {
														const selectedSectionItems = selectedItems[section.id] || [];
														return selectedSectionItems.map((itemId) => {
															const item = section.items.find(i => i.id === itemId);
															return item ? (
																<div key={itemId} className="text-xs text-gray-600 ml-2">
																	• {item.name}
																</div>
															) : null;
														});
													})}
													{Object.values(selectedItems).every(items => items.length === 0) && (
														<div className="text-xs text-gray-400 ml-2">
															No items selected yet
														</div>
													)}
												</div>
											</div>
										</div>

										<Separator />

										<div className="space-y-2">
											<div className="flex justify-between">
												<span>{selectedMenu.code}{pricing.alphabet} ({paxCount} Pax)</span>
												<div className="text-right">
													{(pricing.discountRate ?? 0) > 0 ? (
														<>
															<div className="line-through text-gray-500">${pricing.subtotal.toFixed(2)}</div>
															<div className="text-green-600">${(pricing.subtotal * (1 - (pricing.discountRate ?? 0))).toFixed(2)}</div>
														</>
													) : (
														<span>${pricing.subtotal.toFixed(2)}</span>
													)}
												</div>
											</div>
											
											{/* Base Delivery Fee */}
											<div className="flex justify-between">
												<span>Delivery Fee</span>
												<div className="text-right">
													{paxCount >= (selectedMenu.minimumOrderForFreeDelivery ?? 0) ? (
														<span className="text-green-600">Free</span>
													) : (pricing.discountRate ?? 0) > 0 ? (
														<>
															<div className="line-through text-gray-500">${(pricing.baseDelivery ?? 0).toFixed(2)}</div>
															<div className="text-green-600">${((pricing.baseDelivery ?? 0) * (1 - (pricing.discountRate ?? 0))).toFixed(2)}</div>
														</>
													) : (
														<span>${(pricing.baseDelivery ?? 0).toFixed(2)}</span>
													)}
												</div>
											</div>
											
											{/* Additional Delivery Fees */}
											{(pricing.additionalDeliveryItems ?? []).map((item, index) => (
												<div key={index} className="flex justify-between">
													<span className="text-sm text-gray-600">{item.label}</span>
													<div className="text-right">
														{(pricing.discountRate ?? 0) > 0 ? (
															<>
																<div className="line-through text-gray-500">${item.amount.toFixed(2)}</div>
																<div className="text-green-600">${(item.amount * (1 - (pricing.discountRate ?? 0))).toFixed(2)}</div>
															</>
														) : (
															<span>${item.amount.toFixed(2)}</span>
														)}
													</div>
												</div>
											))}
											
											<div className="flex justify-between">
												<span>Admin Fee 1.5%</span>
												<span>${pricing.adminFee.toFixed(2)}</span>
											</div>
										</div>

										<Separator />

										<div className="flex justify-between text-lg font-bold">
											<span>Total</span>
											<span className="text-orange-600">
												${pricing.total.toFixed(2)}
											</span>
										</div>

										<div className="space-y-2 pt-4">
											<Button
												className="w-full bg-orange-500 hover:bg-orange-600"
												disabled={!isSelectionComplete()}
											>
												Book Now
											</Button>
											<Button
												variant="outline"
												className="w-full bg-transparent"
												asChild
											>
												<Link href={`/comparison?caterer=${caterer.id}&menu=${selectedMenu?.id}`}>
													Add to Compare
												</Link>
											</Button>
										</div>

										{!isSelectionComplete() && (
											<p className="text-xs text-red-600 text-center">
												Please complete all menu selections to proceed
											</p>
										)}
									</>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
