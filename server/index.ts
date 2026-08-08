import "dotenv/config";
import express from "express";
import type { ErrorRequestHandler } from "express";
import quotesRouter from "./routes/quotes";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/quotes", quotesRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Margin API listening on http://localhost:${port}`);
});
