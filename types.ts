export type Shop = "voostore" | "overkill";

export interface ItemToMonitor {
  url: string;
  targetSize: string;
  name: string;
  shop: Shop;
}
