import { checkStock } from "./checkStock.js";
import { ITEMS_TO_MONITOR } from "./config.js";

export async function checkAllItems() {
  console.log("🔄 Starting stock check for all items...");
  for (const item of ITEMS_TO_MONITOR) {
    await checkStock(item);
  }
}
