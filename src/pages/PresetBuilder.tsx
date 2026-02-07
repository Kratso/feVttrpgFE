import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { FormEvent } from "react";
import type { TilePreset, TileSet } from "../api/types";
import { apiFetch } from "../api/client";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import SelectInput from "../components/ui/SelectInput";
import Button from "../components/ui/Button";
import TilePalette from "../features/maps/components/TilePalette";
import TileCanvas from "../features/maps/components/TileCanvas";
import { buildGrid, resizeGrid } from "../features/maps/utils/tileGrid";

const TILE_SIZE = 32;

export default function PresetBuilder() {
  const { campaignId } = useParams();
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [presets, setPresets] = useState<TilePreset[]>([]);
  const [activeTileSetId, setActiveTileSetId] = useState<string | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const [tileCountX, setTileCountX] = useState(20);
  const [tileCountY, setTileCountY] = useState(15);
  const [tileGrid, setTileGrid] = useState<Array<Array<string | null>>>(() => buildGrid(15, 20));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [painting, setPainting] = useState(false);

  const activeTileSet = useMemo(
    () => tileSets.find((entry) => entry.id === activeTileSetId) ?? null,
    [activeTileSetId, tileSets]
  );

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ tileSets: TileSet[] }>(`/campaigns/${campaignId}/tilesets`)
      .then((data) => setTileSets(data.tileSets))
      .catch((err: Error) => setError(err.message));
  }, [campaignId]);

  const loadPresets = () => {
    if (!campaignId) return Promise.resolve();
    return apiFetch<{ presets: TilePreset[] }>(`/campaigns/${campaignId}/presets`)
      .then((data) => setPresets(data.presets))
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    loadPresets();
  }, [campaignId]);

  useEffect(() => {
    if (!activeTileSetId && tileSets.length > 0) {
      setActiveTileSetId(tileSets[0].id);
    }
  }, [activeTileSetId, tileSets]);

  useEffect(() => {
    if (activeTileSet && activeTileSet.tiles.length > 0) {
      setSelectedTileId(activeTileSet.tiles[0].id);
    }
  }, [activeTileSet]);

  useEffect(() => {
    setTileGrid((prev) => resizeGrid(prev, tileCountY, tileCountX));
  }, [tileCountX, tileCountY]);

  const handlePaint = (row: number, col: number) => {
    if (!selectedTileId) return;
    setTileGrid((prev) => {
      const next = prev.map((line) => [...line]);
      next[row][col] = selectedTileId;
      return next;
    });
  };

  const handleSelectPreset = (preset: TilePreset | null) => {
    if (!preset) {
      setPresetId(null);
      setPresetName("");
      setTileCountX(20);
      setTileCountY(15);
      setTileGrid(buildGrid(15, 20));
      return;
    }
    setPresetId(preset.id);
    setPresetName(preset.name);
    setTileCountX(preset.tileCountX);
    setTileCountY(preset.tileCountY);
    setTileGrid(preset.tileGrid);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/campaigns/${campaignId}/presets`, {
        method: "POST",
        body: JSON.stringify({
          name: presetName,
          tileCountX,
          tileCountY,
          tileGrid,
        }),
      });
      await loadPresets();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onUpdate = async () => {
    if (!presetId) return;
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/presets/${presetId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: presetName,
          tileCountX,
          tileCountY,
          tileGrid,
        }),
      });
      await loadPresets();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!presetId) return;
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/presets/${presetId}`, { method: "DELETE" });
      await loadPresets();
      handleSelectPreset(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <h1>Preset builder</h1>
      <p>Create reusable tile presets for map creation and editing.</p>
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="form">
        <Field label="Preset">
          <SelectInput
            value={presetId ?? ""}
            onChange={(event) =>
              handleSelectPreset(presets.find((preset) => preset.id === event.target.value) ?? null)
            }
          >
            <option value="">New preset</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Preset name">
          <TextInput value={presetName} onChange={(event) => setPresetName(event.target.value)} required />
        </Field>
        <div className="stats-grid">
          <Field label="Tiles wide">
            <TextInput
              type="number"
              min={1}
              max={200}
              value={tileCountX}
              onChange={(event) => setTileCountX(Number(event.target.value))}
            />
          </Field>
          <Field label="Tiles tall">
            <TextInput
              type="number"
              min={1}
              max={200}
              value={tileCountY}
              onChange={(event) => setTileCountY(Number(event.target.value))}
            />
          </Field>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save preset"}
          </Button>
          <Button type="button" variant="ghost" disabled={!presetId || saving} onClick={onUpdate}>
            Update preset
          </Button>
          <Button type="button" variant="ghost" disabled={!presetId || saving} onClick={onDelete}>
            Delete preset
          </Button>
        </div>
      </form>

      {activeTileSet && (
        <div style={{ display: "grid", gap: "1.25rem", marginTop: "1.5rem" }}>
          <TilePalette
            tileSets={tileSets}
            activeTileSet={activeTileSet}
            selectedTileId={selectedTileId}
            onSelectTileSet={setActiveTileSetId}
            onSelectTile={setSelectedTileId}
            tileSize={TILE_SIZE}
          />
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
