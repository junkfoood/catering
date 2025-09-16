import { expect, type Page } from "@playwright/test";

export const MockAccount = {
	chinYong:
		"SONG CHIN YONG [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
	elizaberth:
		"ELIZABERTH PIERCE JOHNSON [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
	chenQiFa:
		"CHENG QI FA [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
	limYongXiang:
		"LIM YONG XIANG [Lead Software Engineer - LLv2 (Manager of Others) (WAS)]",
	timothy:
		"TIMOTHY TAN CHENG GUAN [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
	shongBoon:
		"LIM SHONG BOON [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
	bernard:
		"BERNARD WONG [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
	freya:
		"FREYA LIM GUO EN [Senior Software Engineer - LLv1 (Individual Contributor) (WAS)]",
};

export const loginAs = {
	admin: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.limYongXiang }),
	user: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.chinYong }),
	limYongXiang: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.limYongXiang }),
	songChinYong: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.chinYong }),
	elizaberth: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.elizaberth }),
	chenQiFa: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.chenQiFa }),
	timothy: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.timothy }),
	shongBoon: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.shongBoon }),
	bernard: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.bernard }),
	freya: async ({ page }: { page: Page }) =>
		loginAsUser({ page, user: MockAccount.freya }),
};

const loginAsUser = async ({ page, user }: { page: Page; user: string }) => {
	await page.goto("/");

	// Click login button
	await page.getByRole("button", { name: "Login" }).click();
	await page.getByRole("button", { name: "Login with sgID" }).click();

	await expect(page).toHaveTitle(/MockPass Login/);

	await page.getByRole("button", { name: "Login" }).click();

	//Click through MockPass - handle autocomplete/searchable dropdown
	// Try multiple selectors for MockPass dropdown/input
	const selectors = [
		"select", // Standard select dropdown
		"input[type='text']", // Text input
		"input#id-input", // Specific ID input
		"[data-testid='user-select']", // Test ID selector
		".user-dropdown", // Class-based selector
		"input", // Generic input
	];

	let elementFound = false;
	for (const selector of selectors) {
		const element = page.locator(selector);
		if (await element.isVisible()) {
			console.log(`Found element with selector: ${selector}`);
			
			if (selector === "select") {
				// Handle dropdown selection
				await element.selectOption({ label: user });
			} else {
				// Handle autocomplete/searchable input
				await element.click();
				await page.waitForTimeout(200);
				
				// Try different approaches to trigger dropdown
				// Method 1: Type a space to trigger dropdown
				await element.fill(" ");
				await page.waitForTimeout(300);
				await element.clear();
				
				// Method 2: Try typing the user name directly
				await element.fill(user);
				await page.waitForTimeout(500);
				
				// Method 3: Try pressing Enter to select
				await element.press("Enter");
				
				// Method 4: Try pressing Tab to move to next field
				await element.press("Tab");
				
				// Method 5: Look for dropdown options that might have appeared
				const dropdownOption = page.locator(`text=${user}`).first();
				if (await dropdownOption.isVisible()) {
					await dropdownOption.click();
				}
				
				// Method 6: Try clicking on any visible option
				const anyOption = page.locator("[role='option'], .dropdown-item, .autocomplete-option").first();
				if (await anyOption.isVisible()) {
					await anyOption.click();
				}
			}
			elementFound = true;
			break;
		}
	}

	if (!elementFound) {
		throw new Error("Could not find MockPass user selection element");
	}

	//Login button shouldn't be present
	await expect(page.getByRole("button", { name: "Login" })).not.toBeVisible({
		timeout: 10_000,
	});
};

export async function logout({ page }: { page: Page }) {
	await page.goto("/menu");

	await expect(page.getByTestId("navbar-user-button")).toBeVisible();

	//Click User Button
	await page.getByTestId("navbar-user-button").click();

	//Click Logout
	await page.getByRole("button", { name: "Sign Out" }).click();

	await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
}
