"use client";

import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { cn } from "@/lib/utils";
import { Scroller } from "./scroller";

interface Tab {
	value: string;
	label: string;
}

interface ScrollableTabsProps {
	tabs: Tab[];
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}

export function ScrollableTabs({
	tabs,
	defaultValue,
	onValueChange,
}: ScrollableTabsProps) {
	return (
		<Tabs
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			className="w-full"
		>
			<Scroller className="w-full">
				<TabsList className="h-auto bg-transparent p-0 w-max">
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className={cn(
								"h-9 rounded-none border-b-2 border-transparent px-4",
								"data-[state=active]:border-primary data-[state=active]:shadow-none",
							)}
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Scroller>
		</Tabs>
	);
}
