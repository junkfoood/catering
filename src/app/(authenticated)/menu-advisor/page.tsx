import type { Metadata } from "next";
import ChatbotDisplay from "./_components/chatbot-display";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: "Menu Advisor",
	description: "AI-powered menu recommendation advisor",
};

export default async function ChatbotPage() {
	return <ChatbotDisplay />;
}

