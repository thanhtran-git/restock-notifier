import { Browser, Page } from "puppeteer";
import ora from "ora";
import { handleStockResult, logError } from "../stockUtils.ts";
import type { ItemToMonitor } from "../../types.ts";
import { SHOP_NAME } from "../../types.ts";

export async function checkStockUniqlo(
  item: ItemToMonitor,
  browser: Browser
): Promise<void> {
  const { url, targetSize, name } = item;
  let page: Page | undefined;
  const spinner = ora("\n[Uniqlo] Lade Produktseite...").start();

  try {
    console.log(`\n🔍 Checking: ${name}`);
    console.log(`🎯 Target size: ${targetSize}`);

    page = await browser.newPage();

    // Konfiguriere Browser
    spinner.text = "[Uniqlo] Konfiguriere Browser...";
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigiere zur Produktseite
    spinner.text = "[Uniqlo] Navigiere zur Produktseite...";
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Warte auf Größen-Container
    spinner.text = "[Uniqlo] Warte auf Größen-Auswahl...";
    await page.waitForSelector(".size-chip-wrapper", { timeout: 10000 });

    // Kurz warten damit alle Größen geladen sind
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Analysiere verfügbare Größen
    spinner.text = "[Uniqlo] Analysiere Größenverfügbarkeit...";

    const { found, sizes } = await page.evaluate((targetSize: string) => {
      const sizeWrappers = document.querySelectorAll(".size-chip-wrapper");
      const sizes: string[] = [];
      let found = false;

      sizeWrappers.forEach((wrapper) => {
        // Extrahiere Größentext aus dem Button
        const sizeElement = wrapper.querySelector("button .typography");
        const sizeText = sizeElement?.textContent?.trim();

        if (sizeText) {
          // Prüfe ob die Größe durchgestrichen ist (ausverkauft)
          const strikeDiv = wrapper.querySelector("div.strike");
          const isAvailable = !strikeDiv; // Verfügbar wenn KEIN strike-div vorhanden

          // Füge zur Liste hinzu
          sizes.push(`${sizeText}${isAvailable ? "" : " (sold out)"}`);

          // Prüfe ob es die gesuchte Größe ist und verfügbar
          if (sizeText === targetSize && isAvailable) {
            found = true;
          }
        }
      });

      return { found, sizes };
    }, targetSize);

    spinner.succeed("[Uniqlo] Größen erfolgreich analysiert!");
    console.log("Verfügbare Größen:", sizes);

    await handleStockResult({
      found,
      targetSize,
      name,
      url,
      shop: SHOP_NAME.Uniqlo,
    });
  } catch (err) {
    if (spinner.isSpinning) spinner.fail("[Uniqlo] Fehler beim Check!");
    logError(`checking ${name}`, err);
  } finally {
    // Tab wird NICHT geschlossen - Browser schließt alle Tabs am Ende
    if (spinner.isSpinning) spinner.stop();
    console.log("");
    console.log(`[Uniqlo] ${name} - Check abgeschlossen (Tab bleibt offen)`);

    // Nach jedem Check mindestens 3 Sekunden warten (nur wenn nicht letzter Check)
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
