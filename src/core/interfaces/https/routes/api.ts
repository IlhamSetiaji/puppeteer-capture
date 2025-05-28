import { Router } from "express";
import { screenshotRoute } from "./screenshot-route";

const apiRoute = Router();

apiRoute.use("/screenshots", screenshotRoute); 

export { apiRoute };