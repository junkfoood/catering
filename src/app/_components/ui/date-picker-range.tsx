"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DatePickerWithRange({
	className,
	value,
	onChange,
}: React.HTMLAttributes<HTMLDivElement> & {
	value: DateRange | undefined;
	onChange: (value: DateRange | undefined) => void;
}) {
	const [date, setDate] = React.useState<DateRange | undefined>(value);

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-[300px] justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
					>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y")} -{" "}
									{format(date.to, "LLL dd, y")}
								</>
							) : (
								format(date.from, "LLL dd, y")
							)
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={{
							from: value?.from,
							to: value?.to,
						}}
						onSelect={(date) => {
							setDate(date);
							onChange(date);
						}}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
