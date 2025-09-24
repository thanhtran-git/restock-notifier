import { Browser, Page } from "puppeteer";
import ora from "ora";
import { handleStockResult, logError } from "../stockUtils.ts";
import type { ItemToMonitor } from "../../types.ts";
import { SHOP_NAME } from "../../types.ts";

export async function checkStockUniqlo(
  item: ItemToMonitor,
  browser: Browser,
  isFirstCheck: boolean = false
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

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Prüfe auf Cookie-Banner nur beim ersten Check
    if (isFirstCheck) {
      try {
        spinner.text =
          "[Uniqlo] Prüfe auf Cookie-Banner (nur beim ersten Check)...";

        // Warte kurz auf möglichen Cookie-Banner
        await page.waitForSelector("#onetrust-reject-all-handler", {
          timeout: 5000,
        });

        spinner.text =
          "[Uniqlo] Cookie-Banner gefunden - lehne alle Cookies ab...";
        await page.click("#onetrust-reject-all-handler");

        // Warte bis Banner verschwunden ist
        await page.waitForSelector("#onetrust-banner-sdk", {
          hidden: true,
          timeout: 5000,
        });

        console.log("✅ Cookies abgelehnt - gilt für alle weiteren Checks");
      } catch {
        // Cookie-Banner nicht gefunden oder bereits behandelt - das ist normal auf manchen Deployments
        console.log("ℹ️ Kein Cookie-Banner gefunden - fahre mit Check fort");
      }

      // Warte 5 Sekunden nach Cookie-Behandlung
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
      spinner.text = "[Uniqlo] Cookie-Banner bereits behandelt, überspringe...";
    }

    // Debug: Screenshot für Deployment-Debugging
    if (process.env.NODE_ENV === "production") {
      try {
        const screenshot = await page.screenshot({ fullPage: true, encoding: 'base64' });
        console.log("📸 DEBUG SCREENSHOT (Base64 - kopiere in Browser Address Bar):");
        console.log("data:image/png;base64," + screenshot);
        console.log("📸 Screenshot Ende");
      } catch {
        console.log("⚠️ Screenshot fehlgeschlagen");
      }
    }

    // Robuste Größen-Suche mit mehreren Selektoren
    spinner.text = "[Uniqlo] Warte auf Seitenladevorgang...";

    // Warte länger auf das vollständige Laden der Seite
    await new Promise((r) => setTimeout(r, 8000));

    spinner.text = "[Uniqlo] Suche nach Größen-Auswahl...";

    // Versuche verschiedene Selektoren
    const selectors = [
      ".size-chip-wrapper",
      "[data-testid*='size']",
      ".size-selector",
      ".product-size",
      "button[class*='size']",
      ".size-list button",
    ];

    let foundSelector = null;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        foundSelector = selector;
        console.log(`✅ Größen gefunden mit Selektor: ${selector}`);
        break;
      } catch {
        console.log(`❌ Selektor ${selector} nicht gefunden`);
      }
    }

    if (!foundSelector) {
      // Fallback: Analysiere verfügbare Selektoren
      const availableSelectors = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("*"))
          .map((el) => el.className)
          .filter(
            (className) =>
              className &&
              (className.includes("size") || className.includes("Size"))
          )
          .slice(0, 10);
      });

      console.log("🔍 Verfügbare size-related Klassen:", availableSelectors);
      throw new Error("Keine Größen-Selektoren gefunden");
    }

    // Kurz warten damit alle Größen geladen sind
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Analysiere verfügbare Größen mit dem gefundenen Selektor
    spinner.text = "[Uniqlo] Analysiere Größenverfügbarkeit...";

    const { found, sizes } = await page.evaluate(
      (targetSize: string, selector: string) => {
        const sizeWrappers = document.querySelectorAll(selector);
        const sizes: string[] = [];
        let found = false;

        console.log(`Gefundene Elemente mit ${selector}:`, sizeWrappers.length);

        sizeWrappers.forEach((wrapper, index) => {
          // Verschiedene Wege, um Größentext zu extrahieren
          let sizeText = "";

          // Methode 1: .typography Klasse
          const typographyElement =
            wrapper.querySelector("button .typography") ||
            wrapper.querySelector(".typography");
          if (typographyElement) {
            sizeText = typographyElement.textContent?.trim() || "";
          }

          // Methode 2: Direkter Button Text
          if (!sizeText && wrapper.tagName === "BUTTON") {
            sizeText = wrapper.textContent?.trim() || "";
          }

          // Methode 3: Text im Button
          if (!sizeText) {
            const buttonElement = wrapper.querySelector("button");
            if (buttonElement) {
              sizeText = buttonElement.textContent?.trim() || "";
            }
          }

          console.log(`Element ${index}: Text="${sizeText}"`);

          if (sizeText) {
            // Prüfe ob die Größe durchgestrichen ist (ausverkauft)
            const strikeDiv =
              wrapper.querySelector("div.strike") ||
              wrapper.querySelector(".strike");
            const buttonElement = wrapper.querySelector(
              "button"
            ) as HTMLButtonElement;
            const isDisabled = buttonElement?.disabled || false;
            const isAvailable = !strikeDiv && !isDisabled;

            // Füge zur Liste hinzu
            sizes.push(`${sizeText}${isAvailable ? "" : " (sold out)"}`);

            // Prüfe ob es die gesuchte Größe ist und verfügbar
            if (sizeText === targetSize && isAvailable) {
              found = true;
            }
          }
        });

        return { found, sizes };
      },
      targetSize,
      foundSelector
    );

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
