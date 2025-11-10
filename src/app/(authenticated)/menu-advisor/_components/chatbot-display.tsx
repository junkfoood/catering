"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import {
	SprayCan,
	X,
} from "lucide-react";
import { Checkbox } from "@components/ui/checkbox";
import { Separator } from "@components/ui/separator";
import { CatererMenuType } from "@prisma/client";

interface Message {
	role: "user" | "assistant";
	content: string;
	menuSuggestions?: MenuSuggestion[];
}

interface MenuSuggestion {
	catererId: string;
	catererName: string;
	menuId: string;
	menuCode: string;
	pricePerPerson: number;
	estimatedTotal: number;
}

interface ChatbotCriteria {
	budget?: number;
	pax?: number;
	cuisine?: string;
	dietaryRestrictions?: string[];
	eventType?: string;
	menuCategories?: CatererMenuType[];
}

// Labels for Categories
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

export default function ChatbotDisplay() {
	const [showForm, setShowForm] = useState(true);
	const [criteria, setCriteria] = useState<ChatbotCriteria>({
		budget: undefined,
		pax: undefined,
		cuisine: "",
		dietaryRestrictions: [],
		eventType: "",
		menuCategories: [],
	});
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [conversationHistory, setConversationHistory] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([]);

	const handleSubmitForm = () => {
		if (!criteria.budget || !criteria.pax) {
			alert("Please fill in budget per pax and pax count");
			return;
		}

		const totalBudget = criteria.budget && criteria.pax ? criteria.budget * criteria.pax : 0;
		const categoryLabelsText = criteria.menuCategories?.length
			? criteria.menuCategories.map(cat => categoryLabels[cat]).join(", ")
			: "";
		const initialMessage = `I'm looking for catering options with:
- Budget per pax: $${criteria.budget}
- Number of people: ${criteria.pax}
- Total budget: $${totalBudget}
${criteria.cuisine ? `- Cuisine preference: ${criteria.cuisine}` : ""}
${criteria.dietaryRestrictions?.length ? `- Dietary restrictions: ${criteria.dietaryRestrictions.join(", ")}` : ""}
${criteria.eventType ? `- Event type: ${criteria.eventType}` : ""}
${categoryLabelsText ? `- Menu categories: ${categoryLabelsText}` : ""}

Can you suggest some suitable menus?`;

		setMessages([{ role: "user", content: initialMessage }]);
		setConversationHistory([
			{ role: "user", content: initialMessage },
		]);
		setShowForm(false);
		handleSendMessage(initialMessage);
	};

	const handleSendMessage = async (messageText?: string) => {
		const text = messageText || inputMessage.trim();
		if (!text && !messageText) return;

		const userMessage: Message = { role: "user", content: text };
		setMessages((prev) => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/gemini/chatbot", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: text,
					criteria: criteria,
					conversationHistory: conversationHistory,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to get response");
			}

			const data = await response.json();
			const assistantMessage: Message = {
				role: "assistant",
				content: data.text || data.response || "No response generated",
				menuSuggestions: data.menuSuggestions,
			};

			setMessages((prev) => [...prev, assistantMessage]);
			setConversationHistory((prev) => [
				...prev,
				{ role: "user", content: text },
				{ role: "assistant", content: assistantMessage.content },
			]);
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage: Message = {
				role: "assistant",
				content: `Error: ${error instanceof Error ? error.message : "Failed to get response. Please try again."}`,
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="container mx-auto p-4 max-w-6xl">
			<Card className="h-[calc(100vh-8rem)] flex flex-col">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Menu Advisor (Take suggestions with a grain of salt<SprayCan className="w-4 h-4 inline-block ml-2" />)</CardTitle>
					{!showForm && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								setShowForm(true);
								setMessages([]);
								setConversationHistory([]);
							}}
						>
							<X className="w-5 h-5" />
						</Button>
					)}
				</CardHeader>
				<CardContent className="flex-1 flex flex-col overflow-hidden">
					{showForm ? (
						<div className="space-y-4 overflow-y-auto">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="budget">Budget per Pax ($)</Label>
									<Input
										id="budget"
										type="number"
										placeholder="e.g., 10"
										value={criteria.budget || ""}
										onChange={(e) =>
											setCriteria({
												...criteria,
												budget: e.target.value
													? Number(e.target.value)
													: undefined,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="pax">Number of People</Label>
									<Input
										id="pax"
										type="number"
										placeholder="e.g., 50"
										value={criteria.pax || ""}
										onChange={(e) =>
											setCriteria({
												...criteria,
												pax: e.target.value
													? Number(e.target.value)
													: undefined,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="cuisine">Cuisine Preference</Label>
									<Select
										value={criteria.cuisine || undefined}
										onValueChange={(value) =>
											setCriteria({ ...criteria, cuisine: value || undefined })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select cuisine (optional)" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Chinese">Chinese</SelectItem>
											<SelectItem value="Malay">Malay</SelectItem>
											<SelectItem value="Indian">Indian</SelectItem>
											<SelectItem value="Western">Western</SelectItem>
											<SelectItem value="International">International</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="eventType">Event Type</Label>
									<Select
										value={criteria.eventType || undefined}
										onValueChange={(value) =>
											setCriteria({ ...criteria, eventType: value || undefined })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select event type (optional)" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Meeting">Meeting</SelectItem>
											<SelectItem value="Conference">Conference</SelectItem>
											<SelectItem value="Workshop">Workshop</SelectItem>
											<SelectItem value="Celebration">Celebration</SelectItem>
											<SelectItem value="Reception">Reception</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div>
								<Label>Dietary Restrictions</Label>
								<div className="flex flex-wrap gap-4 mt-2">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="vegetarian"
											checked={criteria.dietaryRestrictions?.includes(
												"Vegetarian",
											)}
											onCheckedChange={(checked) => {
												const restrictions =
													criteria.dietaryRestrictions || [];
												if (checked) {
													setCriteria({
														...criteria,
														dietaryRestrictions: [
															...restrictions,
															"Vegetarian",
														],
													});
												} else {
													setCriteria({
														...criteria,
														dietaryRestrictions: restrictions.filter(
															(r) => r !== "Vegetarian",
														),
													});
												}
											}}
										/>
										<Label htmlFor="vegetarian" className="cursor-pointer">
											Vegetarian
										</Label>
									</div>
								</div>
							</div>
							<div>
								<Label>Menu Categories (optional)</Label>
								<div className="flex flex-wrap gap-4 mt-2">
									{Object.values(CatererMenuType).map((category) => (
										<div key={category} className="flex items-center space-x-2">
											<Checkbox
												id={category}
												checked={criteria.menuCategories?.includes(category)}
												onCheckedChange={(checked) => {
													const categories = criteria.menuCategories || [];
													if (checked) {
														setCriteria({
															...criteria,
															menuCategories: [...categories, category],
														});
													} else {
														setCriteria({
															...criteria,
															menuCategories: categories.filter(
																(c) => c !== category,
															),
														});
													}
												}}
											/>
											<Label htmlFor={category} className="cursor-pointer">
												{categoryLabels[category]}
											</Label>
										</div>
									))}
								</div>
							</div>
							<Button onClick={handleSubmitForm} className="w-full">
								Start Chat
							</Button>
						</div>
					) : (
						<>
							<div className="flex-1 overflow-y-auto space-y-4 mb-4">
								{messages.map((message, index) => (
									<div
										key={index}
										className={`flex gap-3 ${
											message.role === "user"
												? "justify-end"
												: "justify-start"
										}`}
									>
										{message.role === "assistant" && (
											<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
												<Bot className="w-5 h-5 text-primary-foreground" />
											</div>
										)}
										<div
											className={`max-w-[80%] rounded-lg p-3 ${
												message.role === "user"
													? "bg-primary text-primary-foreground"
													: "bg-muted"
											}`}
										>
											<div className="whitespace-pre-wrap">
												{message.content}
											</div>
											{message.menuSuggestions &&
												message.menuSuggestions.length > 0 && (
													<div className="mt-4 space-y-2">
														<Separator />
														<div className="text-sm font-semibold">
															Menu Suggestions:
														</div>
														{message.menuSuggestions.map((menu, idx) => (
															<Card key={idx} className="mt-2">
																<CardContent className="p-3">
																	<div className="font-semibold">
																		{menu.catererName} - {menu.menuCode}
																	</div>
																	<div className="text-sm text-muted-foreground mt-1">
																		Price per person: $
																		{menu.pricePerPerson.toFixed(2)}
																	</div>
																	<div className="text-sm text-muted-foreground">
																		Estimated total: $
																		{menu.estimatedTotal.toFixed(2)}
																	</div>
																	<Button
																		asChild
																		variant="outline"
																		size="sm"
																		className="mt-2"
																	>
																	<Link
																		href={`/caterer/${menu.catererId}?menu=${menu.menuId}`}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																			View Menu
																		</Link>
																	</Button>
																</CardContent>
															</Card>
														))}
													</div>
												)}
										</div>
										{message.role === "user" && (
											<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
												<User className="w-5 h-5 text-primary-foreground" />
											</div>
										)}
									</div>
								))}
								{isLoading && (
									<div className="flex gap-3 justify-start">
										<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
											<Bot className="w-5 h-5 text-primary-foreground" />
										</div>
										<div className="bg-muted rounded-lg p-3">
											<Loader2 className="w-5 h-5 animate-spin" />
										</div>
									</div>
								)}
							</div>
							<div className="flex gap-2">
								<Textarea
									value={inputMessage}
									onChange={(e) => setInputMessage(e.target.value)}
									onKeyDown={handleKeyPress}
									placeholder="Type your message..."
									className="flex-1"
									rows={2}
								/>
								<Button
									onClick={() => handleSendMessage()}
									disabled={isLoading || !inputMessage.trim()}
								>
									{isLoading ? (
										<Loader2 className="w-5 h-5 animate-spin" />
									) : (
										<Send className="w-5 h-5" />
									)}
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

