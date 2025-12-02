import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { CatererMenuType, CatererMenuSectionItem } from "@prisma/client";

// Simple in-memory cache for API responses (TTL: 5 minutes)
interface CacheEntry {
	response: { text: string; menuSuggestions: any[] };
	timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to generate cache key from criteria
function getCacheKey(criteria: ChatbotPayload["criteria"], message: string): string {
	return JSON.stringify({
		budget: criteria.budget,
		pax: criteria.pax,
		cuisine: criteria.cuisine,
		dietaryRestrictions: criteria.dietaryRestrictions?.sort(),
		eventType: criteria.eventType,
		menuCategories: criteria.menuCategories?.sort(),
		message: message.toLowerCase().trim(),
	});
}

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

// Cuisine keywords for matching dishes
const cuisineKeywords: Record<string, string[]> = {
	chinese: [
		"chinese", "sweet and sour", "kung pao", "mapo", "szechuan", "sichuan",
		"dim sum", "char siu", "peking", "beijing", "cantonese", "hunan",
		"wonton", "dumpling", "spring roll", "fried rice", "chow mein", "lo mein",
		"general tso", "orange chicken", "moo shu", "hot and sour", "egg roll",
		"chow fun", "chop suey", "moo goo", "szechuan", "kung pao chicken",
		"beef broccoli", "cashew chicken", "lemon chicken", "sesame chicken",
		"honey chicken", "teriyaki", "sweet and sour pork", "sweet and sour chicken",
		"mongolian beef", "orange beef", "black bean", "garlic sauce", "oyster sauce",
		"soy sauce", "hoisin", "szechuan pepper", "five spice", "char siu bao",
		"har gow", "siu mai", "xiao long bao", "turnip cake", "radish cake",
		"chicken feet", "phoenix claws", "bbq pork", "roast duck", "peking duck"
	],
	malay: [
		"malay", "nasi lemak", "rendang", "satay", "laksa", "mee goreng",
		"nasi goreng", "ayam goreng", "ikan bakar", "sambal", "belacan",
		"curry", "coconut", "lemongrass", "galangal", "ketupat", "otak otak",
		"roti canai", "roti jala", "nasi kerabu", "nasi dagang", "nasi ulam",
		"ayam percik", "ikan asam pedas", "gulai", "masak lemak", "sambal udang",
		"kerabu", "ulam", "acar", "serunding", "rempeyek", "kuih"
	],
	indian: [
		"indian", "curry", "biryani", "tandoori", "masala", "dal", "dhal",
		"naan", "roti", "paratha", "chapati", "samosa", "pakora", "bhaji",
		"tikka", "vindaloo", "korma", "butter chicken", "chicken tikka",
		"lamb curry", "paneer", "palak", "saag", "aloo", "gobi", "baingan",
		"rajma", "chana", "sambar", "rasam", "dosa", "idli", "uttapam",
		"pulao", "pulaav", "pulao", "raita", "chutney", "pickle", "achar",
		"gulab jamun", "kheer", "halwa", "ladoo", "barfi"
	]
};

// Helper function to check if a dish name matches cuisine keywords
function dishMatchesCuisine(dishName: string, cuisine: string): boolean {
	const cuisineLower = cuisine.toLowerCase();
	const dishNameLower = dishName.toLowerCase();
	
	// Check if cuisine has keywords defined
	const keywords = cuisineKeywords[cuisineLower];
	if (!keywords) return false;
	
	// Check if any keyword matches the dish name
	return keywords.some(keyword => dishNameLower.includes(keyword));
}

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
	sections?: Array<{
		title: string;
		description?: string | null;
		items: Array<{
			id: string;
			name: string;
			vegetarian: boolean;
			fried: boolean;
			order: number;
		}>;
	}>;
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

