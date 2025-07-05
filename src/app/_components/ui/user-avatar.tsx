import React from "react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback } from "./avatar";

export interface UserAvatarProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	name: string;
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
	({ name, className, ...props }, ref) => {
		return (
			<Avatar
				{...props}
				className={cn("flex items-center gap-4", className)}
				ref={ref}
			>
				<AvatarFallback>
					{name
						.split(" ")
						.map((word) => word[0])
						.join("")}
				</AvatarFallback>
			</Avatar>
		);
	},
);

UserAvatar.displayName = "UserAvatar";

export { UserAvatar };
