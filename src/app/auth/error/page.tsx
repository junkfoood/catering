"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AuthErrorPage() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const [isRetrying, setIsRetrying] = useState(false);

	const getErrorMessage = (error: string | null) => {
		switch (error) {
			case "Configuration":
				return "Authentication configuration error. This usually happens when the authentication service is still initializing.";
			case "AccessDenied":
				return "Access denied. You may not have permission to access this application.";
			case "Verification":
				return "Verification failed. Please try again.";
			default:
				return "An authentication error occurred. Please try again.";
		}
	};

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			// Wait a bit for the auth service to fully initialize
			await new Promise(resolve => setTimeout(resolve, 2000));
			await signIn("sgid", { callbackUrl: "/menu" });
		} catch (err) {
			console.error("Retry failed:", err);
		} finally {
			setIsRetrying(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
						<AlertCircle className="h-6 w-6 text-red-600" />
					</div>
					<CardTitle className="text-xl font-semibold text-gray-900">
						Authentication Error
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-gray-600 text-center">
						{getErrorMessage(error)}
					</p>
					
					{error === "Configuration" && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-xs text-blue-800">
								<strong>Tip:</strong> This error often occurs on first login when the authentication service is still initializing. 
								Please wait a moment and try again.
							</p>
						</div>
					)}

					<div className="flex flex-col gap-2">
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
						
						<Button 
							variant="outline" 
							onClick={() => window.location.href = "/"}
							className="w-full"
						>
							Return to Home
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