		// Check cache (only for initial queries without conversation history)
		if (conversationHistory.length === 0) {
			const cacheKey = getCacheKey(criteria, message);
			const cached = responseCache.get(cacheKey);
			if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
				return NextResponse.json(cached.response);
			}
		}

		// Query database with optimized Prisma queries
		const paxCount = criteria.pax || 20;
		// Budget is now per pax, so calculate total budget
		const budgetPerPax = criteria.budget || 10;
		const budget = budgetPerPax * paxCount;

		// Build where clause for menu filtering (SQL-level filtering to reduce data fetched)
		// Allow menus with minimumOrder up to 1.5x paxCount for flexibility (e.g., 20 pax can see menus up to 30 min)
		const menuWhere: any = {
			minimumOrder: { lte: Math.ceil(paxCount * 1.5) },
			// Filter by menu categories at SQL level if specified
			...(criteria.menuCategories &&
				criteria.menuCategories.length > 0 && {
					type: { in: criteria.menuCategories },
				}),
		};

		// Filter by budget: pricePerPerson * paxCount <= budget
		// We'll filter this in JavaScript after fetching since Prisma doesn't support computed fields in where
		// Fetch ALL menus that match basic criteria (no take limit) to ensure complete coverage
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
								name: true,
								vegetarian: true,
							},
						},
					},
				},
			},
			// Remove take limit to get ALL matching menus
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
					// Store original menu data for cuisine checking
					_originalMenu: menu,
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

				// Cuisine filter: include menus that either:
				// 1. Have menu type matching cuisine, OR
				// 2. Have dishes matching cuisine keywords
				if (criteria.cuisine) {
					const cuisineLower = criteria.cuisine.toLowerCase();
					const menuTypeLower = menu.menuType.toLowerCase();
					const menuTypeMatchesCuisine = 
						(cuisineLower === "malay" && menuTypeLower.includes("malay")) ||
						(cuisineLower === "indian" && menuTypeLower.includes("indian")) ||
						(cuisineLower === "chinese" && menuTypeLower.includes("chinese"));

					// Check if menu has dishes matching cuisine preference
					const hasCuisineDishes = menu._originalMenu.sections.some((section) =>
						section.items.some((item) => 
							dishMatchesCuisine(item.name, criteria.cuisine!)
						)
					);

					if (!menuTypeMatchesCuisine && !hasCuisineDishes) {
						return false;
					}
				}

				return true;
			})
			.map((menu) => {
				// Remove the temporary _originalMenu property
				const { _originalMenu, ...menuData } = menu;
				return menuData;
			})
			.sort((a, b) => {
				// Sort by price per person (ascending) - best matches first
				return a.pricePerPerson - b.pricePerPerson;
			})
			.slice(0, 30); // Increased to 30 to ensure all caterers are represented

		// Fetch full menu details (including items) only for filtered menus
		const filteredMenuIds = filteredMenus.map((m) => m.menuId);
		const menusWithItems = await db.catererMenu.findMany({
			where: {
				id: { in: filteredMenuIds },
			},
			select: {
				id: true,
				sections: {
					select: {
						title: true,
						description: true,
						order: true,
						items: {
							select: {
								id: true,
								name: true,
								vegetarian: true,
								fried: true,
								order: true,
							},
							orderBy: {
								order: "asc",
							},
							// Fetch ALL items - we'll summarize in the prompt
						},
					},
					orderBy: {
						order: "asc",
					},
					// Fetch ALL sections - we'll summarize in the prompt
				},
			},
		});

		// Merge item data into filteredMenus
		const menusWithItemsMap = new Map(
			menusWithItems.map((menu) => [
				menu.id,
				menu.sections.map((section) => ({
					title: section.title,
					description: section.description,
					items: section.items.map((item) => ({
						id: item.id,
						name: item.name,
						vegetarian: item.vegetarian,
						fried: item.fried,
						order: item.order,
					})),
				})),
			]),
		);

		filteredMenus = filteredMenus.map((menu) => ({
			...menu,
			sections: menusWithItemsMap.get(menu.menuId) || [],
		}));

		// Build context prompt with menu data - smart summarization to reduce tokens
		const menuContext = filteredMenus
			.map((menu) => {
				const totalCost = menu.pricePerPerson * paxCount;
				const menuTypeLabel = categoryLabels[menu.menuType as CatererMenuType] || menu.menuType;
				
				// Compact format: key info first
				let menuText = `${menu.catererName} - ${menu.menuCode} | $${menu.pricePerPerson.toFixed(2)}/pax | $${totalCost.toFixed(2)} total | ${menuTypeLabel}`;
				if (menu.hasVegetarian) menuText += " | V";
				
				// Summarize items compactly with IDs
				if (menu.sections && menu.sections.length > 0) {
					const allItems: Array<{ name: string; id: string }> = [];
					const vegetarianItems: Array<{ name: string; id: string }> = [];
					
					menu.sections.forEach((section) => {
						if (section.items && section.items.length > 0) {
							section.items.forEach((item) => {
								allItems.push({ name: item.name, id: item.id });
								if (item.vegetarian) vegetarianItems.push({ name: item.name, id: item.id });
							});
						}
					});
					
					// Smart summarization: show sample items with IDs + count
					if (allItems.length > 0) {
						// Show first 8-10 items as examples with IDs, then count
						const sampleSize = Math.min(10, allItems.length);
						const sampleItems = allItems.slice(0, sampleSize);
						const remainingCount = allItems.length - sampleSize;
						
						const itemsWithIds = sampleItems.map(item => `${item.name}[ID:${item.id}]`).join(", ");
						menuText += `\nItems: ${itemsWithIds}`;
						if (remainingCount > 0) {
							menuText += ` (+${remainingCount} more)`;
						}
						
						if (vegetarianItems.length > 0) {
							const vegSample = vegetarianItems.slice(0, 5).map(item => `${item.name}[ID:${item.id}]`).join(", ");
							const vegRemaining = vegetarianItems.length - Math.min(5, vegetarianItems.length);
							menuText += ` | Veg: ${vegSample}${vegRemaining > 0 ? ` (+${vegRemaining})` : ""}`;
						}
					}
				}
				
				menuText += ` | MenuID:${menu.menuId}`;

				return menuText;
			})
			.join("\n");

		// Build conversation history context (reduced to save tokens)
		const historyContext =
			conversationHistory.length > 0
				? conversationHistory
						.slice(-4) // Reduced from 6 to 4 messages (last 2 exchanges)
						.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content.slice(0, 200)}`) // Truncate long messages
						.join("\n")
				: "";

		// Construct the prompt for Gemini
		const prompt = `You are a helpful catering menu recommendation assistant. Your role is to help users find suitable catering menus based on their requirements.

