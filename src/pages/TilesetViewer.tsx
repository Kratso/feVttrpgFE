import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { TileSet } from "../api/types";
import { apiFetch } from "../api/client";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function TilesetViewer() {
  const { campaignId } = useParams();
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    apiFetch<{ tileSets: TileSet[] }>(`/campaigns/${campaignId}/tilesets`)
      .then((data) => setTileSets(data.tileSets))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  return (
    <Panel>
      <h1>Tileset viewer</h1>
      <p>Browse uploaded tilesets and their tiles.</p>
      <ErrorBanner message={error} />
      {loading && <p>Loading tilesets...</p>}
      {!loading && tileSets.length === 0 && <p>No tilesets found.</p>}
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
