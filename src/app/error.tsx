"use client";

import ErrorDisplay, { ErrorDisplayType } from "./_components/ui/error-display";

export default function ErrorPage() {
	return <ErrorDisplay type={ErrorDisplayType.DEFAULT} />;
}
