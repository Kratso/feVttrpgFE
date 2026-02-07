import { describe, it, expect } from "vitest";

const applyPreset = (
  grid: Array<Array<string | null>>,
  tileCountX: number,
  tileCountY: number
) => {
  return {
    tileCountX,
    tileCountY,
    tileGrid: grid,
  };
};

describe("tile preset helpers", () => {
  it("keeps grid and dimensions", () => {
    const grid = [["a", null]];
    const preset = applyPreset(grid, 2, 1);
    expect(preset.tileCountX).toBe(2);
    expect(preset.tileCountY).toBe(1);
    expect(preset.tileGrid).toBe(grid);
  });
});
