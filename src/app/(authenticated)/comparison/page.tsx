import { Metadata } from "next";
import ComparisonDisplay from "./_components/comparison-display";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: "Comparison",
	description: "Compare Caterers",
};

export default async function ComparisonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Caterers</h1>
        <p className="text-gray-600">Compare different caterers side by side to make the best choice for your event.</p>
      </div>
      <ComparisonDisplay />
    </div>
  );
}
