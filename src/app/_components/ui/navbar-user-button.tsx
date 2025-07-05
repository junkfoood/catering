"use client";

import { User } from "@prisma/client";
import { CirclePlus, Copy, Loader2, LogOut } from "lucide-react";
import React, { useState } from "react";
import { signOutAction } from "~/server/auth/clientAuth";
import { api } from "~/trpc/react";
import { DateTimeFormats } from "~/utils/format";
import { Button } from "./button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import { UserAvatar } from "./user-avatar";
import { DateTime } from "luxon";
import { Input } from "./input";
import { useToast } from "~/hooks/use-toast";
import { routes } from "~/utils/route";
import Link from "next/link";

export interface NavbarUserButtonProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	user: User;
}

const NavbarUserButton = React.forwardRef<
	HTMLDivElement,
	NavbarUserButtonProps
>(({ user, ...props }, ref) => {
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const { toast } = useToast();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					data-testid="navbar-user-button"
					className="rounded-4xl"
					size="icon"
					variant="ghost"
				>
					<UserAvatar
						className="hover:cursor-pointer"
						onClick={() => setOpen(true)}
						name={user?.name ?? ""}
					/>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{user.name}</DialogTitle>
					<DialogDescription>{user?.email}</DialogDescription>
				</DialogHeader>
				<Button
					disabled={loading}
					onClick={async () => {
						setLoading(true);
						await signOutAction().then(() => {
							setLoading(false);
							setOpen(false);
						});
					}}
					className="mt-8 self-end"
					variant="secondary"
				>
					{loading ? <Loader2 className="animate-spin" /> : <LogOut />}
					Sign Out
				</Button>
			</DialogContent>
		</Dialog>
	);
});

NavbarUserButton.displayName = "NavbarUserButton";

export { NavbarUserButton };
