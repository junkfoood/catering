import ErrorDisplay, { ErrorDisplayType } from "./_components/ui/error-display";

export default function Unauthorized() {
	return <ErrorDisplay type={ErrorDisplayType.UNAUTHORIZED} />;
}
