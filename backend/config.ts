import dotenv from "dotenv";
import fs from "fs";
import type { ItemToMonitor } from "../types";

dotenv.config();

export const ITEMS_TO_MONITOR: ItemToMonitor[] = JSON.parse(
  fs.readFileSync("./items.json", "utf-8")
);
export const EMAIL_USER: string | undefined = process.env.EMAIL_USER;
export const EMAIL_PASS: string | undefined = process.env.EMAIL_PASS;
export const RECIPIENT: string | undefined = process.env.EMAIL_RECIPIENT;
