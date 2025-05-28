import puppeteer from "puppeteer";
import path from "path";
import { log } from "../utils/logger";

const TARGET_URL = "https://www.google.com";

async function takeScreenshot(
  fileName: string = "latest.png",
  url: string = TARGET_URL
) {
  const SCREENSHOT_PATH = path.join(
    __dirname,
    "../../",
    "public",
    fileName
  ) as `${string}.png`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await page.screenshot({ path: SCREENSHOT_PATH });
  await browser.close();
  console.log("Screenshot taken");
}

async function execute() {
  console.log("Starting screenshot process...");
  try {
    setInterval(async () => {
      await takeScreenshot();
    }, 10000);
  } catch (error) {
    console.error("Error taking screenshot:", error);
    log.error(error as Error, error as Record<string, unknown>);
  }
}

execute().catch(console.error);
