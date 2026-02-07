import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { FormEvent } from "react";
import type { TileSet } from "../api/types";
import { apiFetch, apiUpload } from "../api/client";
import Panel from "../components/ui/Panel";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function Tilesets() {
  const { campaignId } = useParams();
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tileSizeX, setTileSizeX] = useState(32);
  const [tileSizeY, setTileSizeY] = useState(32);
  const [columns, setColumns] = useState(8);
  const [rows, setRows] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);

  const expectedSize = useMemo(
    () => ({ width: columns * tileSizeX, height: rows * tileSizeY }),
    [columns, rows, tileSizeX, tileSizeY]
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setPreviewSize(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const loadTileSets = async () => {
    if (!campaignId) return;
    const data = await apiFetch<{ tileSets: TileSet[] }>(`/campaigns/${campaignId}/tilesets`);
    setTileSets(data.tileSets);
  };

  useEffect(() => {
    loadTileSets().catch((err: Error) => setError(err.message));
  }, [campaignId]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    if (!file) {
      setError("Please select a tileset image");
      return;
    }
    if (previewSize && (previewSize.width !== expectedSize.width || previewSize.height !== expectedSize.height)) {
      setError("Tileset dimensions do not match columns/rows and tile size");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("tileSizeX", String(tileSizeX));
      formData.append("tileSizeY", String(tileSizeY));
      formData.append("columns", String(columns));
      formData.append("rows", String(rows));
      formData.append("file", file);

      await apiUpload(`/campaigns/${campaignId}/tilesets/upload`, formData);
      setName("");
      setFile(null);
      await loadTileSets();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Panel>
      <h1>Tileset uploader</h1>
      <p>Upload and analyze tilesets here. (DM only)</p>
      <ErrorBanner message={error} />
      <form onSubmit={onSubmit} className="form">
        <Field label="Tileset name">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Tileset image">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </Field>
        <div className="stats-grid">
          <Field label="Tile width (px)">
            <TextInput
              type="number"
              min={8}
              value={tileSizeX}
              onChange={(event) => setTileSizeX(Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Tile height (px)">
            <TextInput
              type="number"
              min={8}
              value={tileSizeY}
              onChange={(event) => setTileSizeY(Number(event.target.value))}
              required
            />
          </Field>
        </div>
        <div className="stats-grid">
          <Field label="Columns">
            <TextInput
              type="number"
              min={1}
              value={columns}
              onChange={(event) => setColumns(Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Rows">
            <TextInput
              type="number"
              min={1}
              value={rows}
              onChange={(event) => setRows(Number(event.target.value))}
              required
            />
          </Field>
        </div>
        <Button type="submit" variant="primary">
          {uploading ? "Uploading and slicing..." : "Create tileset"}
        </Button>
      </form>

      {previewUrl && (
        <div className="card">
          <h3>Tileset preview</h3>
          <p className="muted">
            Expected size: {expectedSize.width}x{expectedSize.height}px
            {previewSize && ` | Actual: ${previewSize.width}x${previewSize.height}px`}
          </p>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background: "#0b1220",
              maxWidth: "100%",
              overflow: "auto",
            }}
          >
            <img
              src={previewUrl}
              alt="Tileset preview"
              onLoad={(event) =>
                setPreviewSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
              style={{ display: "block", maxWidth: "100%" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(148, 163, 184, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.35) 1px, transparent 1px)",
                backgroundSize: `${tileSizeX}px ${tileSizeY}px`,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      )}

      <div className="stack">
        {tileSets.map((tileSet) => (
          <div key={tileSet.id} className="card">
            <h3>{tileSet.name}</h3>
            <p>
              {tileSet.columns}x{tileSet.rows} tiles at {tileSet.tileSizeX}x{tileSet.tileSizeY}px
            </p>
            {tileSet.tiles.length > 0 && (
              <div
                className="tile-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${tileSet.columns}, ${tileSet.tileSizeX}px)`,
                  gap: "4px",
                }}
              >
                {[...tileSet.tiles]
                  .sort((a, b) => a.index - b.index)
                  .map((tile) => (
                    <img
                      key={tile.id}
                      src={tile.imageUrl}
                      alt={`${tileSet.name} ${tile.index}`}
                      width={tileSet.tileSizeX}
                      height={tileSet.tileSizeY}
                      style={{
                        display: "block",
                        objectFit: "contain",
                        background: "#111",
                      }}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
