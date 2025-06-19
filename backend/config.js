import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const ITEMS_TO_MONITOR = JSON.parse(
  fs.readFileSync("./backend/items.json", "utf-8")
);

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const RECIPIENT = process.env.EMAIL_RECIPIENT;
