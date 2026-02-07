import type { TilePreset, TileSet } from "../../../api/types";
import Button from "../../../components/ui/Button";

const DEFAULT_TILE_SIZE = 16;
const DEFAULT_HEIGHT = 240;

type PresetPaletteProps = {
  presets: TilePreset[];
  tileSets: TileSet[];
  activePresetId: string | null;
  onSelectPreset: (presetId: string | null) => void;
  tileSize?: number;
  height?: number;
  title?: string;
  description?: string;
};

const flattenTiles = (tileSets: TileSet[]) => tileSets.flatMap((entry) => entry.tiles);

const resolveTileImage = (tileId: string | null, tiles: ReturnType<typeof flattenTiles>) => {
  if (!tileId) return null;
  return tiles.find((tile) => tile.id === tileId)?.imageUrl ?? null;
};

export default function PresetPalette({
  presets,
  tileSets,
  activePresetId,
  onSelectPreset,
  tileSize = DEFAULT_TILE_SIZE,
  height = DEFAULT_HEIGHT,
  title = "Preset brush",
  description = "Select a preset to paint it onto the map.",
}: PresetPaletteProps) {
  const tiles = flattenTiles(tileSets);

  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <Button
          type="button"
          variant={activePresetId ? "ghost" : "primary"}
          onClick={() => onSelectPreset(null)}
        >
          Tile brush
        </Button>
        {presets.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant={preset.id === activePresetId ? "primary" : "ghost"}
            onClick={() => onSelectPreset(preset.id)}
          >
            {preset.name}
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
          display: "grid",
          gap: "0.75rem",
        }}
      >
        {presets.length === 0 && <p className="muted">No presets available.</p>}
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            style={{
              textAlign: "left",
              padding: "8px",
              border: preset.id === activePresetId ? "2px solid rgba(129, 140, 248, 0.9)" : "1px solid rgba(148, 163, 184, 0.4)",
              borderRadius: 0,
              background: "rgba(15, 23, 42, 0.8)",
              display: "grid",
              gap: "0.5rem",
            }}
          >
            <div style={{ fontWeight: 600 }}>{preset.name}</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${preset.tileCountX}, ${tileSize}px)`,
                gap: "2px",
              }}
            >
              {preset.tileGrid.map((row, rowIndex) =>
                row.map((tileId, colIndex) => {
                  const imageUrl = resolveTileImage(tileId, tiles);
                  return (
                    <span
                      key={`${preset.id}-${rowIndex}-${colIndex}`}
                      aria-label={`Preset ${preset.name} cell ${rowIndex + 1}-${colIndex + 1}`}
                      style={{
                        width: `${tileSize}px`,
                        height: `${tileSize}px`,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        borderRadius: 0,
                        backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        display: "block",
                      }}
                    />
                  );
                })
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
