import ErrorDisplay, { ErrorDisplayType } from "./_components/ui/error-display";

export default function NotFound() {
	return <ErrorDisplay type={ErrorDisplayType.NOT_FOUND} />;
}
