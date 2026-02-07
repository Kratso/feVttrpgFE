import { describe, it, expect } from "vitest";
import { applyPresetAt } from "./presetBrush";

describe("presetBrush", () => {
  it("applies non-null tiles from preset at target position", () => {
    const grid = [
      [null, null, null],
      [null, null, null],
    ];
    const preset = [
      ["a", null],
      [null, "b"],
    ];
    const next = applyPresetAt(grid, preset, 0, 1);
    expect(next[0][1]).toBe("a");
    expect(next[1][2]).toBe("b");
    expect(next[0][2]).toBeNull();
  });

  it("ignores tiles that would overflow the grid", () => {
    const grid = [[null]];
    const preset = [["x", "y"]];
    const next = applyPresetAt(grid, preset, 0, 0);
    expect(next[0][0]).toBe("x");
  });
});
