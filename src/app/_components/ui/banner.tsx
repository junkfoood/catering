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
								This site provides price and menu comparison only. Menu classifications for <span className="text-green-600">vegetarian</span> or <span className="text-orange-900">deep fried</span> may not always be accurate, so please refer to{" "} 
								{" "}and refer to{" "}
								<a
									href="https://sgdcs.sgnet.gov.sg/sites/VITAL-pts/SitePages/CateringServices(2024-2027).aspx"
									className="text-blue-600 underline hover:text-blue-800 font-semibold"
								>
									VITAL infosite
								</a>
								{" "}for the most current and verified details.
								<br></br>
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
