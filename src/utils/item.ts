import type { Item } from "../api/types";

type RangeOptions = {
  mag?: number;
  fallback?: string | null;
};

export function getItemRangeLabel(item: Item, options: RangeOptions = {}): string | null {
  const { mag, fallback = "-" } = options;

  if (item.rangeFormula) {
    const formula = item.rangeFormula.toLowerCase();
    if (mag !== undefined && formula === "floor(mag/2)") {
      return String(Math.floor(mag / 2));
    }
    return item.rangeFormula;
  }

  const min = item.minRange;
  const max = item.maxRange;
  if (min === null && max === null) {
    return fallback;
  }

  if (min !== null && min !== undefined) {
    if (max !== null && max !== undefined) {
      return min === max ? String(min) : `${min}-${max}`;
    }
    return String(min);
  }

  if (max !== null && max !== undefined) {
    return String(max);
  }

  return fallback;
}
