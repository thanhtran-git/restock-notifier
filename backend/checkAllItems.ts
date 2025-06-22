import { checkStockVoostore } from "./voostore/checkVoostore.ts";
import { checkStockOverkill } from "./overkill/checkOverkill.ts";
import { checkStockSolebox } from "./solebox/checkSolebox.ts";
import { ITEMS_TO_MONITOR } from "./config.ts";
import type { ItemToMonitor } from "../types.ts";
import { SHOP_NAME } from "../types.ts";

const SHOP_DISPATCH: Record<string, (item: ItemToMonitor) => Promise<void>> = {
  [SHOP_NAME.Voostore.toLowerCase()]: checkStockVoostore,
  [SHOP_NAME.Overkill.toLowerCase()]: checkStockOverkill,
  [SHOP_NAME.Solebox.toLowerCase()]: checkStockSolebox,
};

export async function checkAllItems(): Promise<void> {
  console.log("🔄 Starting stock check for all items...");

  const items: ItemToMonitor[] = ITEMS_TO_MONITOR;

  for (const item of items) {
    const checker = SHOP_DISPATCH[item.shop.toLowerCase()];
    if (checker) {
      await checker(item);
    } else {
      console.warn(`⚠️ Unknown shop: ${item.shop}`);
    }
  }
}
