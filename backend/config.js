import dotenv from "dotenv";

dotenv.config();

export const ITEMS_TO_MONITOR = JSON.parse(process.env.ITEMS_JSON);

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const RECIPIENT = process.env.EMAIL_RECIPIENT;
