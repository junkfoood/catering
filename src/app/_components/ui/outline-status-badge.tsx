"use client";

import clsx from "clsx";
import React from "react";
import { Badge } from "./badge";

export interface OutlineStatusBadgeProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	text: string;
	filled: boolean;
	size?: "sm" | "md" | "lg";
	filledClassName?: string;
	unfilledClassName?: string;
}

const OutlineStatusBadge = React.forwardRef<
	HTMLDivElement,
	OutlineStatusBadgeProps
>(
	(
		{
			text,
			filled,
			size = "md",
			filledClassName,
			unfilledClassName,
			className,
			...props
		},
		ref,
	) => {
		return (
			<Badge
				className={clsx({
					"bg-background hover:bg-background text-foreground border-gray-600 text-center":
						!filled && unfilledClassName === undefined,
					"bg-gray-600 hover:bg-gray-600":
						filled && filledClassName === undefined,
					[filledClassName ?? ""]: filled && filledClassName !== undefined,
					[unfilledClassName ?? ""]: !filled && unfilledClassName !== undefined,
					"py-2": size === "lg",
					"py-1": size === "md",
					"py-0.5 text-xs font-normal": size === "sm",
				})}
			>
				{text}
			</Badge>
		);
	},
);

OutlineStatusBadge.displayName = "OutlineStatusBadge";

export { OutlineStatusBadge };
