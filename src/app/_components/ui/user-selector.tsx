"use client";

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
import { User } from "@prisma/client";
import { Loader2, Plus } from "lucide-react";
import * as React from "react";
import { ReactNode } from "react";
import { api } from "~/trpc/react";
import { displayName } from "~/utils/format";
import { OutlineCard } from "./outline-card";

export interface UserSelectorProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
	disabled?: boolean;
	onSelect: (user: User) => void;
	excludeIDs?: string[];
	excludeEmails?: string[];
	customTrigger?: ReactNode;
	onboardedOnly?: boolean;
	card?: boolean;
}

const UserSelector = React.forwardRef<HTMLDivElement, UserSelectorProps>(
	(
		{
			onSelect,
			disabled = false,
			onboardedOnly = false,
			card = false,
			excludeIDs = [],
			excludeEmails = [],
			customTrigger,
			...props
		},
		ref,
	) => {
		const [open, setOpen] = React.useState(false);
		const { data: users, isPending } = api.user.getAll.useQuery();

		return (
			<Popover open={open} onOpenChange={setOpen}>
				{card ? (
					<OutlineCard
						className="border-gray-200 bg-gray-100"
						{...props}
						ref={ref}
					>
						<div className="flex justify-center gap-4">
							<div className="flex flex-col gap-1">
								<p className="font-bold">No user selected</p>
								<p className="text-sm">Search for a user</p>
							</div>
							<PopoverTrigger asChild>
								{customTrigger ?? (
									<Button
										data-testid="add-user-btn"
										variant="ghost"
										type="button"
										size="icon"
									>
										{isPending ? (
											<Loader2 className="animate-spin" />
										) : (
											<Plus />
										)}
									</Button>
								)}
							</PopoverTrigger>
						</div>
					</OutlineCard>
				) : (
					<div {...props} ref={ref}>
						<PopoverTrigger asChild>
							{customTrigger ?? (
								<Button disabled={isPending || disabled} type="button">
									{isPending ? <Loader2 className="animate-spin" /> : <Plus />}{" "}
									Add
								</Button>
							)}
						</PopoverTrigger>
					</div>
				)}
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandInput placeholder="Search users" />
						<CommandList>
							<CommandEmpty>No users found.</CommandEmpty>
							<CommandGroup>
								{users
									?.filter(
										(user) =>
											!excludeIDs.includes(user.id) &&
											!excludeEmails.includes(user.email),
									)
									.map((user) => (
										<CommandItem
											key={user.id}
											onSelect={() => {
												if (user) {
													onSelect(user);
												}
												setOpen(false);
											}}
										>
											{displayName(user)}
										</CommandItem>
									))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);
	},
);

UserSelector.displayName = "UserSelector";

export { UserSelector };
