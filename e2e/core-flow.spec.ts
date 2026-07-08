import { expect, test } from "@playwright/test";

test("landing page links to login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Recovery Lab" })).toBeVisible();
  await page.getByRole("link", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("login page shows sign-in and create-account tabs", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("tab", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Create account" })).toBeVisible();
});

test("sign-up rejects a password under 8 characters", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Email").fill(`test-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
});

test("dashboard redirects an unauthenticated visitor to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

/**
 * The full account → WHOOP connect → experiment → check-in → results flow
 * needs a real Supabase project (for signup/login) and a WHOOP sandbox
 * account (for OAuth), neither of which exist in CI by default. Configure
 * TEST_USER_EMAIL/TEST_USER_PASSWORD against a real project and a WHOOP
 * developer app with a test member added, then flip this to test().
 */
test.skip("full flow: register, connect WHOOP, run an experiment, check in, view results", async () => {
  // 1. Register with TEST_USER_EMAIL/TEST_USER_PASSWORD.
  // 2. Confirm email if "Confirm email" is enabled on the Supabase project.
  // 3. Click "Connect WHOOP" and complete the OAuth consent screen.
  // 4. Create an experiment via /experiments/new.
  // 5. Assert today's assignment card renders with instructions.
  // 6. Submit a check-in and assert the "saved" confirmation.
  // 7. Visit /experiments/[id] and assert the results card renders.
  // 8. Disconnect WHOOP from /dashboard/settings and assert the connect prompt returns.
  // 9. Delete the account and assert redirect to "/".
});
