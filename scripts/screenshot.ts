/**
 * Captures full-page screenshots of every screen using the system Chrome
 * (playwright channel "chrome" — no browser download required).
 *
 *   npx tsx scripts/screenshot.ts <outputDir>
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const DEMO_EMAIL = "demo@recoverylab.test";
const DEMO_PASSWORD = "demo-password-123";
const EXPERIMENT_ID = process.env.DEMO_EXPERIMENT_ID ?? "";

async function main() {
  const outDir = process.argv[2] ?? "screenshots";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const shoot = async (name: string, path: string) => {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    // Scroll through the page so whileInView animations fire (as they do for
    // a real user), then return to top before the full-page capture.
    await page.evaluate(async () => {
      const step = window.innerHeight / 2;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
    console.log(`✓ ${name}`);
  };

  await shoot("01-landing", "/");
  await shoot("02-login", "/login");
  await shoot("03-privacy", "/privacy");

  // Sign in as the demo account
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").first().fill(DEMO_EMAIL);
  await page.getByLabel("Password").first().fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /sign in|back to the bench/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  await shoot("04-dashboard", "/dashboard");
  await shoot("05-new-experiment", "/experiments/new");
  if (EXPERIMENT_ID) await shoot("06-results", `/experiments/${EXPERIMENT_ID}`);
  await shoot("07-settings", "/dashboard/settings");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
