import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TileCanvas from "./TileCanvas";

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

describe("TileCanvas", () => {
  it("paints on click and drag", () => {
    const onPaintCell = vi.fn();
    const onStartPaint = vi.fn();
    const onStopPaint = vi.fn();

    render(
      <TileCanvas
        tileGrid={[["tile-1", null]]}
        tileSets={tileSets}
        onPaintCell={onPaintCell}
        isPainting={true}
        onStartPaint={onStartPaint}
        onStopPaint={onStopPaint}
      />
    );

    fireEvent.mouseDown(screen.getByLabelText("Cell 1-1"));
    expect(onPaintCell).toHaveBeenCalledWith(0, 0);
    fireEvent.mouseEnter(screen.getByLabelText("Cell 1-2"));
    expect(onPaintCell).toHaveBeenCalledWith(0, 1);
  });

  it("starts and stops painting on mouse events", () => {
    const onPaintCell = vi.fn();
    const onStartPaint = vi.fn();
    const onStopPaint = vi.fn();

    render(
      <TileCanvas
        tileGrid={[[null]]}
        tileSets={tileSets}
        onPaintCell={onPaintCell}
        isPainting={false}
        onStartPaint={onStartPaint}
        onStopPaint={onStopPaint}
      />
    );

    fireEvent.mouseDown(screen.getByRole("button", { name: "Cell 1-1" }).parentElement as HTMLElement);
    expect(onStartPaint).toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole("button", { name: "Cell 1-1" }).parentElement as HTMLElement);
    expect(onStopPaint).toHaveBeenCalled();
  });
});
