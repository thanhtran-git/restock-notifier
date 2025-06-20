import puppeteer from "puppeteer";
import { sendEmail } from "../emailer.ts";
import type { ItemToMonitor } from "../../types.ts";

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

    const variantPickerExists = (await page.$("variant-picker")) !== null;

    if (!variantPickerExists) {
      console.log(`🔍 Checking: ${name}`);
      console.log(
        `❌ All sizes sold out for '${name}' in Overkill. 🕐 ${new Date().toLocaleString()}`
      );
      return;
    }

    await page.waitForSelector("variant-picker", { timeout: 3000 });

    const sizeData = await page.evaluate(() => {
      const sizeLabels = document.querySelectorAll(
        "variant-picker label[data-eu]"
      );
      const sizes: Array<{ size: string; isSoldOut: boolean }> = [];

      sizeLabels.forEach((label) => {
        const sizeElement = label.querySelector("span.js-value");
        if (!sizeElement) return;

        const sizeText = sizeElement.textContent?.trim();
        if (!sizeText || !/^\d{2}(\.\d)?$/.test(sizeText)) return;

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
      if (size === targetSize && !isSoldOut) {
        found = true;
      }
      return `${size}${isSoldOut ? " (sold out)" : ""}`;
    });

    console.log(`🔍 Checking: ${name}`);
    console.log("Available sizes:", sizeList);

    if (found) {
      const message = `👟 Your size ${targetSize} is back in stock for "${name}"!\n${url}`;
      console.log(
        `✅ Size ${targetSize} available for '${name}' in Overkill. Sending email...`
      );
      await sendEmail(`👟 In Stock: ${name}`, message);
    } else {
      console.log(
        `❌ Size ${targetSize} still sold out for '${name}' in Overkill. 🕐 ${new Date().toLocaleString()}\n`
      );
    }
  } catch (err) {
    console.error(
      `❌ Error checking ${name}:`,
      err instanceof Error ? err.message : String(err)
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log(
      `_________________________________________________________________________________________________\n`
    );
  }
}
