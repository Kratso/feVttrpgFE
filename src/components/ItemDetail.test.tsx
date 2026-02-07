import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ItemDetail from "./ItemDetail";
import type { Item } from "../api/types";

describe("ItemDetail", () => {
  it("shows '-' for zero/null values except Crit, and filters zero bonus stats", () => {
    const item: Item = {
      id: "item-1",
      name: "Test Blade",
      type: "sword",
      category: "WEAPON",
      damageType: "PHYSICAL",
      weaponRank: "E",
      might: null,
      hit: null,
      crit: 0,
      weight: null,
      minRange: 1,
      maxRange: 1,
      rangeFormula: null,
      weaponExp: 1,
      uses: 0,
      price: null,
      description: "A basic test blade.",
      effectiveness: null,
      bonus: { STR: 0, MAG: 2 },
    };

    render(<ItemDetail item={item} />);

    const usesChip = screen.getByText("Uses").closest(".stat-chip");
    expect(usesChip).not.toBeNull();
    expect(within(usesChip as HTMLElement).getByText("-")).toBeInTheDocument();

    const priceChip = screen.getByText("Price").closest(".stat-chip");
    expect(priceChip).not.toBeNull();
    expect(within(priceChip as HTMLElement).getByText("-")).toBeInTheDocument();

    const critChip = screen.getByText("Crit").closest(".stat-chip");
    expect(critChip).not.toBeNull();
    expect(within(critChip as HTMLElement).getByText("0")).toBeInTheDocument();

    expect(screen.getByText("Bonus")).toBeInTheDocument();
    expect(screen.getByText("MAG")).toBeInTheDocument();
    expect(screen.queryByText("STR")).toBeNull();
  });
});
