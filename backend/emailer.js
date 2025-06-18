import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS, RECIPIENT } from "./config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

export function sendEmail(subject, message) {
  return transporter.sendMail({
    from: EMAIL_USER,
    to: RECIPIENT,
    subject,
    text: message,
  });
}
