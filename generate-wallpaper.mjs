import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs/promises";

const WIDTH = 1179;
const HEIGHT = 2556;

// Use UTC date so “daily” is stable in GitHub Actions.
const d = new Date();
const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD

const root = process.cwd();
const htmlPath = path.join(root, "scripts", "wallpaper.html");
const outPath = path.join(root, "site", "wallpaper.png");

const url = "file://" + htmlPath + `?d=${iso}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });

await page.goto(url, { waitUntil: "load" });

// small delay to ensure layout is final
await page.waitForTimeout(200);

const buf = await page.screenshot({ type: "png" });

await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, buf);

await browser.close();

console.log(`Generated ${outPath} for ${iso}`);
