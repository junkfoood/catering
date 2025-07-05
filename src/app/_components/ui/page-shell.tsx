import React, { type ReactNode } from "react";

export interface PageShellProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	header?: ReactNode | null;
	body: ReactNode | null;
	footer?: ReactNode | null;
	footerClassName?: string;
}

const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
	({ header, body, footer, footerClassName, ...props }, ref) => {
		return (
			<div className="flex flex-col" ref={ref} {...props}>
				{header && <div className=" bg-white px-4 py-6 lg:px-32">{header}</div>}
				{body && <div className="px-4 py-6 lg:px-32">{body}</div>}
				{footer && (
					<div className={footerClassName ?? "px-4 py-6 lg:px-32"}>
						{footer}
					</div>
				)}
			</div>
		);
	},
);

PageShell.displayName = "PageShell";

export { PageShell };
