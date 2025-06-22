import { Page } from "puppeteer";
export async function closeCookieBanner(page: Page): Promise<boolean> {
  const closed = await page.evaluate(() => {
    function findAndClickInShadow(root: Element | ShadowRoot): boolean {
      if (!root) return false;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!(node instanceof Element)) continue;

        if (node.tagName === "A" && node.classList.contains("cmpboxbtnno")) {
          (node as HTMLElement).click();
          return true;
        }

        const el = node as Element;
        if (el.shadowRoot) {
          if (findAndClickInShadow(el.shadowRoot)) return true;
        }
      }
      return false;
    }
    return findAndClickInShadow(document.body);
  });
  if (closed) {
    console.log("Klicke Cookie-Banner-Link a.cmpboxbtnno im Shadow DOM");
    await new Promise((res) => setTimeout(res, 2000));
  }
  return closed;
}
