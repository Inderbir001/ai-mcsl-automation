import { chromium } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

export async function crawlAndMap(targetUrl: string, pageName: string) {
  console.log(`Starting crawl for: ${targetUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    // Extract the new ARIA Snapshot (Returns clean YAML perfect for AI)
    const snapshot = await page.locator("body").ariaSnapshot();

    // Save it to our knowledge bank
    const safeName = pageName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filePath = path.join(
      process.cwd(),
      "knowledge-bank",
      `${safeName}.yaml`,
    );

    // Save the YAML string directly
    await fs.writeFile(filePath, snapshot, "utf-8");

    console.log(`✅ Successfully mapped ${pageName} to ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    console.error(`❌ Failed to crawl ${targetUrl}:`, error);
    return { success: false, error: String(error) };
  } finally {
    await browser.close();
  }
}
