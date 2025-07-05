"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { FormControl } from "./form";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DatePicker({
	className,
	value,
	onChange,
}: React.HTMLAttributes<HTMLDivElement> & {
	value: Date | undefined;
	onChange: (value: Date | undefined) => void;
}) {
	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<FormControl>
						<Button
							variant={"outline"}
							className={cn(
								"w-[240px] pl-3 text-left font-normal",
								!value && "text-muted-foreground",
							)}
						>
							{value ? format(value, "PPP") : <span>Pick a date</span>}
							<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
						</Button>
					</FormControl>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={value}
						onSelect={onChange}
						disabled={(date) => date < new Date("1900-01-01")}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
