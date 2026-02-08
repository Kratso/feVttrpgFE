import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { FormEvent } from "react";
import type { TilePreset, TileSet } from "../api/types";
import { apiFetch } from "../api/client";
import { useAppDispatch } from "../store/hooks";
import { createMap } from "../store/slices/mapSlice";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import SelectInput from "../components/ui/SelectInput";
import Button from "../components/ui/Button";
import FloatingPanel from "../components/ui/FloatingPanel";
import TilePalette from "../features/maps/components/TilePalette";
import TileCanvas from "../features/maps/components/TileCanvas";
import PresetPalette from "../features/maps/components/PresetPalette";
import { buildGrid } from "../features/maps/utils/tileGrid";
import { applyPresetAt } from "../features/maps/utils/presetBrush";

const TILE_SIZE = 32;

export default function MapCreator() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [presets, setPresets] = useState<TilePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activeTileSetId, setActiveTileSetId] = useState<string | null>(null);
  const [mapName, setMapName] = useState("");
  const [tileCountX, setTileCountX] = useState(20);
  const [tileCountY, setTileCountY] = useState(15);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [tileGrid, setTileGrid] = useState<Array<Array<string | null>>>(() => buildGrid(15, 20));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [painting, setPainting] = useState(false);
  const [showTiles, setShowTiles] = useState(true);
  const [showPresets, setShowPresets] = useState(false);

  const activeTileSet = useMemo(
    () => tileSets.find((entry) => entry.id === activeTileSetId) ?? null,
    [activeTileSetId, tileSets]
  );

  const compatibleTileSets = useMemo(() => {
    if (!activeTileSet) return tileSets;
    return tileSets.filter(
      (entry) => entry.tileSizeX === activeTileSet.tileSizeX && entry.tileSizeY === activeTileSet.tileSizeY
    );
  }, [activeTileSet, tileSets]);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ tileSets: TileSet[] }>(`/campaigns/${campaignId}/tilesets`)
      .then((data) => setTileSets(data.tileSets))
      .catch((err: Error) => setError(err.message));
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ presets: TilePreset[] }>(`/campaigns/${campaignId}/presets`)
      .then((data) => setPresets(data.presets))
      .catch((err: Error) => setError(err.message));
  }, [campaignId]);

  useEffect(() => {
    setTileGrid(buildGrid(tileCountY, tileCountX));
  }, [tileCountX, tileCountY]);

  useEffect(() => {
    if (activeTileSet && activeTileSet.tiles.length > 0) {
      setSelectedTileId(activeTileSet.tiles[0].id);
    }
  }, [activeTileSet]);

  const activePreset = useMemo(
    () => presets.find((entry) => entry.id === activePresetId) ?? null,
    [activePresetId, presets]
  );

  const handlePaint = (row: number, col: number) => {
    setTileGrid((prev) => {
      if (activePreset) {
        return applyPresetAt(prev, activePreset.tileGrid, row, col);
      }
      const next = prev.map((line) => [...line]);
      next[row][col] = selectedTileId;
      return next;
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!campaignId || !activeTileSet) {
      setError("Select a tileset tab before creating a map");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await dispatch(
        createMap({
          campaignId,
          name: mapName,
          tileCountX,
          tileCountY,
          tileGrid,
          gridSizeX: activeTileSet.tileSizeX,
          gridSizeY: activeTileSet.tileSizeY,
        })
      ).unwrap();
      setMapName("");
      setTileGrid(buildGrid(tileCountY, tileCountX));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <h1>Map creator</h1>
      <p>Create new tile-based maps here. (DM only)</p>
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="form">
        <Field label="Map name">
          <TextInput value={mapName} onChange={(event) => setMapName(event.target.value)} required />
        </Field>
        <Field label="Tileset">
          <SelectInput
            value={activeTileSetId ?? ""}
            onChange={(event) => setActiveTileSetId(event.target.value || null)}
          >
            <option value="" disabled>
              Select a tileset
            </option>
            {tileSets.map((tileSet, index) => (
              <option key={`${tileSet.id}-${index}`} value={tileSet.id}>
                {tileSet.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Preset">
          <SelectInput value={activePresetId ?? ""} onChange={(event) => setActivePresetId(event.target.value || null)}>
            <option value="">No preset</option>
            {presets.map((preset, index) => (
              <option key={`${preset.id}-${index}`} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="stats-grid">
          <Field label="Tiles wide">
            <TextInput
              type="number"
              min={5}
              max={200}
              value={tileCountX}
              onChange={(event) => setTileCountX(Number(event.target.value))}
            />
          </Field>
          <Field label="Tiles tall">
            <TextInput
              type="number"
              min={5}
              max={200}
              value={tileCountY}
              onChange={(event) => setTileCountY(Number(event.target.value))}
            />
          </Field>
        </div>
        <Button type="submit" variant="primary" disabled={saving || !activeTileSet}>
          {saving ? "Saving..." : "Create map"}
        </Button>
      </form>

      {activeTileSet && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <FloatingPanel side="left" title="Presets" isOpen={showPresets} onToggle={() => setShowPresets(!showPresets)}>
            <PresetPalette
              presets={presets}
              tileSets={tileSets}
              activePresetId={activePresetId}
              onSelectPreset={(presetId) => {
                setActivePresetId(presetId);
                if (presetId) {
                  setSelectedTileId(null);
                }
              }}
            />
          </FloatingPanel>
          <FloatingPanel side="right" title="Tiles" size="wide" isOpen={showTiles} onToggle={() => setShowTiles(!showTiles)}>
            <TilePalette
              tileSets={compatibleTileSets}
              activeTileSet={activeTileSet}
              selectedTileId={selectedTileId}
              onSelectTileSet={setActiveTileSetId}
              onSelectTile={(tileId) => {
                setSelectedTileId(tileId);
                setActivePresetId(null);
              }}
              tileSize={TILE_SIZE}
              description="Click a tileset tab, then paint tiles onto the grid."
            />
          </FloatingPanel>
          <TileCanvas
            tileGrid={tileGrid}
            tileSets={tileSets}
            onPaintCell={handlePaint}
            isPainting={painting}
            onStartPaint={() => setPainting(true)}
            onStopPaint={() => setPainting(false)}
            tileSize={TILE_SIZE}
          />
        </div>
      )}
    </Panel>
  );
}
