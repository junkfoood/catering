"use client";

import type { User } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "~/app/_components/ui/button";
import { SortableTableHeader } from "~/app/_components/ui/sortable-table-header";
import { routeFormatter } from "~/utils/route";
import { UserRoleSelector } from "./user-role-selector";

export const usersColumns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => {
			return <SortableTableHeader column={column} header="Name" />;
		},
		accessorFn: (original) => {
			return original.name;
		},
	},
	{
		accessorKey: "email",
		header: ({ column }) => {
			return <SortableTableHeader column={column} header="Email" />;
		},
		accessorFn: (original) => {
			return original.email;
		},
	},
	{
		accessorKey: "role",
		header: ({ column }) => {
			return <SortableTableHeader column={column} header="Role" />;
		},
		cell: ({ row: { original } }) => {
			return <UserRoleSelector user={original} />;
		},
	},
];
