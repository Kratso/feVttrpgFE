import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FormEvent } from "react";
import type { TilePreset, TileSet } from "../api/types";
import { apiFetch } from "../api/client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMapDetail, fetchMaps, selectMap, updateMap } from "../store/slices/mapSlice";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import SelectInput from "../components/ui/SelectInput";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import TilePalette from "../features/maps/components/TilePalette";
import TileCanvas from "../features/maps/components/TileCanvas";
import { buildGrid, resizeGrid } from "../features/maps/utils/tileGrid";

const TILE_SIZE = 32;

export default function MapEditor() {
  const { campaignId, mapId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { maps, selectedMapId, error, loading, map } = useAppSelector((state) => state.maps);
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [presets, setPresets] = useState<TilePreset[]>([]);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [activeTileSetId, setActiveTileSetId] = useState<string | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [tileCountX, setTileCountX] = useState(20);
  const [tileCountY, setTileCountY] = useState(15);
  const [tileGrid, setTileGrid] = useState<Array<Array<string | null>>>(() => buildGrid(15, 20));
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [painting, setPainting] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchMaps(campaignId));
  }, [campaignId, dispatch]);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ tileSets: TileSet[] }>(`/campaigns/${campaignId}/tilesets`)
      .then((data) => setTileSets(data.tileSets))
      .catch((err: Error) => setLocalError(err.message));
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ presets: TilePreset[] }>(`/campaigns/${campaignId}/presets`)
      .then((data) => setPresets(data.presets))
      .catch((err: Error) => setLocalError(err.message));
  }, [campaignId]);

  useEffect(() => {
    if (!mapId) return;
    dispatch(selectMap(mapId));
    dispatch(fetchMapDetail(mapId));
  }, [mapId, dispatch]);

  const activeMapId = useMemo(() => selectedMapId ?? mapId ?? "", [mapId, selectedMapId]);
  const activeTileSet = useMemo(
    () => tileSets.find((entry) => entry.id === activeTileSetId) ?? null,
    [activeTileSetId, tileSets]
  );

  const onGo = () => {
    if (!campaignId || !activeMapId) return;
    navigate(`/campaigns/${campaignId}/maps/edit/${activeMapId}`);
  };

  useEffect(() => {
    if (!map) return;
    setTileCountX(map.tileCountX ?? 20);
    setTileCountY(map.tileCountY ?? 15);
    setTileGrid(
      map.tileGrid && map.tileCountX && map.tileCountY
        ? (map.tileGrid as Array<Array<string | null>>)
        : buildGrid(map.tileCountY ?? 15, map.tileCountX ?? 20)
    );
  }, [map]);

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
    const preset = presets.find((entry) => entry.id === presetId);
    if (!preset) return;
    setTileCountX(preset.tileCountX);
    setTileCountY(preset.tileCountY);
    setTileGrid(preset.tileGrid);
  }, [presetId, presets]);

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

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!map) {
      setLocalError("Select a map before updating");
      return;
    }
    setLocalError(null);
    setSaving(true);
    try {
      await dispatch(
        updateMap({
          mapId: map.id,
          tileCountX,
          tileCountY,
          tileGrid,
          gridSizeX: TILE_SIZE,
          gridSizeY: TILE_SIZE,
          gridOffsetX: map.gridOffsetX,
          gridOffsetY: map.gridOffsetY,
        })
      ).unwrap();
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <h1>Map editor</h1>
      <p>Edit tiles on existing maps here. (DM only)</p>
      <ErrorBanner message={error ?? localError} />
      {loading && <p>Loading maps...</p>}
      {!loading && maps.length === 0 && <p>No maps found for this campaign.</p>}
      {maps.length > 0 && (
        <div className="inline-form">
          <SelectInput value={activeMapId} onChange={(event) => dispatch(selectMap(event.target.value))}>
            <option value="" disabled>
              Select a map
            </option>
            {maps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </SelectInput>
          <Button type="button" variant="primary" onClick={onGo} disabled={!activeMapId}>
            Open editor
          </Button>
        </div>
      )}

      {map && activeTileSet && (
        <form onSubmit={onSubmit} className="form">
          <Field label="Preset">
            <SelectInput value={presetId ?? ""} onChange={(event) => setPresetId(event.target.value || null)}>
              <option value="">No preset</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
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
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Updating..." : "Update map"}
          </Button>
        </form>
      )}

      {map && activeTileSet && (
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
