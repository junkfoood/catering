"use client";

import {
	NavigationMenuLink,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "~/lib/utils";

export interface NavbarLinkProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	link: string;
	label: string;
}

export const NavbarLink = React.forwardRef<HTMLDivElement, NavbarLinkProps>(
	({ link, label, ...props }, ref) => {
		const pathname = usePathname();

		const pathURL = pathname === "/menu" ? "/products" : pathname;
		const baseURL = link === "/menu" ? "/products" : link;

		return (
			<NavigationMenuLink
				key={link}
				className={cn(navigationMenuTriggerStyle(), "w-full", {
					"text-teal-500 ": pathURL.startsWith(baseURL),
				})}
				asChild
			>
				<div className="flex flex-col items-center">
					<Link href={link}>{label}</Link>
					{pathURL.startsWith(baseURL) && (
						<div className="w-full h-0.5 bg-teal-500" />
					)}
				</div>
			</NavigationMenuLink>
		);
	},
);

NavbarLink.displayName = "NavbarLink";

export interface NavbarLabelProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	label: string;
	link: string;
}

export const NavbarLabel = React.forwardRef<HTMLDivElement, NavbarLabelProps>(
	({ label, link, ...props }, ref) => {
		const pathname = usePathname();

		const pathURL = pathname === "/menu" ? "/products" : pathname;
		const baseURL = link === "/menu" ? "/products" : link;

		return (
			<NavigationMenuTrigger
				className={cn({
					"text-teal-500": pathURL.startsWith(baseURL),
				})}
			>
				<div className="flex flex-col items-center">
					{label}
					{pathURL.startsWith(baseURL) && (
						<div className="w-full h-0.5 bg-teal-500" />
					)}
				</div>
			</NavigationMenuTrigger>
		);
	},
);

NavbarLabel.displayName = "NavbarLabel";
