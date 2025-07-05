"use client";

import { Button } from "@components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/app/_components/ui/popover";

export interface ConfirmationButtonProps {
	button: ReactNode;
	customConfirm?: ReactNode;
	confirmationHeader?: string;
	confirmationText?: string;
	confirmationButtonText?: string;
	onConfirm: () => void;
	isPending?: boolean;
}

export function ConfirmationButton({
	button,
	customConfirm,
	confirmationHeader = "Irreversible Action",
	confirmationText = "This action is irreversible.\n\nPlease only confirm this if you are sure.",
	confirmationButtonText = "Yes, I'm sure",
	onConfirm,
	isPending = false,
}: ConfirmationButtonProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>{button}</PopoverTrigger>
			<PopoverContent className="flex flex-col gap-4">
				<p className="text-lg font-bold">{confirmationHeader}</p>
				<p className="whitespace-pre-line text-sm text-red-400 font-medium">
					{confirmationText}
				</p>
				{customConfirm ? (
					customConfirm
				) : (
					<Button
						disabled={isPending}
						className="bg-red-500 hover:bg-red-400"
						onClick={onConfirm}
					>
						{isPending ? <Loader2 className="animate-spin" /> : <Trash />}
						{confirmationButtonText}
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
}
