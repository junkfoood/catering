import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepperProps {
	steps: string[];
	currentStep: number;
	className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
	return (
		<div className={cn("w-full", className)}>
			<div className="flex items-center gap-12 flex-wrap">
				{steps.map((step, index) => (
					<div key={index} className="flex gap-2 items-center">
						<div
							className={cn(
								"flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-medium",
								index <= currentStep
									? "border-slate-800 bg-slate-800 text-white"
									: "border-muted-foreground/25 text-muted-foreground/25",
							)}
						>
							{index < currentStep ? (
								<CheckIcon className="h-5 w-5" />
							) : (
								index + 1
							)}
						</div>
						<p
							className={cn(
								"text-lg font-semibold",
								index <= currentStep
									? "text-slate-800"
									: "text-muted-foreground/25",
							)}
						>
							{step}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
