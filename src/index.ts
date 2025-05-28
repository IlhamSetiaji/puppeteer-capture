/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { apiRoute } from "./core/interfaces/https/routes/api";

dotenv.config();

const app: Express = express();
const port: string | number = process.env.PORT || 3000;

const corsOrigin = {
  origin: "*", //or whatever port your frontend is using
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOrigin));
app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// File Middleware
app.use(
  "/avatars",
  express.static(path.join(__dirname, "./storage/uploads/avatars"))
);
app.use(
  "/logos",
  express.static(path.join(__dirname, "./storage/uploads/logos"))
);
app.use(
  "/banners",
  express.static(path.join(__dirname, "./storage/uploads/banners"))
);
app.use("/public", express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the API!");
});

app.use("/api", apiRoute);

app.listen(port, () => {
  console.log(`[Server]: Server is listening at https://localhost:${port}`);
});
