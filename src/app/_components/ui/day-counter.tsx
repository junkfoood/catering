import clsx from "clsx";
import { DateTime } from "luxon";
import React from "react";

export interface DayCounterProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	date: Date;
}

const DayCounter = React.forwardRef<HTMLDivElement, DayCounterProps>(
	({ date, className, ...props }, ref) => {
		const daysLeft = Math.floor(
			DateTime.fromJSDate(date).diffNow("day").toObject().days!,
		);

		return (
			<p
				className={
					className ??
					clsx("text-sm", {
						"text-green-600": daysLeft > 3,
						"text-orange-400": daysLeft < 3 && daysLeft > 0,
						"text-gray-400": daysLeft <= 0,
					})
				}
				{...props}
				ref={ref}
			>
				{daysLeft < 0 ? "Deadline passed" : `${daysLeft} days left`}
			</p>
		);
	},
);

DayCounter.displayName = "DayCounter";

export { DayCounter };
