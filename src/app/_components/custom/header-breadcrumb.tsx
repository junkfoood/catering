import { Fragment } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function HeaderBreadcrumb({
	breadcrumbs,
}: {
	breadcrumbs: {
		label: string;
		link: string;
	}[];
}) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((breadcrumb, index) => (
					<Fragment key={breadcrumb.label}>
						<BreadcrumbItem className="hidden md:block">
							<BreadcrumbLink href={breadcrumb.link}>
								{breadcrumb.label}
							</BreadcrumbLink>
						</BreadcrumbItem>
						{index < breadcrumbs.length - 1 && (
							<BreadcrumbSeparator className="hidden md:block" />
						)}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
