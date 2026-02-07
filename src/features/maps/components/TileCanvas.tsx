import type { Tile, TileSet } from "../../../api/types";

const DEFAULT_TILE_SIZE = 32;
const DEFAULT_HEIGHT = 520;

type TileCanvasProps = {
  tileGrid: Array<Array<string | null>>;
  tileSets: TileSet[];
  onPaintCell: (row: number, col: number) => void;
  isPainting: boolean;
  onStartPaint: () => void;
  onStopPaint: () => void;
  tileSize?: number;
  height?: number;
  title?: string;
};

const flattenTiles = (tileSets: TileSet[]) => tileSets.flatMap((entry) => entry.tiles);

const findTileById = (tiles: Tile[], tileId: string | null) =>
  tileId ? tiles.find((entry) => entry.id === tileId) ?? null : null;

export default function TileCanvas({
  tileGrid,
  tileSets,
  onPaintCell,
  isPainting,
  onStartPaint,
  onStopPaint,
  tileSize = DEFAULT_TILE_SIZE,
  height = DEFAULT_HEIGHT,
  title = "Paint grid",
}: TileCanvasProps) {
  const tiles = flattenTiles(tileSets);
  const tileCountX = tileGrid[0]?.length ?? 0;

  return (
    <div className="card">
      <h3>{title}</h3>
      <div
        onMouseDown={onStartPaint}
        onMouseUp={onStopPaint}
        onMouseLeave={onStopPaint}
        style={{
          height: `${height}px`,
          overflow: "auto",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          borderRadius: 0,
          background: "rgba(15, 23, 42, 0.6)",
          padding: "8px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${tileCountX}, ${tileSize}px)`,
            gap: "2px",
          }}
        >
          {tileGrid.map((row, rowIndex) =>
            row.map((tileId, colIndex) => {
              const tile = findTileById(tiles, tileId);
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onPaintCell(rowIndex, colIndex);
                  }}
                  onMouseEnter={() => isPainting && onPaintCell(rowIndex, colIndex)}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    padding: 0,
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: 0,
                    backgroundImage: tile ? `url(${tile.imageUrl})` : "none",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                  aria-label={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
