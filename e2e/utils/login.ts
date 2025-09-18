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

	//Click through MockPass
	await page.locator("input#id-input").click();

	await page.locator("input#id-input").fill(user);

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
