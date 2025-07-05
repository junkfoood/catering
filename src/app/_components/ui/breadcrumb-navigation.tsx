import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import Link from "next/link";
import { Fragment } from "react";
import { Route } from "~/utils/route";

export function BreadcrumbNavigation({ routes }: { routes: Route[] }) {
	return (
		<Breadcrumb>
			<BreadcrumbList key="breadcrumb-list">
				{routes.map((route, index) => (
					<Fragment key={`${route.label}-${route.link}`}>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href={route.link}>{route.label}</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						{index !== routes.length - 1 && <BreadcrumbSeparator />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
