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
						<div className="flex items-center gap-2">
                        ⚠️ 
							<div className="flex flex-wrap items-center gap-2">
                                <strong>Disclaimer:</strong> This site is for price and menu comparison only. Information may not reflect the latest updates. Please check the official GeBiz{" "}
									<a
										href="https://sgdcs.sgnet.gov.sg/sites/VITAL-pts/SitePages/CateringServices(2024-2027).aspx"
										className="text-blue-600 underline hover:text-blue-800 font-semibold"
									>
										link
									</a>{" "}
                                    for the most current details.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Banner;
