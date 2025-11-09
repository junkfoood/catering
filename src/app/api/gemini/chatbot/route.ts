import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { CatererMenuType } from "@prisma/client";

// Labels for Categories (matching the frontend)
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

interface ChatbotPayload {
	message: string;
	criteria: {
		budget?: number;
		pax?: number;
		cuisine?: string;
		dietaryRestrictions?: string[];
		eventType?: string;
		menuCategories?: CatererMenuType[];
	};
	conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

interface MenuData {
	catererId: string;
	catererName: string;
	menuId: string;
	menuCode: string;
	pricePerPerson: number;
	minimumOrder: number;
	menuType: string;
	notes?: string | null;
	hasVegetarian: boolean;
}

export async function POST(req: NextRequest) {
	try {
		const payload: ChatbotPayload = await req.json();
		const { message, criteria, conversationHistory = [] } = payload;

		// Verify API key is available
		if (!env.GEMINI_API_KEY_CHAT) {
			console.error("GEMINI_API_KEY_CHAT is not set");
			return NextResponse.json(
				{ error: "Gemini API key is not configured. Please contact support." },
				{ status: 500 },
			);
		}

		// Query database with optimized Prisma queries
		const paxCount = criteria.pax || 20;
		// Budget is now per pax, so calculate total budget
		const budgetPerPax = criteria.budget || 10;
		const budget = budgetPerPax * paxCount;

		// Build where clause for menu filtering
		const menuWhere: any = {
			minimumOrder: { lte: paxCount },
		};

		// Filter by budget: pricePerPerson * paxCount <= budget
		// We'll filter this in JavaScript after fetching since Prisma doesn't support computed fields in where
		const menus = await db.catererMenu.findMany({
			where: menuWhere,
			select: {
				id: true,
				code: true,
				pricePerPerson: true,
				minimumOrder: true,
				type: true,
				notes: true,
				catererID: true,
				caterer: {
					select: {
						id: true,
						name: true,
					},
				},
				sections: {
					select: {
						items: {
							select: {
								vegetarian: true,
							},
						},
					},
				},
			},
			take: 50, // Fetch more initially, then filter
		});

		// Filter menus by budget and other criteria
		let filteredMenus: MenuData[] = menus
			.map((menu) => {
				const totalCost = menu.pricePerPerson * paxCount;
				const hasVegetarian = menu.sections.some((section) =>
					section.items.some((item) => item.vegetarian),
				);

				return {
					catererId: menu.caterer.id,
					catererName: menu.caterer.name,
					menuId: menu.id,
					menuCode: menu.code,
					pricePerPerson: menu.pricePerPerson,
					minimumOrder: menu.minimumOrder,
					menuType: menu.type,
					notes: menu.notes,
					hasVegetarian,
				};
			})
			.filter((menu) => {
				const totalCost = menu.pricePerPerson * paxCount;
				// Budget filter
				if (totalCost > budget) return false;

				// Menu categories filter
				if (
					criteria.menuCategories &&
					criteria.menuCategories.length > 0 &&
					!criteria.menuCategories.includes(menu.menuType as CatererMenuType)
				)
					return false;

				// Dietary restrictions filter
				if (
					criteria.dietaryRestrictions?.includes("Vegetarian") &&
					!menu.hasVegetarian
				)
					return false;

				// Cuisine filter (basic matching on menu type)
				if (criteria.cuisine) {
					const cuisineLower = criteria.cuisine.toLowerCase();
					const menuTypeLower = menu.menuType.toLowerCase();
					if (
						cuisineLower === "malay" &&
						!menuTypeLower.includes("malay")
					)
						return false;
					if (
						cuisineLower === "indian" &&
						!menuTypeLower.includes("indian")
					)
						return false;
					if (
						cuisineLower === "chinese" &&
						!menuTypeLower.includes("chinese")
					)
						return false;
				}

				return true;
			})
			.sort((a, b) => {
				// Sort by price per person (ascending)
				return a.pricePerPerson - b.pricePerPerson;
			})
			.slice(0, 20); // Limit to top 20 matches

		// Build context prompt with menu data
		const menuContext = filteredMenus
			.map((menu) => {
				const totalCost = menu.pricePerPerson * paxCount;
				const menuTypeLabel = categoryLabels[menu.menuType as CatererMenuType] || menu.menuType;
				return `- ${menu.catererName} - ${menu.menuCode}:
  • Price per person: $${menu.pricePerPerson.toFixed(2)}
  • Estimated total for ${paxCount} pax: $${totalCost.toFixed(2)}
  • Minimum order: ${menu.minimumOrder} pax
  • Menu type: ${menuTypeLabel}
  ${menu.notes ? `• Notes: ${menu.notes}` : ""}
  • Has vegetarian options: ${menu.hasVegetarian ? "Yes" : "No"}
  • Menu ID: ${menu.menuId}
  • Caterer ID: ${menu.catererId}`;
			})
			.join("\n\n");

		// Build conversation history context
		const historyContext =
			conversationHistory.length > 0
				? conversationHistory
						.slice(-6) // Last 3 exchanges (6 messages)
						.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
						.join("\n")
				: "";

		// Construct the prompt for Gemini
		const prompt = `You are a helpful catering menu recommendation assistant. Your role is to help users find suitable catering menus based on their requirements.

User Requirements:
- Budget per pax: $${budgetPerPax}
- Number of people: ${paxCount}
- Total budget: $${budget}
${criteria.cuisine ? `- Cuisine preference: ${criteria.cuisine}` : ""}
${criteria.dietaryRestrictions?.length ? `- Dietary restrictions: ${criteria.dietaryRestrictions.join(", ")}` : ""}
${criteria.eventType ? `- Event type: ${criteria.eventType}` : ""}

${historyContext ? `\nPrevious conversation:\n${historyContext}\n` : ""}

Available Menus (filtered based on requirements):
${menuContext || "No menus match the exact criteria, but here are some options:"}

Current User Message: ${message}

Instructions:
1. Provide a natural, conversational response to the user's message
2. Recommend 2-5 menus from the available menus list that best match their requirements
3. For each recommended menu, mention:
   - Caterer name and menu code
   - Price per person and estimated total
   - Why it's a good fit for their requirements
4. Format menu recommendations clearly with the exact menu code and caterer name
5. If no menus match perfectly, suggest the closest alternatives and explain why
6. Be helpful and friendly in your tone
7. Do not use markdown formatting - use plain text with bullet points (•)
8. When referring to menu types, use the human-readable labels (e.g., "Small Quantity Refreshments" instead of "SMALL_QTY_REFRESHMENT")

When mentioning menus, use this format:
• [Caterer Name] - [Menu Code]: [Brief description] (Price: $X.XX per person, Total: $X.XX for ${paxCount} pax)`;

		// Call Gemini API - using gemini-2.0-flash-001
		const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${env.GEMINI_API_KEY_CHAT}`;

		// Safety settings - block low and above for all harm categories
		const safetySettings = [
			{
				category: "HARM_CATEGORY_HARASSMENT",
				threshold: "BLOCK_LOW_AND_ABOVE",
			},
			{
				category: "HARM_CATEGORY_HATE_SPEECH",
				threshold: "BLOCK_LOW_AND_ABOVE",
			},
			{
				category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
				threshold: "BLOCK_LOW_AND_ABOVE",
			},
			{
				category: "HARM_CATEGORY_DANGEROUS_CONTENT",
				threshold: "BLOCK_LOW_AND_ABOVE",
			},
			{
				category: "HARM_CATEGORY_CIVIC_INTEGRITY",
				threshold: "BLOCK_LOW_AND_ABOVE",
			},
		];

		const requestBody = {
			contents: [
				{
					parts: [
						{
							text: prompt,
						},
					],
				},
			],
			safetySettings: safetySettings,
		};

		const response = await fetch(geminiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			let errorMessage = "Failed to get response. Please try again.";
			try {
				const errorData = await response.json();
				console.error("Gemini API error:", {
					status: response.status,
					message: errorData.error?.message || errorData.error || "Unknown error",
				});
				errorMessage = errorData.error?.message || errorData.error || errorMessage;
			} catch {
				console.error("Gemini API error (text):", response.status);
			}
			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status },
			);
		}

		const data = await response.json();
		console.log("Gemini API response received successfully");

		// Extract the generated text from Gemini response
		const generatedText =
			data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!generatedText) {
			console.error("No text in Gemini response");
			return NextResponse.json(
				{ error: "Gemini API did not return any text. Please try again." },
				{ status: 500 },
			);
		}

		// Extract menu suggestions from the response
		// Try to match menu codes and caterer names from the response
		const menuSuggestions = filteredMenus
			.filter((menu) => {
				const responseLower = generatedText.toLowerCase();
				const menuCodeLower = menu.menuCode.toLowerCase();
				const catererNameLower = menu.catererName.toLowerCase();
				return (
					responseLower.includes(menuCodeLower) ||
					responseLower.includes(catererNameLower)
				);
			})
			.slice(0, 5) // Limit to top 5 suggestions
			.map((menu) => ({
				catererId: menu.catererId,
				catererName: menu.catererName,
				menuId: menu.menuId,
				menuCode: menu.menuCode,
				pricePerPerson: menu.pricePerPerson,
				estimatedTotal: menu.pricePerPerson * paxCount,
			}));

		return NextResponse.json({
			text: generatedText,
			menuSuggestions: menuSuggestions,
		});
	} catch (error) {
		console.error("Error in chatbot API:", error);
		return NextResponse.json(
			{ error: "An error occurred while processing your request." },
			{ status: 500 },
		);
	}
}

