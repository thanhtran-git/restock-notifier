import nodemailer from "nodemailer";
import type { SentMessageInfo } from "nodemailer";
import { EMAIL_USER, EMAIL_PASS, RECIPIENT } from "./config.ts";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

export function sendEmail(
  subject: string,
  message: string
): Promise<SentMessageInfo> {
  return transporter.sendMail({
    from: EMAIL_USER,
    to: RECIPIENT,
    subject,
    text: message,
  });
}
