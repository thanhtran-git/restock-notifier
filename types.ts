export type Shop = "voostore" | "overkill" | "uniqlo";

export interface ItemToMonitor {
  url: string;
  targetSize: string;
  name: string;
  shop: Shop;
}

export type StockResultParams = {
  found: boolean;
  targetSize: string;
  name: string;
  url: string;
  shop: string;
};

export interface CheckVariantPickerExistsParams {
  page: import("puppeteer").Page;
  name: string;
  selector?: string;
  shop?: string;
}

export const SHOP_NAME = {
  Voostore: "Voostore",
  Overkill: "Overkill",
  Solebox: "Solebox",
  Uniqlo: "Uniqlo",
} as const;
