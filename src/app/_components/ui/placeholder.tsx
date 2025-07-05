import clsx from "clsx";
import { Skeleton } from "./skeleton";

interface PlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
	type: "profile" | "badge" | "table" | "card" | "thin-card";
}

function Placeholder({ className, type, ...props }: PlaceholderProps) {
	switch (type) {
		case "badge":
			return (
				<Skeleton
					className={clsx("h-4 w-[150px] rounded", className)}
					{...props}
				/>
			);
		case "profile":
			return (
				<div
					className={clsx("flex items-center space-x-4", className)}
					{...props}
				>
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-[250px]" />
						<Skeleton className="h-4 w-[200px]" />
					</div>
				</div>
			);
		case "table":
			return (
				<div
					className={clsx("flex w-full flex-col gap-4", className)}
					{...props}
				>
					<div className="flex gap-4">
						<Skeleton className="h-8 w-4/5" />
						<Skeleton className="h-8 w-1/5" />
					</div>
					<Skeleton className="h-96 w-full" />
				</div>
			);
		case "card":
			return (
				<Skeleton
					className={clsx("aspect-video w-full rounded", className)}
					{...props}
				/>
			);
		case "thin-card":
			return (
				<Skeleton
					className={clsx("h-48 w-full rounded", className)}
					{...props}
				/>
			);
	}
}

export { Placeholder };
