"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { CatererData, CatererMenuData } from "~/server/api/routers/caterer";
import { CatererMenu } from "@prisma/client";

export default function CatererDisplay({ caterer }: { caterer: CatererData }) {
	const router = useRouter();
	const [selectedMenu, setSelectedMenu] = useState<CatererMenuData | null>(
		caterer.menus[0] ?? null,
	);
	const [paxCount, setPaxCount] = useState(20);
	const [selectedItems, setSelectedItems] = useState<{
		[sectionId: string]: string[];
	}>({});
	const [deliveryCharges, setDeliveryCharges] = useState<string[]>([]);

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
			return { subtotal: 0, discount: 0, adminFee: 0, delivery: 0, total: 0 };

		const subtotal = selectedMenu.pricePerPerson * paxCount;
		const discount = subtotal * 1;
		const adminFee = subtotal * 1;
		const delivery = deliveryCharges.length > 0 ? 35 : 0; // Mock delivery charge
		const total = subtotal - discount + adminFee + delivery;

		return { subtotal, discount, adminFee, delivery, total };
	};

	const isSelectionComplete = () => {
		if (!selectedMenu) return false;

		return selectedMenu.sections.every((section) => {
			const selections = selectedItems[section.id] || [];
			return (
				selections.length >= 0 && selections.length <= section.selectionLimit
			);
		});
	};

	const pricing = calculateTotal();

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Vendor Info & Menu Selection */}
					<div className="lg:col-span-2 space-y-6">
						{/* Vendor Header */}
						<Card>
							<CardContent className="p-6">
								<div className="flex flex-col md:flex-row gap-6">
									<img
										src="https://placehold.co/600x400.png"
										alt={caterer.name}
										className="w-full md:w-48 h-48 object-cover rounded-lg"
									/>
									<div className="flex-1">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h1 className="text-2xl font-bold text-gray-900 mb-2">
													{caterer.name}
												</h1>
												<Badge variant="secondary" className="mb-2">
													Western
												</Badge>
											</div>
											<Button variant="outline">
												<ShoppingCart className="w-4 h-4 mr-2" />
												Add to Compare
											</Button>
										</div>

										<div className="flex items-center gap-4 mb-4">
											<div className="flex items-center gap-1">
												<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
												<span className="font-medium">4.5</span>
												<span className="text-gray-500">(100 reviews)</span>
											</div>
											<div className="flex items-center gap-1 text-gray-600">
												<MapPin className="w-4 h-4" />
												<span className="text-sm">Singapore</span>
											</div>
										</div>

										<p className="text-gray-600 mb-4">
											Lorem ipsum dolor sit amet consectetur adipisicing elit.
											Quisquam, quos.
										</p>

										<div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Phone className="w-4 h-4" />
												<span>+65 1234 5678</span>
											</div>
											<div className="flex items-center gap-1">
												<Mail className="w-4 h-4" />
												<span>info@example.com</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Menu Configuration */}
						<Card>
							<CardHeader>
								<CardTitle>Menu Configuration</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label htmlFor="menu">Menu</Label>
										<Select
											value={selectedMenu?.id.toString()}
											onValueChange={(value) => {
												const menu = caterer.menus.find((m) => m.id === value);
												setSelectedMenu(menu || null);
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{caterer.menus.map((menu) => (
													<SelectItem key={menu.id} value={menu.id}>
														{`${menu.pricePerPerson}/pax`}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="pax">Number of Pax</Label>
										<Input
											type="number"
											value={paxCount}
											onChange={(e) =>
												setPaxCount(Number.parseInt(e.target.value) || 0)
											}
											min={1} //FIX
										/>
									</div>

									<div>
										<Label>Price per Pax</Label>
										<div className="text-2xl font-bold text-orange-600">
											${selectedMenu?.pricePerPerson.toFixed(2)}
										</div>
										{selectedMenu && (
											<p className="text-xs text-green-600">
												{selectedMenu.discounts.map((discount) => (
													<>
														{discount.discount}% discount applied to{" "}
														{discount.type}
													</>
												))}
											</p>
										)}
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
											<Label htmlFor="cbd" className="text-sm">
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
											<Label htmlFor="odd-hours" className="text-sm">
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
											<Label htmlFor="no-lift" className="text-sm">
												No lift access (+$25 per floor)
											</Label>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Menu Items Selection */}
						{selectedMenu && (
							<Card>
								<CardHeader>
									<CardTitle>Menu Items Selection</CardTitle>
									<p className="text-sm text-gray-600">Lorem IPsum</p>
								</CardHeader>
								<CardContent>
									<Tabs defaultValue="0" className="w-full">
										<TabsList className="grid w-full grid-cols-3">
											{selectedMenu.sections.map((section, index) => (
												<TabsTrigger key={section.id} value={index.toString()}>
													{section.title}
													{selectedItems[section.id] && (
														<Check className="w-4 h-4 ml-2 text-green-600" />
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
														{section.description}
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
																className={`p-4 border rounded-lg transition-colors ${
																	isSelected
																		? "border-orange-200 bg-orange-50"
																		: canSelect
																			? "border-gray-200 hover:border-gray-300"
																			: "border-gray-100 bg-gray-50"
																}`}
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
																	/>
																	<div className="flex-1">
																		<h4 className="font-medium text-gray-900 mb-1">
																			{item.name}
																		</h4>
																		<p className="text-sm text-gray-600 mb-2">
																			Lorem Ipsum
																		</p>
																		<div className="flex gap-2">
																			{item.vegetarian && (
																				<Badge
																					variant="outline"
																					className="text-green-600 border-green-200"
																				>
																					Vegetarian
																				</Badge>
																			)}
																			{item.fried && (
																				<Badge
																					variant="outline"
																					className="text-blue-600 border-blue-200"
																				>
																					Fried Food
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
											<div className="flex justify-between text-sm">
												<span>Menu: {selectedMenu.code}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Pax: {paxCount}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>
													Price per pax: $
													{selectedMenu.pricePerPerson.toFixed(2)}
												</span>
											</div>
										</div>

										<Separator />

										<div className="space-y-2">
											<div className="flex justify-between">
												<span>Subtotal</span>
												<span>${pricing.subtotal.toFixed(2)}</span>
											</div>
											{pricing.discount > 0 && (
												<div className="flex justify-between text-green-600">
													<span>Discount 0%</span>
													<span>-${pricing.discount.toFixed(2)}</span>
												</div>
											)}
											<div className="flex justify-between">
												<span>Admin Fee 0%</span>
												<span>${pricing.adminFee.toFixed(2)}</span>
											</div>
											{pricing.delivery > 0 && (
												<div className="flex justify-between">
													<span>Delivery Charges</span>
													<span>${pricing.delivery.toFixed(2)}</span>
												</div>
											)}
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
											>
												Add to Compare
											</Button>
										</div>

										{!isSelectionComplete() && (
											<p className="text-xs text-amber-600 text-center">
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
