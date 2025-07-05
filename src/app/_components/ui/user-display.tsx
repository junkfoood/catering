"use client";

import { type User } from "@prisma/client";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { cn } from "~/lib/utils";
import { displayName } from "~/utils/format";

export interface UserDisplayProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	user: User;
	link?: string;
	customBottomText?: string;
}

const UserDisplay = React.forwardRef<HTMLDivElement, UserDisplayProps>(
	({ user, link, customBottomText, className, ...props }, ref) => {
		return (
			<div
				{...props}
				className={cn("flex items-center gap-4", className)}
				ref={ref}
			>
				<div className="flex flex-col items-start gap-0">
					{link ? (
						<Link
							href={link}
							className="flex items-center font-bold hover:underline"
						>
							{displayName(user)}{" "}
							<SquareArrowOutUpRight className="ml-2" size={12} />
						</Link>
					) : (
						<p className="text line-clamp-2 font-bold">{displayName(user)}</p>
					)}
					{customBottomText && (
						<p className="text-muted-foreground line-clamp-2 text-sm whitespace-normal">
							{customBottomText}
						</p>
					)}
				</div>
			</div>
		);
	},
);
UserDisplay.displayName = "UserDisplay";

export { UserDisplay };
