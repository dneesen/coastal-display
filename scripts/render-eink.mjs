import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const width = Number(process.env.EINK_WIDTH || 1600);
const height = Number(process.env.EINK_HEIGHT || 900);
const baseUrl = process.env.EINK_URL || "http://127.0.0.1:5173/eink";
const output = process.env.EINK_OUTPUT || path.join("public", "renders", "latest-eink.png");

await mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
await page.screenshot({ path: output, fullPage: false });
await browser.close();

console.log(`Rendered ${baseUrl} at ${width}x${height} -> ${output}`);
