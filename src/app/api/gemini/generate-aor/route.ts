import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

interface AORPayload {
	background: {
		eventType: string;
		eventDate: string;
		fundingSource: string;
		approver: string;
	};
	order: {
		caterer: string;
		menu: string;
		paxCount: number;
		selectedItems: string[];
	};
	pricing: {
		subtotal: number;
		discount: number;
		delivery: number;
		adminFee: number;
		total: number;
		totalWithContingency: number;
	};
}

export async function POST(req: NextRequest) {
	try {
		const payload: AORPayload = await req.json();

		// Construct the prompt for Gemini
		const prompt = `You are generating an Approval of Request (AOR) email for a catering order. Please create a professional, clear email that looks natural and human-written (not robotic or overly formal).

IMPORTANT FORMATTING REQUIREMENTS:
- Write it as a normal email (not markdown with # or * symbols)
- Use plain text formatting, no markdown symbols
- Format the pricing in a proper table with clear columns
- Do NOT include any approval checkboxes, signature lines, or "point 5" sections
- End with a simple "Thank you" or "Thanks"

The email should include:

Background Information:
- Event Type/Purpose: ${payload.background.eventType || "[Not specified]"}
- Event Date/Timeline: ${payload.background.eventDate || "[Not specified]"}
- Funding Source: ${payload.background.fundingSource || "[Not specified]"}
- Approver: ${payload.background.approver || "[Not specified]"}

Order Details:
- Caterer: ${payload.order.caterer}
- Menu: ${payload.order.menu}
- Number of Pax: ${payload.order.paxCount}
- Selected Items: ${payload.order.selectedItems.join(", ") || "None selected"}

Pricing Breakdown (format as a proper table):
- Subtotal: $${payload.pricing.subtotal.toFixed(2)}
- Discount: $${payload.pricing.discount.toFixed(2)}
- Delivery Charges: $${payload.pricing.delivery.toFixed(2)}
- Admin Fee: $${payload.pricing.adminFee.toFixed(2)}
- Total: $${payload.pricing.total.toFixed(2)}
- Total with 10% Contingency: $${payload.pricing.totalWithContingency.toFixed(2)}

Write this as a natural, professional email that an approver would receive. Make it conversational but professional. Do not use markdown formatting symbols (#, *, **). Format the pricing in a clear table format. End with a simple thank you message.`;

		// Verify API key is available
		if (!env.GEMINI_API_KEY) {
			console.error("GEMINI_API_KEY is not set");
			return NextResponse.json(
				{ error: "Gemini API key is not configured. Please contact support." },
				{ status: 500 },
			);
		}

		// Call Gemini API - using gemini-2.0-flash-001 (stable version available with free-tier key)
		const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${env.GEMINI_API_KEY}`;

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
		};

		const response = await fetch(geminiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			let errorMessage = "Failed to generate AOR. Please try again.";
			try {
				const errorData = await response.json();
				console.error("Gemini API error:", errorData);
				errorMessage = errorData.error?.message || errorData.error || errorMessage;
			} catch {
				const errorText = await response.text();
				console.error("Gemini API error (text):", errorText);
				errorMessage = errorText || errorMessage;
			}
			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status },
			);
		}

		const data = await response.json();
		console.log("Gemini API response:", JSON.stringify(data, null, 2));

		// Extract the generated text from Gemini response
		const generatedText =
			data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!generatedText) {
			console.error("No text in Gemini response:", data);
			return NextResponse.json(
				{ error: "Gemini API did not return any text. Please try again." },
				{ status: 500 },
			);
		}

		return NextResponse.json({ text: generatedText });
	} catch (error) {
		console.error("Error generating AOR:", error);
		return NextResponse.json(
			{ error: "An error occurred while generating the AOR." },
			{ status: 500 },
		);
	}
}

