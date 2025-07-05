import { Button } from "@components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@components/ui/popover";
import { User, UserRole } from "@prisma/client";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { displayName, properCase } from "~/utils/format";

export interface UserRoleSelectorProps {
	user: User;
}

export function UserRoleSelector({ user }: UserRoleSelectorProps) {
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();
	const utils = api.useUtils();
	const { toast } = useToast();

	const userRoleMutation = api.user.updateRole.useMutation({
		onSuccess: (user) => {
			router.refresh();
			utils.user.invalidate();

			toast({
				title: "User Role updated successfully",
				description: `${displayName(user)} is now a ${properCase(user.role)}`,
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "An error occurred while updating the User Role",
			});
		},
	});

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					disabled={userRoleMutation.isPending}
					size="sm"
					variant="ghost"
					className="m-1 p-1"
				>
					<div className="flex items-center gap-2">
						<p className="whitespace-nowrap">{properCase(user.role)}</p>
						{userRoleMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<ChevronDown className="h-1 w-1" />
						)}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search User Roles..." />
					<CommandList>
						<CommandEmpty>No User Roles.</CommandEmpty>
						<CommandGroup>
							{Object.values(UserRole).map((role) => (
								<CommandItem
									key={role}
									onSelect={() => {
										userRoleMutation.mutate({
											id: user.id,
											role,
										});
										setOpen(false);
									}}
								>
									{properCase(role)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
