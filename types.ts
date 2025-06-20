export type Shop = "voostore" | "overkill";

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
