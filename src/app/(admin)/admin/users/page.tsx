import { BreadcrumbNavigation } from "@components/ui/breadcrumb-navigation";
import { PageShell } from "~/app/_components/ui/page-shell";
import { api } from "~/trpc/server";
import { routes } from "~/utils/route";
import UsersTable from "./_components/users-table";

export default async function UsersPage() {
	const users = await api.user.getAll();

	return (
		<PageShell
			header={
				<>
					<BreadcrumbNavigation routes={[]} />
					<div className="flex justify-between">
						<h1 className="text-3xl font-bold">Users</h1>
					</div>
				</>
			}
			body={<UsersTable users={users} />}
		/>
	);
}
