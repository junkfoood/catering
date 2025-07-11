import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import clsx from "clsx";
import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "public/logo.webp";
import { auth } from "~/server/auth";
import { NestedRoute, Route } from "~/utils/route";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";

export async function NavbarSidebar({
	publicNavbarRoutes,
	navbarRoutes,
}: {
	publicNavbarRoutes: (Route | NestedRoute)[];
	navbarRoutes: (Route | NestedRoute)[];
}) {
	const session = await auth();

	return (
		<Sheet>
			<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
				>
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle Menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="pr-0">
				<MobileLink href="/" className="flex items-center">
					<Image src={logo} alt="Logo" className="h-auto w-[30%]" />
				</MobileLink>
				<div className="flex flex-col space-y-3 pt-6">
					{(session ? navbarRoutes : publicNavbarRoutes).map((route) =>
						"routes" in route ? (
							<Collapsible key={`group-${route.label}`}>
								<CollapsibleTrigger className="text-foreground/70 hover:text-foreground flex w-full items-center gap-2 transition-colors">
									{route.label}
									<ChevronDown className="h-4 w-4" />
								</CollapsibleTrigger>
								<CollapsibleContent className="mt-2 flex flex-col gap-2 pl-4">
									{route.routes.map((child) => (
										<MobileLink
											className="border-l-2 pl-2"
											key={child.link}
											href={child.link}
										>
											{child.label}
										</MobileLink>
									))}
								</CollapsibleContent>
							</Collapsible>
						) : (
							<MobileLink key={route.link} href={route.link}>
								{route.label}
							</MobileLink>
						),
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}

interface MobileLinkProps extends React.PropsWithChildren {
	href: string;
	className?: string;
}

function MobileLink({ href, className, children, ...props }: MobileLinkProps) {
	return (
		<Link
			href={href}
			className={clsx(
				"text-foreground/70 hover:text-foreground transition-colors",
				className,
			)}
			{...props}
		>
			{children}
		</Link>
	);
}
