import { Page } from "puppeteer";

export async function closeCountryBanner(page: Page): Promise<boolean> {
  await new Promise((res) => setTimeout(res, 5000));

  const popupVisible = await page.$("aside.modal-element");
  if (!popupVisible) return false;

  const buttonHandle = await page.$(
    "aside.modal-element sni-lib-button button, aside.modal-element button"
  );
  if (buttonHandle) {
    await buttonHandle.click();
    console.log('Klicke auf "ZUM SHOP" im Länder-/Sprachauswahl-Popup.');

    await new Promise((res) => setTimeout(res, 2000));
    return true;
  }
  return false;
}
