"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface OutlineCardProps extends React.HTMLAttributes<HTMLDivElement> {
	link?: string;
}

const OutlineCard = React.forwardRef<HTMLDivElement, OutlineCardProps>(
	({ children, link, className, ...props }, ref) => {
		const button = (
			<div
				className={clsx("rounded-xl border p-4", className, {
					"hover:cursor-pointer": link !== undefined,
				})}
				ref={ref}
				{...props}
			>
				<div className="flex h-full grow items-center justify-between">
					<div className="flex h-full grow flex-col items-start gap-2">
						{children}
					</div>
					{link && <ChevronRight />}
				</div>
			</div>
		);

		return link ? <Link href={link}>{button}</Link> : button;
	},
);

OutlineCard.displayName = "OutlineCard";

export { OutlineCard };
