import { Request, Response } from "express";
import {
  IScreenshotUseCase,
  ScreenshotUseCaseFactory,
} from "../../../use-cases/screenshot-use-case";
import responseFormatter from "../../../../utils/response-formatter";
import { takeScreenshotRequest } from "../requests/screenshots/take-screenshot-request";
import fs from "fs";

class ScreenshotHandler {
  private readonly useCase: IScreenshotUseCase;

  constructor(useCase: IScreenshotUseCase) {
    this.useCase = useCase;
  }

  takeScreenshot = async (req: Request, res: Response): Promise<Response> => {
    try {
      const payload = takeScreenshotRequest.parse(req.body);
      const { fileName, url, options } = payload;

      const screenshotBuffer = await this.useCase.takeScreenshot(
        fileName,
        url,
        options
      );

      const screenshotPath = `/public/${fileName}`;
      return responseFormatter.success(
        res,
        {
          screenshotPath,
          screenshotBuffer: screenshotBuffer.toString("base64"),
        },
        "Screenshot taken successfully",
        201
      );
    } catch (error) {
      console.error("Error taking screenshot:", error);
      return responseFormatter.error(
        res,
        error,
        "Failed to take screenshot",
        500
      );
    }
  };

  getScreenshotPath = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    try {
      const { fileName } = req.params;
      const screenshotPath = await this.useCase.getScreenshotPath(
        fileName || "latest.png"
      );
      if (!fs.existsSync(screenshotPath)) {
        return responseFormatter.error(
          res,
          new Error("Screenshot file does not exist"),
          "Screenshot file not found",
          404
        );
      }
      return res.sendFile(screenshotPath);
    } catch (error) {
      console.error("Error retrieving screenshot path:", error);
      return responseFormatter.error(
        res,
        error,
        "Failed to retrieve screenshot path",
        500
      );
    }
  };
}

export class ScreenshotHandlerFactory {
  static create(): ScreenshotHandler {
    const useCase = ScreenshotUseCaseFactory.create();
    return new ScreenshotHandler(useCase);
  }
}
