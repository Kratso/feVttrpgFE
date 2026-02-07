import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TilePalette from "./TilePalette";

const tileSets = [
  {
    id: "set-1",
    name: "Forest",
    imageUrl: "data:image/png;base64,AAA",
    tileSizeX: 32,
    tileSizeY: 32,
    columns: 2,
    rows: 1,
    tiles: [
      { id: "tile-1", tileSetId: "set-1", index: 0, imageUrl: "data:image/png;base64,AAA" },
      { id: "tile-2", tileSetId: "set-1", index: 1, imageUrl: "data:image/png;base64,AAA" },
    ],
  },
  {
    id: "set-2",
    name: "Town",
    imageUrl: "data:image/png;base64,BBB",
    tileSizeX: 32,
    tileSizeY: 32,
    columns: 1,
    rows: 1,
    tiles: [{ id: "tile-3", tileSetId: "set-2", index: 0, imageUrl: "data:image/png;base64,BBB" }],
  },
];

describe("TilePalette", () => {
  it("renders tileset tabs and selects tiles", () => {
    const onSelectTileSet = vi.fn();
    const onSelectTile = vi.fn();

    render(
      <TilePalette
        tileSets={tileSets}
        activeTileSet={tileSets[0]}
        selectedTileId="tile-1"
        onSelectTileSet={onSelectTileSet}
        onSelectTile={onSelectTile}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Town" }));
    expect(onSelectTileSet).toHaveBeenCalledWith("set-2");

    fireEvent.click(screen.getByLabelText("Tile 1"));
    expect(onSelectTile).toHaveBeenCalledWith("tile-2");
  });
});
