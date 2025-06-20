import axios from "axios";
import * as cheerio from "cheerio";
import { sendEmail } from "../emailer.ts";
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

      if (label === targetSize && !isDisabled) {
        found = true;
      }
    });

    console.log(`🔍 Checking: ${name}`);
    console.log("Sizes:", sizes);

    if (found) {
      const message = `👟 Your size ${targetSize} is back in stock for "${name}"!\n${url}`;
      console.log(
        `✅ Size ${targetSize} available for '${name}' in Voostore. Sending email...`
      );
      await sendEmail(`👟 In Stock: ${name}`, message);
    } else {
      console.log(
        `❌ Size ${targetSize} still sold out for '${name}' in Voostore. 🕐 ${new Date().toLocaleString()}`
      );
    }
    console.log(
      `_________________________________________________________________________________________________\n`
    );
  } catch (err) {
    console.error(
      `❌ Error checking ${name}:`,
      err instanceof Error ? err.message : String(err)
    );
  }
}
