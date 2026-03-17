"use client";

import { useState } from "react";

export const Banner = () => {
	const [isBannerVisible] = useState(true);

	if (!isBannerVisible) return null;

	return (
		<div
			id="banner"
			className="bg-orange-50 text-sm text-gray-800 border-l-4 border-orange-400 shadow-lg"
			aria-label="Banner notification"
		>
			<div className="px-3 lg:container lg:px-6">
				<div className="flex items-center justify-between py-3">
					<div className="flex items-center gap-3">
						<div className="flex items-start gap-2">
                        ⚠️ 
							<div>
								<strong>Disclaimer:</strong>{" "}
								This site is a prototype for the Catering Demand Aggregation by GovTech for quick price and menu comparisons. The menu information may not be 100% accurate.We may update it regularly but the {" "} 
								{" "}
								<a
									href="https://sgdcs.sgnet.gov.sg/sites/VITAL-pts/SitePages/CateringServices(2024-2027).aspx"
									className="text-blue-600 underline hover:text-blue-800 font-semibold"
								>
									VITAL infosite
								</a>
								{" "}remains the source of truth. Please verify menu details there before issuing any Purchase Orders.
								<br></br><br></br>
								If you have feedback about the site itself (not the VITAL infosite and/or VITAL Catering DA contract), please share it through this{" "} 
								<a
									href="https://go.gov.sg/cateringfeedback"
									className="text-blue-600 underline hover:text-blue-800 font-semibold"
								>
								form
								</a>
								.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Banner;