CRITICAL: You MUST ONLY recommend menus from the "Available Menus" list provided below. DO NOT invent, create, or suggest any menus that are not explicitly listed in the "Available Menus" section. If a menu is not in that list, it does not exist and you must not mention it.

NOTE: The strict rule above applies to menu recommendations (caterer names and menu codes). However, you may freely use the human-readable labels for menu types (e.g., "Small Quantity Refreshments", "Tea Reception", etc.) when describing menu types, even if those labels are not explicitly shown in the menu list format.

User Requirements:
- Budget per pax: $${budgetPerPax}
- Number of people: ${paxCount}
- Total budget: $${budget}
${criteria.cuisine ? `- Cuisine preference: ${criteria.cuisine}` : ""}
${criteria.dietaryRestrictions?.length ? `- Dietary restrictions: ${criteria.dietaryRestrictions.join(", ")}` : ""}
${criteria.eventType ? `- Event type: ${criteria.eventType}` : ""}

${historyContext ? `\nPrevious conversation:\n${historyContext}\n` : ""}

Available Menus (ONLY recommend from this list - these are the ONLY menus available):
Format: [Caterer] - [Menu Code] | $[price]/pax | $[total] total | [Type] | V (if vegetarian) | Items: [item name[ID:itemId]] (+X more) | Veg: [veg items[ID:itemId]] | MenuID:[menuId]

Available Dishes (ONLY recommend from this list - these are the ONLY dishes available):
Each item shown in the menu items list above is a dish that can be recommended individually. Each dish has an ID shown as [ID:itemId] next to its name. You can recommend specific dishes by their exact name and ID.

${menuContext || "No menus match the exact criteria, but here are some options:"}

Current User Message: ${message}

