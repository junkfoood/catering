import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./utils/login";

test.describe("Authentication", () => {
  test("should allow admin user to login", async ({ page }) => {
    await loginAs.admin({ page });
    
    // Should redirect to dashboard after login
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show user button in navbar
    await expect(page.getByTestId("navbar-user-button")).toBeVisible();
    
    // Cleanup
    await logout({ page });
  });

  test("should allow regular user to login", async ({ page }) => {
    await loginAs.user({ page });
    
    // Should redirect to dashboard after login
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show user button in navbar
    await expect(page.getByTestId("navbar-user-button")).toBeVisible();
    
    // Cleanup
    await logout({ page });
  });

  test("should allow user to logout", async ({ page }) => {
    await loginAs.admin({ page });
    
    // Verify we're logged in
    await expect(page.getByTestId("navbar-user-button")).toBeVisible();
    
    // Logout
    await logout({ page });
    
    // Should be back on home page with login button
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("should redirect authenticated users from home page", async ({ page }) => {
    await loginAs.admin({ page });
    
    // Try to go to home page while logged in
    await page.goto("/");
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Cleanup
    await logout({ page });
  });
}); 