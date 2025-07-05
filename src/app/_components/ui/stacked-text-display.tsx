"use client";

import clsx from "clsx";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { forwardRef } from "react";

export interface StackedTextDisplayProps {
	aboveText: string;
	bottomText?: string;
	bottomTextLink?: string;
	bottomTextClassName?: string;
	bottomContextText?: string;
}

export const StackedTextDisplay = forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & StackedTextDisplayProps
>(
	(
		{
			aboveText,
			bottomText,
			bottomTextLink,
			bottomTextClassName,
			bottomContextText,
			className,
			...props
		},
		ref,
	) => {
		return (
			<div ref={ref} className={className ?? "flex flex-col gap-2"} {...props}>
				<p className="text-muted-foreground text-sm whitespace-pre-line">
					{aboveText}
				</p>
				<div className="flex flex-col">
					{bottomTextLink ? (
						<Link
							href={bottomTextLink}
							className={clsx(
								"flex items-center gap-2 hover:underline",
								bottomTextClassName ?? "font-bold",
							)}
						>
							{bottomText}
							<SquareArrowOutUpRight size={12} />
						</Link>
					) : (
						<p className={clsx(bottomTextClassName ?? "font-bold")}>
							{bottomText}
						</p>
					)}
					{bottomContextText && (
						<p className="text-muted-foreground text-sm">{bottomContextText}</p>
					)}
				</div>
			</div>
		);
	},
);
