import { checkStockVoostore } from "./voostore/checkVoostore.ts";
import { checkStockOverkill } from "./overkill/checkOverkill.ts";
import { checkStockSolebox } from "./solebox/checkSolebox.ts";
import { checkStockUniqlo } from "./uniqlo/checkUniqlo.ts";
import { ITEMS_TO_MONITOR } from "./config.ts";
import type { ItemToMonitor } from "../types.ts";
import { SHOP_NAME } from "../types.ts";
import puppeteer from "puppeteer";

export async function checkAllItems(): Promise<void> {
  console.log("🔄 Starting stock check for all items...");

  const items: ItemToMonitor[] = ITEMS_TO_MONITOR;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    // @ts-expect-error ignoreHTTPSErrors is not a valid option for puppeteer.launch
    ignoreHTTPSErrors: true,
  });

  const shopDispatch: Record<string, (item: ItemToMonitor) => Promise<void>> = {
    [SHOP_NAME.Voostore.toLowerCase()]: checkStockVoostore,
    [SHOP_NAME.Overkill.toLowerCase()]: (item) =>
      checkStockOverkill(item, browser),
    [SHOP_NAME.Solebox.toLowerCase()]: (item) =>
      checkStockSolebox(item, browser),
    [SHOP_NAME.Uniqlo.toLowerCase()]: (item) =>
      checkStockUniqlo(item, browser),
  };

  try {
    for (const item of items) {
      const checker = shopDispatch[item.shop.toLowerCase()];
      if (checker) {
        await checker(item);
      } else {
        console.warn(`⚠️ Unknown shop: ${item.shop}`);
      }
    }
  } finally {
    await browser.close();
  }
}
