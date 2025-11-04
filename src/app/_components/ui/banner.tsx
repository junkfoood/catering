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
								This site provides price and menu comparison only and information may not reflect the latest updates. Please submit feedback through this{" "} 
								<a
									href="https://go.gov.sg/cateringfeedback"
									className="text-blue-600 underline hover:text-blue-800 font-semibold"
								>
								form
								</a>
								{" "}and refer to{" "}
								<a
									href="https://sgdcs.sgnet.gov.sg/sites/VITAL-pts/SitePages/CateringServices(2024-2027).aspx"
									className="text-blue-600 underline hover:text-blue-800 font-semibold"
								>
									VITAL infosite
								</a>
								{" "}for the most current details.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Banner;
