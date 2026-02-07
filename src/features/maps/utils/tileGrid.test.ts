import { describe, it, expect } from "vitest";
import { buildGrid, resizeGrid } from "./tileGrid";

describe("tileGrid utils", () => {
  it("builds a grid of the requested size", () => {
    const grid = buildGrid(2, 3);
    expect(grid).toHaveLength(2);
    expect(grid[0]).toHaveLength(3);
    expect(grid[1]).toHaveLength(3);
  });

  it("resizes a grid while preserving existing values", () => {
    const grid = [
      ["a", null],
      [null, "b"],
    ];
    const resized = resizeGrid(grid, 3, 3);
    expect(resized[0][0]).toBe("a");
    expect(resized[1][1]).toBe("b");
    expect(resized).toHaveLength(3);
    expect(resized[0]).toHaveLength(3);
  });
});
