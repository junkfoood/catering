"use client";

import { unique } from "radash";
import { type FieldValues, type UseFormReturn } from "react-hook-form";
import { FormError, flattenFormErrors } from "~/utils/utils";

interface CustomFormErrorDisplayProps<T extends FieldValues> {
	form: UseFormReturn<T>;
	inline?: boolean;
}

export function CustomFormErrorDisplay<T extends FieldValues>({
	form,
	inline = false,
}: CustomFormErrorDisplayProps<T>) {
	const errors = unique(flattenFormErrors(form.formState.errors as FormError));

	return (
		errors.length > 0 && (
			<div className="flex flex-col gap-2">
				<p className="font-bold">Errors</p>
				{inline ? (
					<p className="text-sm text-red-500">{errors.join(" | ")}</p>
				) : (
					errors.map((error, index) => (
						<p
							key={`custom-form-errors-${index}`}
							className="text-sm text-red-500"
						>
							{error}
						</p>
					))
				)}
			</div>
		)
	);
}
