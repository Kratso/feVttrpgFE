import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PresetPalette from "./PresetPalette";

const presets = [
  {
    id: "preset-1",
    name: "Camp",
    tileCountX: 2,
    tileCountY: 1,
    tileGrid: [["tile-1", null]],
    campaignId: "camp-1",
    createdAt: "2026-02-07T00:00:00.000Z",
  },
];

const tileSets = [
  {
    id: "set-1",
    name: "Forest",
    imageUrl: "data:image/png;base64,AAA",
    tileSizeX: 32,
    tileSizeY: 32,
    columns: 1,
    rows: 1,
    tiles: [{ id: "tile-1", tileSetId: "set-1", index: 0, imageUrl: "data:image/png;base64,AAA" }],
  },
];

describe("PresetPalette", () => {
  it("selects a preset and allows clearing to tile brush", () => {
    const onSelectPreset = vi.fn();
    render(
      <PresetPalette
        presets={presets}
        tileSets={tileSets}
        activePresetId={null}
        onSelectPreset={onSelectPreset}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Camp" }));
    expect(onSelectPreset).toHaveBeenCalledWith("preset-1");

    fireEvent.click(screen.getByRole("button", { name: "Tile brush" }));
    expect(onSelectPreset).toHaveBeenCalledWith(null);
  });
});
