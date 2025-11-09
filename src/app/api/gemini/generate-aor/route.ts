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

// Update Event Date to DD MMM YYYY without comma
function formatDate(dateString: string): string {
	if (!dateString) return "[Not specified]";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).replace(/ /g, " "); // e.g. "14 Nov 2025"
}

export async function POST(req: NextRequest) {
	try {
		const payload: AORPayload = await req.json();

		// Format the event date
		const eventDate = formatDate(payload.background.eventDate);

		// Construct the prompt for Gemini
		const prompt = `You are generating an Approval of Request (AOR) email for a catering order.

Write this as a natural, professional email that an approver would receive. 
Keep it conversational but polished.

Use round bullet points (•) for all list items instead of asterisks.  
Do not use markdown syntax (#, *, **).

For the pricing section, list each cost item clearly as bullet points using this format:
• Subtotal: $175.00   
• Delivery Charges: $45.00
• Less Discounts: ($4.40) 
• Admin Fee: $0.00 (if $0.00, do not include this line)  
• Total: $215.60  
• Total with 10% Contingency: $237.16

At the end of the email, include this closing line:  
"If there are no further queries, please proceed to approve this request."  
End with a simple thank-you message.

The email should include:

Background Information:
- Event: ${payload.background.eventType || "[Not specified]"}
- Event Date: ${eventDate} 
- Funding Source: ${payload.background.fundingSource || "[Not specified]"}
- Approver: ${payload.background.approver || "[Not specified]"}

Order Details:
- Caterer: ${payload.order.caterer}
- Menu: ${payload.order.menu}
- Number of Pax: ${payload.order.paxCount}
- Selected Items: ${payload.order.selectedItems.join(", ") || "None selected"}

Pricing Breakdown (format as a proper table):
- Subtotal: $${payload.pricing.subtotal.toFixed(2)}
- Delivery Charges: $${payload.pricing.delivery.toFixed(2)}
- Less Discounts: ($${payload.pricing.discount.toFixed(2)})
- Admin Fee: $${payload.pricing.adminFee.toFixed(2)}
- Total: $${payload.pricing.total.toFixed(2)}
- Total with 10% Contingency: $${payload.pricing.totalWithContingency.toFixed(2)}`;

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

