"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ScrollerProps {
	children: React.ReactNode;
	className?: string;
}

export function Scroller({ children, className }: ScrollerProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	useEffect(() => {
		const checkScroll = () => {
			if (scrollRef.current) {
				const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
				setShowLeftArrow(scrollLeft > 0);
				setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
			}
		};

		checkScroll();
		window.addEventListener("resize", checkScroll);
		return () => window.removeEventListener("resize", checkScroll);
	}, []);

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount = scrollRef.current.clientWidth / 2;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className={cn("relative", className)}>
			{showLeftArrow && (
				<Button
					onClick={() => scroll("left")}
					className="absolute left-0 top-1/2 -translate-y-1/2 bg-primary text-white dark:bg-gray-800 p-1 rounded-full shadow-md z-10"
					aria-label="Scroll left"
					type="button"
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
			)}
			<div
				ref={scrollRef}
				className="overflow-x-auto scrollbar-hide"
				onScroll={() => {
					if (scrollRef.current) {
						const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
						setShowLeftArrow(scrollLeft > 0);
						setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
					}
				}}
			>
				{children}
			</div>
			{showRightArrow && (
				<Button
					onClick={() => scroll("right")}
					className="absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-white dark:bg-gray-800 p-1 rounded-full shadow-lg z-10"
					aria-label="Scroll right"
					type="button"
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
			)}
		</div>
	);
}
