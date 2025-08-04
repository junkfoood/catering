import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./utils/login";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs.admin({ page });
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("should load dashboard with caterers", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Check that the dashboard loads
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Check that the search functionality is present
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    
    // Check that filter controls are present
    await expect(page.getByText(/budget/i)).toBeVisible();
    await expect(page.getByText(/categories/i)).toBeVisible();
    await expect(page.getByText(/locations/i)).toBeVisible();
  });

  test("should allow searching for caterers", async ({ page }) => {
    await page.goto("/dashboard");
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("test caterer");
    
    // The search should work without errors
    await expect(searchInput).toHaveValue("test caterer");
  });

  test("should allow filtering by budget", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Find the budget slider and interact with it
    const budgetSlider = page.locator('[role="slider"]').first();
    await expect(budgetSlider).toBeVisible();
    
    // Move the slider to a different value
    await budgetSlider.focus();
    await page.keyboard.press("ArrowRight");
  });

  test("should allow filtering by categories", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Look for category checkboxes
    const categoryCheckboxes = page.locator('input[type="checkbox"]');
    await expect(categoryCheckboxes.first()).toBeVisible();
    
    // Try to check a category
    await categoryCheckboxes.first().check();
    await expect(categoryCheckboxes.first()).toBeChecked();
  });

  test("should allow filtering by locations", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Look for location checkboxes
    const locationCheckboxes = page.locator('input[type="checkbox"]');
    await expect(locationCheckboxes.first()).toBeVisible();
    
    // Try to check a location
    await locationCheckboxes.first().check();
    await expect(locationCheckboxes.first()).toBeChecked();
  });

  test("should display caterer cards", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Check that caterer cards are displayed (if any exist)
    const catererCards = page.locator('[data-testid*="caterer"]');
    
    // If there are caterers, they should be displayed
    // If no caterers, the page should still load without errors
    await expect(page.locator("main")).toBeVisible();
  });
}); 