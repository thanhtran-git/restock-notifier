import axios from "axios";
import * as cheerio from "cheerio";
import { handleStockResult, logError } from "../stockUtils.ts";
import type { ItemToMonitor } from "../../types.ts";

export async function checkStockVoostore(item: ItemToMonitor): Promise<void> {
  const { url, targetSize, name } = item;
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(html);
    const sizeList = $('div[data-dropdown="list"] ul li');

    let found = false;
    const sizes: string[] = [];

    sizeList.each((_, el) => {
      const input = $(el).find("input[type='radio']");
      const label = $(el).find("label").text().trim().replace(/\s+/g, " ");
      const isDisabled = input.is(":disabled");

      sizes.push(`${label}${isDisabled ? " (sold out)" : ""}`);

      if (
        label.toLocaleLowerCase() === targetSize.toLocaleLowerCase() &&
        !isDisabled
      ) {
        found = true;
      }
    });

    console.log(`🔍 Checking: ${name}`);
    console.log("Sizes:", sizes);
    await handleStockResult({ found, targetSize, name, url, shop: "Voostore" });
  } catch (err) {
    logError(`checking ${name}`, err);
  }
}
