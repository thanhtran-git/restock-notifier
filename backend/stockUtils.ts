import { sendEmail } from "./emailer.ts";
import type {
  StockResultParams,
  CheckVariantPickerExistsParams,
} from "../types.ts";

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

export async function checkVariantPickerExists({
  page,
  name,
  selector = "variant-picker",
  shop = "Overkill",
}: CheckVariantPickerExistsParams): Promise<{
  exists: boolean;
  logMsg?: string;
}> {
  const exists = (await page.$(selector)) !== null;
  let logMsg = undefined;
  if (!exists) {
    logMsg = `All sizes SOLD OUT for '${name}' in ${shop}. 🕐 ${new Date().toLocaleString()} \n_________________________________________________________________________________________________`;
  }
  return { exists, logMsg };
}

export function logError(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`❌ Error in ${context}: ${msg}`);
}
