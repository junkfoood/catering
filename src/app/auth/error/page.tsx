"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface ErrorConfig {
	title: string;
	message: string;
	icon: React.ReactNode;
	showRetry?: boolean;
	showHome?: boolean;
	showBack?: boolean;
	tip?: string;
}

export default function ErrorPage() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const type = searchParams.get("type") || "auth";
	const [isRetrying, setIsRetrying] = useState(false);

	const getErrorConfig = (errorType: string, errorCode: string | null): ErrorConfig => {
		switch (errorType) {
			case "auth":
				return getAuthErrorConfig(errorCode);
			case "network":
				return getNetworkErrorConfig(errorCode);
			case "permission":
				return getPermissionErrorConfig(errorCode);
			case "not-found":
				return getNotFoundErrorConfig(errorCode);
			default:
				return getGenericErrorConfig(errorCode);
		}
	};

	const getAuthErrorConfig = (errorCode: string | null): ErrorConfig => {
		switch (errorCode) {
			case "Configuration":
				return {
					title: "Authentication Configuration Error",
					message: "There is a problem with the authentication configuration. Please contact your administrator or try again later.",
					icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
					showRetry: true,
					showHome: true,
					tip: "This error typically indicates missing or incorrect authentication settings. If the problem persists, please contact support."
				};
			case "AccessDenied":
				return {
					title: "Access Denied",
					message: "You may not have permission to access this application.",
					icon: <AlertCircle className="h-6 w-6 text-red-600" />,
					showHome: true,
					showBack: true
				};
			case "Verification":
				return {
					title: "Verification Failed",
					message: "Authentication verification failed. Please try again.",
					icon: <AlertCircle className="h-6 w-6 text-red-600" />,
					showRetry: true,
					showHome: true
				};
			default:
				return {
					title: "Authentication Error",
					message: "An authentication error occurred. Please try again.",
					icon: <AlertCircle className="h-6 w-6 text-red-600" />,
					showRetry: true,
					showHome: true
				};
		}
	};

	const getNetworkErrorConfig = (errorCode: string | null): ErrorConfig => {
		return {
			title: "Network Error",
			message: "Unable to connect to the server. Please check your internet connection and try again.",
			icon: <AlertCircle className="h-6 w-6 text-red-600" />,
			showRetry: true,
			showHome: true,
			tip: "Check your internet connection and try refreshing the page."
		};
	};

	const getPermissionErrorConfig = (errorCode: string | null): ErrorConfig => {
		return {
			title: "Permission Denied",
			message: "You don't have permission to access this resource.",
			icon: <AlertCircle className="h-6 w-6 text-red-600" />,
			showHome: true,
			showBack: true
		};
	};

	const getNotFoundErrorConfig = (errorCode: string | null): ErrorConfig => {
		return {
			title: "Page Not Found",
			message: "The page you're looking for doesn't exist or has been moved.",
			icon: <AlertCircle className="h-6 w-6 text-gray-600" />,
			showHome: true,
			showBack: true
		};
	};

	const getGenericErrorConfig = (errorCode: string | null): ErrorConfig => {
		return {
			title: "Something Went Wrong",
			message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
			icon: <AlertCircle className="h-6 w-6 text-red-600" />,
			showRetry: true,
			showHome: true
		};
	};

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			// Wait a bit before retrying
			await new Promise(resolve => setTimeout(resolve, 2000));
			// Reload the page
			window.location.reload();
		} catch (err) {
			console.error("Retry failed:", err);
		} finally {
			setIsRetrying(false);
		}
	};

	const handleGoHome = () => {
		window.location.href = "/";
	};

	const handleGoBack = () => {
		window.history.back();
	};

	const errorConfig = getErrorConfig(type, error);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
						{errorConfig.icon}
					</div>
					<CardTitle className="text-xl font-semibold text-gray-900">
						{errorConfig.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-gray-600 text-center">
						{errorConfig.message}
					</p>
					
					{errorConfig.tip && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-xs text-blue-800">
								<strong>Tip:</strong> {errorConfig.tip}
							</p>
						</div>
					)}

					<div className="flex flex-col gap-2">
						{errorConfig.showRetry && (
							<Button 
								onClick={handleRetry}
								disabled={isRetrying}
								className="w-full"
							>
								{isRetrying ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Retrying...
									</>
								) : (
									<>
										<RefreshCw className="mr-2 h-4 w-4" />
										Try Again
									</>
								)}
							</Button>
						)}
						
						{errorConfig.showBack && (
							<Button 
								variant="outline" 
								onClick={handleGoBack}
								className="w-full"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Go Back
							</Button>
						)}

						{errorConfig.showHome && (
							<Button 
								variant="outline" 
								onClick={handleGoHome}
								className="w-full"
							>
								<Home className="mr-2 h-4 w-4" />
								Return to Home
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
