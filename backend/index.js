import { checkStock } from "./checkStock.js";
import { ITEMS_TO_MONITOR } from "./config.js";
import cron from "node-cron";

async function checkAllItems() {
  console.log("🔄 Starting stock check for all items...");
  for (const item of ITEMS_TO_MONITOR) {
    await checkStock(item);
  }
}

cron.schedule("0 * * * *", checkAllItems);
checkAllItems();
