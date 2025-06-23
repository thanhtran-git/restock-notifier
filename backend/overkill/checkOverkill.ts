import { Browser } from "puppeteer";
import {
  handleStockResult,
  checkVariantPickerExists,
  logError,
} from "../stockUtils.ts";
import type { ItemToMonitor } from "../../types.ts";
import { SHOP_NAME } from "../../types.ts";

export async function checkStockOverkill(
  item: ItemToMonitor,
  browser: Browser
): Promise<void> {
  const { url, targetSize, name } = item;
  let page;

  try {
    console.log(`🔍 Checking: ${name}`);
    page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    const variantPickerExists = await checkVariantPickerExists({
      page,
      name,
      selector: "variant-picker",
      shop: SHOP_NAME.Overkill,
    });
    if (!variantPickerExists) {
      await page.close();
      return;
    }

    await page.waitForSelector("variant-picker", { timeout: 1000 });

    const { sizes, found } = await page.evaluate((targetSize) => {
      const sizeLabels = document.querySelectorAll(
        "variant-picker label[data-eu]"
      );
      const sizes: string[] = [];
      let found = false;

      sizeLabels.forEach((label) => {
        const sizeElement = label.querySelector("span.js-value");
        const sizeText = sizeElement?.textContent?.trim();
        const inputId = label.getAttribute("for");
        const input = inputId && document.getElementById(inputId);

        if (!sizeText || !input) return;

        const isSoldOut = input.classList.contains("is-unavailable");

        sizes.push(`${sizeText}${isSoldOut ? " (sold out)" : ""}`);

        if (sizeText.toLowerCase() === targetSize.toLowerCase() && !isSoldOut) {
          found = true;
        }
      });

      return { sizes, found };
    }, targetSize);

    console.log("Sizes:", sizes);
    await handleStockResult({
      found,
      targetSize,
      name,
      url,
      shop: SHOP_NAME.Overkill,
    });
  } catch (err) {
    logError(`checking ${name}`, err);
  } finally {
    // 3 Sekunden warten, bevor das Tab geschlossen wird
    await new Promise((res) => setTimeout(res, 3000));
    if (page && !page.isClosed()) {
      try {
        await page.close();
      } catch (closeErr) {
        console.warn("Fehler beim Schließen der Seite:", closeErr);
      }
    }
  }
}
