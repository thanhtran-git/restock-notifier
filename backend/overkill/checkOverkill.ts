import puppeteer from "puppeteer";
import {
  handleStockResult,
  checkVariantPickerExists,
  logError,
} from "../stockUtils.ts";
import type { ItemToMonitor } from "../../types.ts";
import { SHOP_NAME } from "../../types.ts";

export async function checkStockOverkill(item: ItemToMonitor): Promise<void> {
  const { url, targetSize, name } = item;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

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
    if (!variantPickerExists) return;

    await page.waitForSelector("variant-picker", { timeout: 1000 });

    const sizeData = await page.evaluate(() => {
      const sizeLabels = document.querySelectorAll(
        "variant-picker label[data-eu]"
      );
      const sizes: Array<{ size: string; isSoldOut: boolean }> = [];

      sizeLabels.forEach((label) => {
        const sizeElement = label.querySelector("span.js-value");
        if (!sizeElement) return;

        const sizeText = sizeElement.textContent?.trim();
        if (
          !sizeText ||
          !(
            /^\d{2}(?:[ .]?\d\/\d)?$/.test(sizeText) ||
            /^(s|m|l|xl|2xl)$/i.test(sizeText) ||
            /^one size$/i.test(sizeText)
          )
        )
          return;

        const inputId = label.getAttribute("for");
        if (!inputId) return;

        const input = document.getElementById(inputId);
        if (!input) return;

        const isSoldOut = input.classList.contains("is-unavailable");

        sizes.push({ size: sizeText, isSoldOut });
      });

      return sizes;
    });

    let found = false;

    const sizeList = sizeData.map(({ size, isSoldOut }) => {
      if (size.toLowerCase() === targetSize.toLowerCase() && !isSoldOut) {
        found = true;
      }
      return `${size}${isSoldOut ? " (sold out)" : ""}`;
    });

    console.log(`🔍 Checking: ${name}`);
    console.log("Sizes:", sizeList);
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
    if (browser) {
      await browser.close();
    }
  }
}
