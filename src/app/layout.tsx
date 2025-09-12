import "~/styles/globals.css";

import { Toaster } from "@components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { Settings } from "luxon";
import { type Metadata } from "next";
import { auth } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "./_components/providers";
import { Shell } from "./_components/ui/shell";

Settings.defaultZone = "Asia/Singapore";

export const metadata: Metadata = {
	title: {
		template: "%s",
		default: "Where's the Food",
	},
	description:
		"Where's the Food - Compare and evaluate catering services and providers.",
	keywords: [
		"catering",
		"compare",
		"Catering Compare",
		"food service",
		"catering providers",
	],
	authors: [{ name: "GovTech Singapore" }],
	creator: "GovTech Singapore",
	publisher: "GovTech Singapore",
	icons: [
		{ rel: "icon", url: "/favicon.ico" },
		{ rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
	],
	other: {
		"theme-color": "#ff6b35",
	},
	metadataBase: new URL("https://catering-5rca.vercel.app"),
	openGraph: {
		type: "website",
		siteName: "Where's the Food",
		title: "Where's the Food",
		description:
			"Where's the Food - Compare and evaluate catering services and providers.",
		url: "https://catering-5rca.vercel.app",
		images: [
			{
				url: "/logo.webp",
				width: 512,
				height: 512,
				alt: "Where's the Food",
			},
		],
		locale: "en_SG",
	},
	twitter: {
		card: "summary_large_image",
		title: "Where's the Food",
		description:
			"Where's the Food - Compare and evaluate catering services and providers",
		images: ["/logo.webp"],
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
	const session = await auth();
	
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Analytics />
				<TRPCReactProvider>
					<Providers session={session}>
						<Shell>{children}</Shell>
					</Providers>
				</TRPCReactProvider>
				<Toaster />
			</body>
		</html>
	);
}
