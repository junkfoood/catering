"use client";

import type { User } from "@prisma/client";
import { useState } from "react";
import { DataTable } from "~/app/_components/ui/data-table";
import { Input } from "~/app/_components/ui/input";
import { usersColumns } from "./users-columns";

export default function UsersTable({ users }: { users: User[] }) {
	const [searchTerm, setSearchTerm] = useState<string>("");

	return (
		<div className="flex flex-col gap-4">
			<Input
				value={searchTerm}
				onChange={(event) => setSearchTerm(event.target.value)}
				placeholder="Search for products"
			/>
			<DataTable
				columns={usersColumns}
				data={users.filter((user) =>
					searchTerm.length > 0
						? user.name.toLowerCase().includes(searchTerm.toLowerCase())
						: true,
				)}
			/>
		</div>
	);
}
