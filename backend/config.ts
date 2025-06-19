import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

interface Item {
  url: string;
  targetSize: string;
  name: string;
}

export const ITEMS_TO_MONITOR: Item[] = JSON.parse(
  fs.readFileSync("./items.json", "utf-8")
);
export const EMAIL_USER: string | undefined = process.env.EMAIL_USER;
export const EMAIL_PASS: string | undefined = process.env.EMAIL_PASS;
export const RECIPIENT: string | undefined = process.env.EMAIL_RECIPIENT;
