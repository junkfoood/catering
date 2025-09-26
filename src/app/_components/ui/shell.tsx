import React, { type ReactNode } from "react";
import { HydrateClient } from "~/trpc/server";
import { type Route } from "~/utils/route";
import Banner from "./banner";
import Footer from "./footer";
import Masthead from "./masthead";
import { Navbar } from "./navbar";

export interface ShellProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	selector?: Route;
	children: ReactNode | null;
	isPublic?: boolean;
	redirectToDashboard?: boolean;
}

const Shell = React.forwardRef<HTMLDivElement, ShellProps>(
	async (
		{
			children,
			selector,
			isPublic = false,
			redirectToDashboard = false,
			...props
		},
		ref,
	) => {
		return (
			<HydrateClient>
				<div className="min-h-screen flex flex-col " {...props} ref={ref}>
					<div className="flex flex-col grow">
						<Masthead isStaging={process.env.NODE_ENV !== "production"} />
						<Banner />
						<header className="sticky top-0 z-50 bg-white">
							<Navbar />
						</header>
						<main className="flex flex-col grow bg-slate-50">{children}</main>
					</div>
					<footer>
						<Footer />
					</footer>
				</div>
			</HydrateClient>
		);
	},
);

Shell.displayName = "Shell";

export { Shell };
