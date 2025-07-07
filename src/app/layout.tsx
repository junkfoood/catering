import "~/styles/globals.css";

import { Toaster } from "@components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { Settings } from "luxon";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { Shell } from "./_components/ui/shell";

Settings.defaultZone = "Asia/Singapore";

export const metadata: Metadata = {
	title: {
		template: "%s",
		default: "Cater Compare",
	},
	description:
		"GovTech Product Scorecard, built in collaboration by the CIO Office Product Team, GTO Product Management Practice, Product Strategy Office, Technology Management Office, and the Transformation Office.",
	keywords: [
		"GovTech",
		"Singapore",
		"Product Scorecard",
		"Government Technology",
		"Digital Government",
	],
	authors: [{ name: "GovTech Singapore" }],
	creator: "GovTech Singapore",
	publisher: "GovTech Singapore",
	icons: [
		{ rel: "icon", url: "/favicon.ico" },
		{ rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
	],
	metadataBase: new URL("https://products.tech.gov.sg"),
	openGraph: {
		type: "website",
		siteName: "GovTech Product Scorecard",
		title: "GovTech Product Scorecard",
		description:
			"GovTech Product Scorecard, built in collaboration by the CIO Office Product Team, GTO Product Management Practice, Product Strategy Office, Technology Management Office, and the Transformation Office.",
		url: "https://products.tech.gov.sg",
		images: [
			{
				url: "/opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "GovTech Product Scorecard",
			},
		],
		locale: "en_SG",
	},
	twitter: {
		card: "summary_large_image",
		title: "GovTech Product Scorecard",
		description:
			"GovTech Product Scorecard - Track and measure government digital products and services",
		images: ["/opengraph-image.png"],
	},
	robots: {
		index: false,
		follow: false,
		noarchive: true,
		nosnippet: true,
		noimageindex: true,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noarchive: true,
			nosnippet: true,
			noimageindex: true,
			nocache: true,
		},
	},
	verification: {
		// Add your verification IDs here if needed
		// google: "your-google-verification-id",
	},
};

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Analytics />
				<TRPCReactProvider>
					<Shell>{children}</Shell>
				</TRPCReactProvider>
				<Toaster />
			</body>
		</html>
	);
}
