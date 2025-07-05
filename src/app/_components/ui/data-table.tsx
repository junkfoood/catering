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
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	RowSelectionState,
	ColumnPinningState,
} from "@tanstack/react-table";
import { useState, useImperativeHandle, forwardRef, Ref } from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	enableRowSelection?: boolean;
	defaultColumnPinning?: ColumnPinningState;
	onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export interface DataTableRef {
	clearSelection: () => void;
	setColumnFilter: (columnId: string, value: string) => void;
	clearColumnFilters: () => void;
}

function DataTableInner<TData, TValue>(
	{
		columns,
		data,
		enableRowSelection = false,
		onRowSelectionChange,
		defaultColumnPinning,
	}: DataTableProps<TData, TValue>,
	ref: Ref<DataTableRef>,
) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
		defaultColumnPinning ?? {},
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnPinningChange: setColumnPinning,
		getRowId: (row: TData) => {
			// Use the row's id if it exists, otherwise fall back to index
			return (row as any)?.id ?? String(data.indexOf(row));
		},
		onRowSelectionChange: (updater) => {
			const newSelection =
				typeof updater === "function" ? updater(rowSelection) : updater;
			setRowSelection(newSelection);

			// Call the callback with selected row data
			if (onRowSelectionChange) {
				const selectedRowIds = Object.keys(newSelection).filter(
					(key) => newSelection[key],
				);
				const selectedRowData = data.filter((row) =>
					selectedRowIds.includes(
						(row as any)?.id ?? String(data.indexOf(row)),
					),
				) as TData[];
				onRowSelectionChange(selectedRowData);
			}
		},
		enableRowSelection,
		enableColumnPinning: true,
		state: {
			sorting,
			columnFilters,
			rowSelection,
			columnPinning,
		},
	});

	// Expose methods to parent component
	useImperativeHandle(ref, () => ({
		clearSelection: () => {
			setRowSelection({});
			if (onRowSelectionChange) {
				onRowSelectionChange([]);
			}
		},
		setColumnFilter: (columnId: string, value: string) => {
			table.getColumn(columnId)?.setFilterValue(value);
		},
		clearColumnFilters: () => {
			table.resetColumnFilters();
		},
	}));

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
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
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

export const DataTable = forwardRef(DataTableInner) as <TData, TValue>(
	props: DataTableProps<TData, TValue> & { ref?: Ref<DataTableRef> },
) => ReturnType<typeof DataTableInner>;
