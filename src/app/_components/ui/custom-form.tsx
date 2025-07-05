"use client";

import React from "react";
import { preventEnterKeySubmission } from "~/utils/utils";

const CustomForm = React.forwardRef<
	HTMLFormElement,
	React.HTMLAttributes<HTMLFormElement>
>(({ children, ...others }, ref) => {
	return (
		<form {...others} onKeyDown={preventEnterKeySubmission} ref={ref}>
			{children}
		</form>
	);
});

CustomForm.displayName = "CustomForm";

export default CustomForm;
