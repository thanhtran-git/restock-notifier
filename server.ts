import express from "express";
import { checkAllItems } from "./backend/checkAllItems.ts";
import cron from "node-cron";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send("Voostore Restock Notifier is running");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  checkAllItems();
  cron.schedule("0 * * * *", checkAllItems);
});
