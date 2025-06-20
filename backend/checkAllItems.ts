import { checkStockVoostore } from "./voostore/checkVoostore.ts";
import { checkStockOverkill } from "./overkill/checkOverkill.ts";
import { ITEMS_TO_MONITOR } from "./config.ts";
import type { ItemToMonitor } from "../types.ts";

export async function checkAllItems(): Promise<void> {
  console.log("🔄 Starting stock check for all items...");

  const items: ItemToMonitor[] = ITEMS_TO_MONITOR;
  let unknownShop: never;

  for (const item of items) {
    switch (item.shop) {
      case "voostore":
        await checkStockVoostore(item);
        break;
      case "overkill":
        await checkStockOverkill(item);
        break;
      default:
        unknownShop = item.shop;
        console.warn(`⚠️ Unknown shop: ${unknownShop}`);
    }
  }
}
