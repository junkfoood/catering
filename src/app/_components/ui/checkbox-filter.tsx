"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export interface CheckboxFilterOption {
	label: string;
	value: string;
}

export interface CheckboxFilterGroup {
	label: string;
	icon?: string;
	values: string[];
}

interface CheckboxFilterProps {
	options: CheckboxFilterOption[];
	groups?: CheckboxFilterGroup[];
	defaultSelected?: string[];
	selected: string[];
	onChange: (selected: string[]) => void;
	label: string;
	className?: string;
}

export function CheckboxFilter({
	options,
	groups = [],
	defaultSelected = [],
	selected,
	onChange,
	label,
	className,
}: CheckboxFilterProps) {
	// Helper function to get all values for a group
	const getGroupValues = (group: CheckboxFilterGroup): string[] => {
		return group.values;
	};

	// Calculate which groups should be shown as selected
	const getSelectedGroupsAndIndividuals = () => {
		const selectedGroups: string[] = [];
		const selectedIndividuals: string[] = [];

		// Check which groups are fully selected
		groups.forEach((group) => {
			const groupValues = getGroupValues(group);
			const allGroupValuesSelected =
				groupValues.length > 0 &&
				groupValues.every((value) => selected.includes(value));
			if (allGroupValuesSelected) {
				selectedGroups.push(`group:${group.label}`);
			}
		});

		// Add all individual options that are selected (regardless of group membership)
		options.forEach((option) => {
			if (selected.includes(option.value)) {
				selectedIndividuals.push(option.value);
			}
		});

		return [...selectedGroups, ...selectedIndividuals];
	};

	const handleToggle = (value: string, checked: boolean) => {
		if (value.startsWith("group:")) {
			// Handle group toggle
			const groupLabel = value.replace("group:", "");
			const group = groups.find((g) => g.label === groupLabel);
			if (!group) return;

			const groupValues = getGroupValues(group);

			if (checked) {
				// Add all group values
				const newSelected = [...selected];
				groupValues.forEach((val) => {
					if (!newSelected.includes(val)) {
						newSelected.push(val);
					}
				});
				onChange(newSelected);
			} else {
				// Remove all group values
				const newSelected = selected.filter(
					(val) => !groupValues.includes(val),
				);
				onChange(newSelected);
			}
		} else {
			// Handle individual option toggle
			if (checked) {
				onChange([...selected, value]);
			} else {
				onChange(selected.filter((item) => item !== value));
			}
		}
	};

	const uiSelected = getSelectedGroupsAndIndividuals();
	const selectedCount = selected.length;
	const totalOptions = options.length;

	const handleClearAll = () => {
		onChange([]);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={cn("w-full sm:w-[180px] justify-between", className)}
				>
					<span className="truncate">
						{selectedCount === 0 || defaultSelected.length === selected.length
							? label
							: selectedCount === totalOptions
								? `All ${label}`
								: `${selectedCount} selected`}
					</span>
					<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start">
				<DropdownMenuLabel>{label}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem
					checked={false}
					onCheckedChange={handleClearAll}
					className="font-medium"
				>
					Reset to Default
				</DropdownMenuCheckboxItem>
				<DropdownMenuSeparator />

				{/* Render groups first */}
				{groups.map((group) => (
					<DropdownMenuCheckboxItem
						key={`group:${group.label}`}
						checked={uiSelected.includes(`group:${group.label}`)}
						onCheckedChange={(checked) =>
							handleToggle(`group:${group.label}`, checked)
						}
						className="font-medium"
					>
						{group.icon && <span className="mr-1">{group.icon}</span>}
						{group.label}
					</DropdownMenuCheckboxItem>
				))}

				{groups.length > 0 && <DropdownMenuSeparator />}

				{/* Render individual options */}
				{options.map((option) => (
					<DropdownMenuCheckboxItem
						key={option.value}
						checked={uiSelected.includes(option.value)}
						onCheckedChange={(checked) => handleToggle(option.value, checked)}
					>
						{option.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
