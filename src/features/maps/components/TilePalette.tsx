import type { TileSet } from "../../../api/types";
import Button from "../../../components/ui/Button";

const DEFAULT_TILE_SIZE = 32;
const DEFAULT_HEIGHT = 360;

type TilePaletteProps = {
  tileSets: TileSet[];
  activeTileSet: TileSet | null;
  selectedTileId: string | null;
  onSelectTileSet: (tileSetId: string) => void;
  onSelectTile: (tileId: string) => void;
  tileSize?: number;
  height?: number;
  title?: string;
  description?: string;
};

export default function TilePalette({
  tileSets,
  activeTileSet,
  selectedTileId,
  onSelectTileSet,
  onSelectTile,
  tileSize = DEFAULT_TILE_SIZE,
  height = DEFAULT_HEIGHT,
  title = "Tile palette",
  description = "Switch tilesets with tabs, then paint tiles onto the grid.",
}: TilePaletteProps) {
  if (!activeTileSet) {
    return (
      <div className="card">
        <h3>{title}</h3>
        <p className="muted">Select a tileset to begin.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {tileSets.map((tileSet) => (
          <Button
            key={tileSet.id}
            type="button"
            variant={tileSet.id === activeTileSet.id ? "primary" : "ghost"}
            onClick={() => onSelectTileSet(tileSet.id)}
          >
            {tileSet.name}
          </Button>
        ))}
      </div>
      <div
        style={{
          maxHeight: `${height}px`,
          overflow: "auto",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          borderRadius: 0,
          padding: "8px",
          background: "rgba(15, 23, 42, 0.6)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${activeTileSet.columns}, ${tileSize}px)`,
            gap: "4px",
          }}
        >
          {[...activeTileSet.tiles]
            .sort((a, b) => a.index - b.index)
            .map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => onSelectTile(tile.id)}
                style={{
                  width: `${tileSize}px`,
                  height: `${tileSize}px`,
                  border:
                    tile.id === selectedTileId
                      ? "2px solid rgba(129, 140, 248, 0.9)"
                      : "1px solid rgba(148, 163, 184, 0.4)",
                  borderRadius: 0,
                  padding: 0,
                  backgroundImage: `url(${tile.imageUrl})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                aria-label={`Tile ${tile.index}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
