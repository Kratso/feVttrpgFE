import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "../api/client";
import type { MapInfo, Token } from "../api/types";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:4000";

export default function MapViewer() {
  const { campaignId } = useParams();
  const [maps, setMaps] = useState<MapInfo[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [map, setMap] = useState<MapInfo | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [role, setRole] = useState<"DM" | "PLAYER" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newMapName, setNewMapName] = useState("");
  const [newMapUrl, setNewMapUrl] = useState("");
  const [newGridSize, setNewGridSize] = useState(50);
  const [newTokenLabel, setNewTokenLabel] = useState("A");
  const [newTokenX, setNewTokenX] = useState(0);
  const [newTokenY, setNewTokenY] = useState(0);
  const [newTokenColor, setNewTokenColor] = useState("#f43f5e");
  const socketRef = useRef<Socket | null>(null);
  const dragTokenId = useRef<string | null>(null);

  const gridStyle = useMemo(() => {
    if (!map) return {};
    return {
      backgroundSize: `${map.gridSize}px ${map.gridSize}px`,
      backgroundPosition: `${map.gridOffsetX}px ${map.gridOffsetY}px`,
    } as React.CSSProperties;
  }, [map]);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ maps: MapInfo[] }>(`/campaigns/${campaignId}/maps`)
      .then((data) => {
        setMaps(data.maps);
        setSelectedMapId(data.maps[0]?.id ?? null);
      })
      .catch((err) => setError(err.message));

    apiFetch<{ role: "DM" | "PLAYER" }>(`/campaigns/${campaignId}/role`)
      .then((data) => setRole(data.role))
      .catch((err) => setError(err.message));
  }, [campaignId]);

  const createMap = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    try {
      await apiFetch(`/campaigns/${campaignId}/maps`, {
        method: "POST",
        body: JSON.stringify({
          name: newMapName,
          imageUrl: newMapUrl,
          gridSize: newGridSize,
        }),
      });
      setNewMapName("");
      setNewMapUrl("");
      const data = await apiFetch<{ maps: MapInfo[] }>(`/campaigns/${campaignId}/maps`);
      setMaps(data.maps);
      setSelectedMapId(data.maps[0]?.id ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const createToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMapId) return;
    try {
      await apiFetch(`/maps/${selectedMapId}/tokens`, {
        method: "POST",
        body: JSON.stringify({
          label: newTokenLabel,
          x: newTokenX,
          y: newTokenY,
          color: newTokenColor,
        }),
      });
      const data = await apiFetch<{ tokens: Token[] }>(`/maps/${selectedMapId}/tokens`);
      setTokens(data.tokens);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    if (!selectedMapId) return;
    apiFetch<{ map: MapInfo }>(`/maps/${selectedMapId}`)
      .then((data) => setMap(data.map))
      .catch((err) => setError(err.message));
    apiFetch<{ tokens: Token[] }>(`/maps/${selectedMapId}/tokens`)
      .then((data) => setTokens(data.tokens))
      .catch((err) => setError(err.message));
  }, [selectedMapId]);

  useEffect(() => {
    if (!selectedMapId) return;
    const socket = io(WS_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.emit("map:join", { mapId: selectedMapId });
    socket.on("token:moved", ({ token }: { token: Token }) => {
      setTokens((prev) => prev.map((t) => (t.id === token.id ? token : t)));
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedMapId]);

  const startDrag = (tokenId: string) => {
    if (role !== "DM") return;
    dragTokenId.current = tokenId;
  };

  const endDrag = () => {
    dragTokenId.current = null;
  };

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!map || role !== "DM") return;
    const tokenId = dragTokenId.current;
    if (!tokenId) return;

    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = event.clientX - rect.left - map.gridOffsetX;
    const relY = event.clientY - rect.top - map.gridOffsetY;
    const x = Math.max(0, Math.round(relX / map.gridSize));
    const y = Math.max(0, Math.round(relY / map.gridSize));

    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
    );

    socketRef.current?.emit("token:move", { mapId: map.id, tokenId, x, y });
  };

  return (
    <div className="panel">
      <h1>Map viewer</h1>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <select
          value={selectedMapId ?? ""}
          onChange={(e) => setSelectedMapId(e.target.value)}
        >
          {maps.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <span className="muted">Role: {role ?? "..."}</span>
      </div>

      {role === "DM" && (
        <div className="split">
          <form onSubmit={createMap} className="form">
            <h3>Create map</h3>
            <label>
              Map name
              <input value={newMapName} onChange={(e) => setNewMapName(e.target.value)} required />
            </label>
            <label>
              Image URL
              <input value={newMapUrl} onChange={(e) => setNewMapUrl(e.target.value)} required />
            </label>
            <label>
              Grid size (px)
              <input
                type="number"
                value={newGridSize}
                onChange={(e) => setNewGridSize(Number(e.target.value))}
                min={20}
              />
            </label>
            <button type="submit" className="primary">
              Add map
            </button>
          </form>

          <form onSubmit={createToken} className="form">
            <h3>Create token</h3>
            <label>
              Label
              <input value={newTokenLabel} onChange={(e) => setNewTokenLabel(e.target.value)} />
            </label>
            <div className="stats-grid">
              <label>
                X
                <input type="number" value={newTokenX} onChange={(e) => setNewTokenX(Number(e.target.value))} />
              </label>
              <label>
                Y
                <input type="number" value={newTokenY} onChange={(e) => setNewTokenY(Number(e.target.value))} />
              </label>
            </div>
            <label>
              Color
              <input type="color" value={newTokenColor} onChange={(e) => setNewTokenColor(e.target.value)} />
            </label>
            <button type="submit" className="primary">
              Add token
            </button>
          </form>
        </div>
      )}

      {map && (
        <div
          className="map-stage"
          onMouseMove={onMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          <img src={map.imageUrl} alt={map.name} className="map-image" />
          <div className="grid-overlay" style={gridStyle} />
          {tokens.map((token) => (
            <div
              key={token.id}
              className="token"
              style={{
                transform: `translate(${map.gridOffsetX + token.x * map.gridSize}px, ${
                  map.gridOffsetY + token.y * map.gridSize
                }px)`,
                width: `${map.gridSize}px`,
                height: `${map.gridSize}px`,
                backgroundColor: token.color,
              }}
              onMouseDown={() => startDrag(token.id)}
            >
              {token.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
