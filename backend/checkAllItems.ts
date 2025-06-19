import { checkStock, type CheckStockParams } from "./checkStock.ts";
import { ITEMS_TO_MONITOR } from "./config.ts";

export async function checkAllItems(): Promise<void> {
  console.log("🔄 Starting stock check for all items...");
  for (const item of ITEMS_TO_MONITOR as CheckStockParams[]) {
    await checkStock(item);
  }
}
