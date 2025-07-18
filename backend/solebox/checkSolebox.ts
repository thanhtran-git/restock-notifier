import ora from "ora";
import { closeCookieBanner } from "./cookieBannerSolebox.ts";
import { closeCountryBanner } from "./countryBanner.ts";
import { Browser } from "puppeteer";
import { handleStockResult, logError } from "../stockUtils.ts";
import { SHOP_NAME } from "../../types.ts";
import type { ItemToMonitor } from "../../types.ts";

export async function checkStockSolebox(
  item: ItemToMonitor,
  browser: Browser
): Promise<void> {
  const { url, targetSize, name } = item;
  let page;
  const spinner = ora("\n[Solebox] Lade Produktseite...").start();

  try {
    console.log(`\n🔍 Checking: ${name}`);
    page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1440 });
    spinner.text = "[Solebox] Seite wird geladen...";
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((res) => setTimeout(res, 3000));
    spinner.text = "[Solebox] Cookie-Banner wird geschlossen...";
    await closeCookieBanner(page);
    await new Promise((res) => setTimeout(res, 3000));
    spinner.text = "[Solebox] Länder-Banner wird geschlossen...";
    await closeCountryBanner(page);
    await new Promise((res) => setTimeout(res, 3000));
    spinner.text = "[Solebox] Warte auf Größen-Auswahl...";
    await page.waitForSelector("span.select-size", { timeout: 5000 });
    await new Promise((res) => setTimeout(res, 3000));

    const selectSize = await page.$("span.select-size");
    if (selectSize) {
      const box = await selectSize.boundingBox();
      if (!box) {
        throw new Error("span.select-size ist nicht sichtbar/klickbar");
      }
      await selectSize.click();
      await new Promise((res) => setTimeout(res, 5000));
    } else {
      throw new Error("span.select-size nicht gefunden oder nicht klickbar");
    }
    await page.waitForSelector("sni-lib-product-size-selection", {
      timeout: 5000,
    });

    const { found, sizes } = await page.evaluate((targetSize) => {
      const modal = document.querySelector("sni-lib-product-size-selection");
      if (!modal) return { found: false, sizes: [] };
      const sizeButtons = modal.querySelectorAll(
        ".size-system-list button.size-system-name"
      );
      let found = false;
      const sizes: string[] = [];

      function normalizeSize(size: string) {
        size = size.trim();
        size = size.replace(/(\d+)\s*1\/2/g, "$1 ½");
        size = size.replace(/(\d+)\.?5/g, "$1 ½");
        size = size.replace(/(\d+)\s*½/g, "$1 ½");
        return size;
      }
      const normalizedTarget = normalizeSize(targetSize);
      sizeButtons.forEach((btn) => {
        const size = btn.querySelector(".size-name")?.textContent?.trim() || "";
        const isSoldOut = btn.classList.contains("soldOut");
        if (size) {
          sizes.push(isSoldOut ? `${size} (sold out)` : size);
        }
        if (
          normalizeSize(size).toLowerCase() ===
            normalizedTarget.toLowerCase() &&
          !isSoldOut
        ) {
          found = true;
        }
      });
      return { found, sizes };
    }, targetSize);

    spinner.succeed("[Solebox] Größen geladen!");
    console.log("Sizes:", sizes);

    await handleStockResult({
      found,
      targetSize,
      name,
      url,
      shop: SHOP_NAME.Solebox,
    });
  } catch (err) {
    if (spinner.isSpinning) spinner.fail("[Solebox] Fehler beim Check!");
    logError(`checking ${name}`, err);
  } finally {
    if (page && !page.isClosed()) {
      try {
        await page.close();
        spinner.stop();
        console.log("[Solebox] Tab geschlossen");
      } catch (closeErr) {
        console.warn("Fehler beim Schließen der Seite:", closeErr);
      }
    }
  }
  // Nach jedem Check mindestens 8 Sekunden warten
  await new Promise((res) => setTimeout(res, 8000));
}
