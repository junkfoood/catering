"use client";

import { type Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "./button";

interface SortableTableHeaderProps<T> {
	column: Column<T>;
	header: string;
}

function SortableTableHeader<T>({
	column,
	header,
}: SortableTableHeaderProps<T>) {
	return (
		<div className="flex items-center gap-2">
			<p>{header}</p>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				<ArrowUpDown className="h-4 w-4" />
			</Button>
		</div>
	);
}

SortableTableHeader.displayName = "SortableTableHeader";

export { SortableTableHeader };
