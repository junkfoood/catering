import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressSegment = {
	value: number;
	color?: string;
};

type Props = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
	segments: ProgressSegment[];
};

const StackedProgress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	Props
>(({ className, segments, ...props }, ref) => {
	const sortedSegments = segments;

	return (
		<ProgressPrimitive.Root
			ref={ref}
			className={cn(
				"bg-secondary relative h-6 w-full overflow-hidden rounded",
				className,
			)}
			{...props}
		>
			{sortedSegments.map((segment, index) => (
				<ProgressPrimitive.Indicator
					key={index}
					className={cn(
						"absolute h-full transition-all",
						segment.color ?? "bg-primary",
					)}
					style={{
						width: `${segment.value}%`,
						zIndex: sortedSegments.length - index,
						left: `${sortedSegments
							.slice(0, index)
							.reduce((acc, segment) => acc + segment.value, 0)}%`,
					}}
				/>
			))}
		</ProgressPrimitive.Root>
	);
});

StackedProgress.displayName = "StackedProgress";

export { StackedProgress };
