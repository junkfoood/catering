"use client";

import { Input } from "@components/ui/input";
import clsx from "clsx";
import { Grip } from "lucide-react";
import React, { type ReactNode, useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface SortableListProps {
	addInputPlaceholder?: string;
	onAdd?: (text: string) => void;
	onAddValidation?: (text: string) => { message: string } | null;
	disabledIndex?: number[];
	onMove: ({
		oldIndex,
		newIndex,
	}: {
		oldIndex: number;
		newIndex: number;
	}) => void;
	display: ReactNode[];
}

export function SortableList({
	addInputPlaceholder,
	display,
	disabledIndex = [],
	onAdd,
	onMove,
	onAddValidation,
}: SortableListProps) {
	const [textInput, setTextInput] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		e.dataTransfer.setData("text/plain", index.toString());
	};

	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
		e.preventDefault();
		const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
		onMove({
			oldIndex: sourceIndex,
			newIndex: targetIndex,
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<div>
				{display.map((item, index: number) => (
					<Card
						key={`sortable-list-${index}`}
						className={clsx("mb-2", {
							"cursor-move": !disabledIndex.includes(index),
							"cursor-not-allowed border-slate-200 bg-slate-200":
								disabledIndex.includes(index),
						})}
						draggable={!disabledIndex.includes(index)}
						onDragStart={(e) => onDragStart(e, index)}
						onDragOver={onDragOver}
						onDrop={(e) => onDrop(e, index)}
					>
						<CardContent className="flex items-center p-2">
							{!disabledIndex.includes(index) && (
								<Grip className="mr-2 h-5 w-5" />
							)}
							{item}
						</CardContent>
					</Card>
				))}
			</div>
			{onAdd && (
				<div className="flex gap-4">
					<div className="grow">
						<Input
							placeholder={addInputPlaceholder}
							value={textInput}
							onChange={(event) => setTextInput(event.target.value)}
							className={clsx({ "text-red-500": error !== null })}
						/>
						{error && (
							<p className="text-sm font-medium text-red-500">{error}</p>
						)}
					</div>
					<Button
						type="button"
						onClick={() => {
							if (onAddValidation) {
								const error = onAddValidation(textInput);

								if (error) {
									setError(error.message);
								} else {
									onAdd(textInput);
									setError(null);
									setTextInput("");
								}
							} else {
								onAdd(textInput);
								setTextInput("");
							}
						}}
					>
						Add Item
					</Button>
				</div>
			)}
		</div>
	);
}
