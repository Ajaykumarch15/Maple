import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import cors from "cors";
import type { ErrorRequestHandler } from "express";
import quotesRouter from "./routes/quotes.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/quotes", quotesRouter);

const distPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
app.use(errorHandler);

export default app;
