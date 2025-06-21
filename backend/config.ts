import dotenv from "dotenv";
import fs from "fs";
import type { ItemToMonitor } from "../types";

dotenv.config();

let ITEMS_TO_MONITOR: ItemToMonitor[] = [];
try {
  ITEMS_TO_MONITOR = JSON.parse(fs.readFileSync("./items.json", "utf-8"));
} catch (err) {
  console.error(
    `❌ Fehler beim Parsen von items.json: ${
      err instanceof Error ? err.message : String(err)
    }`
  );
  process.exit(1);
}

export { ITEMS_TO_MONITOR };
export const EMAIL_USER: string | undefined = process.env.EMAIL_USER;
export const EMAIL_PASS: string | undefined = process.env.EMAIL_PASS;
export const RECIPIENT: string | undefined = process.env.EMAIL_RECIPIENT;
