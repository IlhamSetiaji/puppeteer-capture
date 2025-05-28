import path from "path";
export interface IScreenshotUseCase {
  takeScreenshot(
    fileName: string,
    url: string,
    options?: {
      fullPage?: boolean;
      waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
      timeout?: number;
    }
  ): Promise<Buffer>;
  getScreenshotPath(fileName: string): Promise<string>;
}

export class ScreenshotUseCaseFactory {
  static create(): IScreenshotUseCase {
    const puppeteer = require("puppeteer");
    return new ScreenshotUseCase(puppeteer);
  }
}

class ScreenshotUseCase implements IScreenshotUseCase {
  private puppeteer: typeof import("puppeteer");

  constructor(puppeteer: typeof import("puppeteer")) {
    this.puppeteer = puppeteer;
  }

  async takeScreenshot(
    fileName: string,
    url: string,
    options: {
      fullPage?: boolean;
      waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
      timeout?: number;
    } = {}
  ): Promise<Buffer> {
    const SCREENSHOT_PATH = path.join(
      __dirname,
      "../../../",
      "public",
      fileName
    ) as `${string}.png`;
    const TARGET_URL = url || "https://www.google.com";

    const browser = await this.puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(TARGET_URL, {
      waitUntil: options.waitUntil || "networkidle2",
      timeout: options.timeout || 30000,
    });

    await page.screenshot({
      path: SCREENSHOT_PATH,
    });
    await browser.close();

    console.log("Screenshot taken at:", SCREENSHOT_PATH);
    return Buffer.from(SCREENSHOT_PATH, "utf-8");
  }

  async getScreenshotPath(fileName: string): Promise<string> {
    const SCREENSHOT_PATH = path.join(
      __dirname,
      "../../../",
      "public",
      fileName
    ) as `${string}.png`;

    return SCREENSHOT_PATH;
  }
}
