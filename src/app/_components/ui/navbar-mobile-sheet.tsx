"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";

export function NavbarMobileSheet({ children }: { children: ReactNode }) {
	return (
		<Sheet>
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
				{children}
			</SheetContent>
		</Sheet>
	);
}