Instructions:
1. Provide a natural, conversational response to the user's message
2. ONLY recommend menus and dishes from the "Available Menus" and "Available Dishes" lists above - DO NOT suggest any menus or dishes that are not in those lists
3. You can recommend:
   - Complete menus (up to 3 menus that best match their requirements)
   - Individual dishes/items from the available menus (if the user asks about specific dishes)
4. IMPORTANT - Cuisine Matching: When the user specifies a cuisine preference (e.g., Chinese, Malay, Indian):
   - Look for dishes WITHIN the menus that match the cuisine, even if the menu type doesn't explicitly mention the cuisine
   - For example, if the user wants Chinese food, look for Chinese dishes like "Sweet and Sour Chicken", "Kung Pao", "Dim Sum", "Fried Rice", etc. in the item lists
   - A menu can have Chinese dishes even if the menu type doesn't say "Chinese" - check the actual dish names in the Items list
   - Recommend menus that contain dishes matching the cuisine preference, highlighting those specific dishes
5. For each recommended menu, mention:
   - The EXACT caterer name and menu code as shown in the "Available Menus" list
   - Price per person and estimated total
   - Specific items/dishes from the menu that would be good choices (use the exact item names from the "Available Menus" list)
   - If cuisine preference was specified, highlight the dishes that match that cuisine
   - Why it's a good fit for their requirements
   - IMPORTANT: Do NOT include item IDs ([ID:...]) in your response - only mention the dish names
6. When recommending individual dishes:
   - Use the EXACT dish name as shown in the "Available Menus" list
   - Do NOT include the dish ID in your response - only mention the dish name
   - Mention which menu(s) the dish belongs to
7. Format menu recommendations clearly with the exact menu code and caterer name (must match exactly what's in the "Available Menus" list)
8. If no menus match perfectly, suggest the closest alternatives from the "Available Menus" list and explain why
9. Be helpful and friendly in your tone
10. Do not use markdown formatting - use plain text with bullet points (•)
11. When referring to menu types, you may use the human-readable labels (e.g., "Small Quantity Refreshments", "Tea Reception", "Packed Meals", etc.) - this is the ONLY exception to the strict "only use what's in the list" rule. You can use these labels freely when describing menu types.
12. REMEMBER: You can ONLY recommend menus (caterer names and menu codes) and dishes (item names) that appear in the "Available Menus" section. Any menu or dish not listed there does not exist in the database. However, menu type labels are an exception and can be used freely.
13. CRITICAL: The item IDs shown in the "Available Menus" list (format: [ID:itemId]) are for your reference only to verify which items exist in the database. DO NOT include these IDs in your response to the user. Only mention the dish names, never the IDs.

When mentioning menus, use this format:
• [Caterer Name] - [Menu Code]: [Brief description] (Price: $X.XX per person, Total: $X.XX for ${paxCount} pax)
  - Recommended items: [List specific item names from the menu, using exact names from the "Available Menus" list, e.g., "Dish Name", "Another Dish Name"]

When mentioning individual dishes, use this format:
• [Dish Name] - Available in [Caterer Name] - [Menu Code] menu

Make sure the caterer name, menu code, and item names match EXACTLY what is shown in the "Available Menus" list above. Never include item IDs in your response.`;

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

		const apiResponse = {
			text: generatedText,
			menuSuggestions: menuSuggestions,
		};

		// Cache the response (only for initial queries without conversation history)
		if (conversationHistory.length === 0) {
			const cacheKey = getCacheKey(criteria, message);
			responseCache.set(cacheKey, {
				response: apiResponse,
				timestamp: Date.now(),
			});

			// Clean up old cache entries (keep cache size manageable)
			if (responseCache.size > 100) {
				const now = Date.now();
				for (const [key, entry] of responseCache.entries()) {
					if (now - entry.timestamp > CACHE_TTL) {
						responseCache.delete(key);
					}
				}
			}
		}

		return NextResponse.json(apiResponse);
	} catch (error) {
		console.error("Error in chatbot API:", error);
		return NextResponse.json(
			{ error: "An error occurred while processing your request." },
			{ status: 500 },
		);
	}
}

