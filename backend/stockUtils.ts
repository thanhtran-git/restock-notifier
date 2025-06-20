import { sendEmail } from "./emailer.ts";
import type { StockResultParams } from "../types.ts";

export async function handleStockResult({
  found,
  targetSize,
  name,
  url,
  shop,
}: StockResultParams) {
  if (found) {
    const message = `👟 Your size ${targetSize} is back in stock for "${name}"!\n${url}`;
    console.log(
      `✅ Size ${targetSize} available for '${name}' in ${shop}. Sending email...`
    );
    await sendEmail(`👟 In Stock: ${name}`, message);
  } else {
    console.log(
      `❌ Size ${targetSize} still sold out for '${name}' in ${shop}. 🕐 ${new Date().toLocaleString()}`
    );
  }
  console.log(
    `_________________________________________________________________________________________________\n`
  );
}
