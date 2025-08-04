import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Catering Compare/);
    
    // Check that the main heading is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Welcome to Catering Compare")).toBeVisible();
    
    // Check that login button is present
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("should have proper navigation elements", async ({ page }) => {
    await page.goto("/");
    
    // Check that the navbar is present
    await expect(page.locator("nav")).toBeVisible();
    
    // Check that the page shell is rendered
    await expect(page.locator("[data-testid='page-shell']")).toBeVisible();
  });
}); 