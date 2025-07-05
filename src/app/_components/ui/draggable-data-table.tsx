"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@components/ui/table";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onOrderChange?: (data: TData[]) => void;
}

export function DraggableDataTable<TData, TValue>({
	columns,
	data,
	onOrderChange,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const [rowOrder, setRowOrder] = React.useState(() =>
		data.map((_, index) => index),
	);

	const reorderedData = React.useMemo(
		() => rowOrder.map((index) => data[index]!),
		[data, rowOrder],
	);

	const table = useReactTable({
		data: reorderedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

	const handleDragStart = (
		e: React.DragEvent<HTMLTableRowElement>,
		index: number,
	) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", index.toString());
	};

	const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (
		e: React.DragEvent<HTMLTableRowElement>,
		targetIndex: number,
	) => {
		e.preventDefault();
		if (draggedIndex === null) return;
		setSorting([]);

		const newOrder = [...rowOrder];
		const [reorderedItem] = newOrder.splice(draggedIndex, 1);
		newOrder.splice(targetIndex, 0, reorderedItem!);

		setRowOrder(newOrder);
		setDraggedIndex(null);

		if (onOrderChange) {
			onOrderChange(newOrder.map((index) => data[index]!));
		}
	};

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row, index) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
								draggable
								onDragStart={(e) => handleDragStart(e, index)}
								onDragOver={handleDragOver}
								onDrop={(e) => handleDrop(e, index)}
								className="cursor-move"
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
