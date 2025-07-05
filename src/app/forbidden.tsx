import ErrorDisplay, { ErrorDisplayType } from "./_components/ui/error-display";

export default function Forbidden() {
	return <ErrorDisplay type={ErrorDisplayType.FORBIDDEN} />;
}
