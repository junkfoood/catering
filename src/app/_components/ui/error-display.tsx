export enum ErrorDisplayType {
	DEFAULT,
	NOT_FOUND,
	UNAUTHORIZED,
	FORBIDDEN,
}

interface ErrorDisplayProps {
	type: ErrorDisplayType;
	customHeader?: string;
	customMessage?: string;
}

export default function ErrorDisplay({
	type,
	customHeader,
	customMessage,
}: ErrorDisplayProps) {
	let header = "";
	let description = "";

	switch (type) {
		case ErrorDisplayType.DEFAULT:
			header = "Something went wrong!";
			description = "An error occurred while processing your request.";
			break;
		case ErrorDisplayType.NOT_FOUND:
			header = "Page not found";
			description =
				"The page you are looking for can't be found, please check the URL again.";
			break;
		case ErrorDisplayType.UNAUTHORIZED:
			header = "Not currently logged in";
			description = "Please log in to continue.";
			break;
		case ErrorDisplayType.FORBIDDEN:
			header = "Forbidden";
			description = "You are not authorized to view this page.";
			break;
	}

	return (
		<div className="flex flex-col grow justify-center items-center space-y-4">
			<h1 className="text-3xl font-bold tracking-tight">
				{customHeader ?? header}
			</h1>
			<p className="text-gray-500">{customMessage ?? description}</p>
		</div>
	);
}
