import { NextFunction, Request, Response, Router } from "express";
import { ScreenshotHandlerFactory } from "../handlers/screenshot-handler";

const screenshotRoute = Router();
const screenshotHandler = ScreenshotHandlerFactory.create();

screenshotRoute.post("/", (req: Request, res: Response, next: NextFunction) => {
  screenshotHandler.takeScreenshot(req, res).catch(next);
});
screenshotRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  screenshotHandler.getScreenshotPath(req, res).catch((next));
});

export { screenshotRoute };