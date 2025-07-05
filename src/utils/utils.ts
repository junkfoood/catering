import type { TRPCError } from "@trpc/server";
import { forbidden, notFound, unauthorized } from "next/navigation";

export const preventEnterKeySubmission = (
	e: React.KeyboardEvent<HTMLFormElement>,
) => {
	const target = e.target as HTMLElement;
	if (e.key === "Enter" && target instanceof HTMLInputElement) {
		e.preventDefault();
	}
};

export const handleTRPCErrors = (error: TRPCError): never => {
	if (error.code === "FORBIDDEN") {
		forbidden();
	}

	if (error.code === "UNAUTHORIZED") {
		unauthorized();
	}

	if (error.code === "NOT_FOUND") {
		notFound();
	}

	throw error;
};

export interface FormError {
	message?: string;
	[key: string]: FormError | string | undefined;
}

export const flattenFormErrors = (obj: FormError, prefix = ""): string[] => {
	return Object.keys(obj).reduce((acc: string[], key) => {
		const pre = prefix.length ? `${prefix}.` : "";
		if (typeof obj[key] === "object" && obj[key] !== null) {
			const value = obj[key];
			if (value.message) {
				acc.push(value.message);
			} else {
				acc.push(...flattenFormErrors(value, `${pre}${key}`));
			}
		}
		return acc;
	}, []);
};

export const getAcronym = (text: string): string => {
	if (!text) return "";

	// Split the text into words and get first letter of each word
	return text
		.split(/\s+/)
		.map((word) => word.charAt(0))
		.join("");
};
