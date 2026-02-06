import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import type { Token } from "../api/types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createMap as createMapAction,
  createToken as createTokenAction,
  fetchMapDetail,
  fetchMaps,
  fetchTokens,
  selectMap,
  updateToken,
} from "../store/slices/mapSlice";
import { fetchCampaignRole } from "../store/slices/campaignSlice";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:4000";

export default function MapViewer() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { maps, selectedMapId, map, tokens, error } = useAppSelector((state) => state.maps);
  const { role } = useAppSelector((state) => state.campaigns);
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
    dispatch(fetchMaps(campaignId));
    dispatch(fetchCampaignRole(campaignId));
  }, [campaignId, dispatch]);

  useEffect(() => {
    if (!selectedMapId) return;
    dispatch(fetchMapDetail(selectedMapId));
    dispatch(fetchTokens(selectedMapId));
  }, [selectedMapId, dispatch]);

  useEffect(() => {
    if (!selectedMapId) return;
    const socket = io(WS_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.emit("map:join", { mapId: selectedMapId });
    socket.on("token:moved", ({ token }: { token: Token }) => {
      dispatch(updateToken(token));
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedMapId, dispatch]);

  const onCreateMap = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    try {
      await dispatch(
        createMapAction({
          campaignId,
          name: newMapName,
          imageUrl: newMapUrl,
          gridSize: newGridSize,
        })
      ).unwrap();
      setNewMapName("");
      setNewMapUrl("");
    } catch {
      return;
    }
  };

  const onCreateToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMapId) return;
    try {
      await dispatch(
        createTokenAction({
          mapId: selectedMapId,
          label: newTokenLabel,
          x: newTokenX,
          y: newTokenY,
          color: newTokenColor,
        })
      ).unwrap();
    } catch {
      return;
    }
  };

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

    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return;

    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = event.clientX - rect.left - map.gridOffsetX;
    const relY = event.clientY - rect.top - map.gridOffsetY;
    const x = Math.max(0, Math.round(relX / map.gridSize));
    const y = Math.max(0, Math.round(relY / map.gridSize));

    dispatch(updateToken({ ...token, x, y }));
    socketRef.current?.emit("token:move", { mapId: map.id, tokenId, x, y });
  };

  return (
    <div className="panel">
      <h1>Map viewer</h1>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <select
          value={selectedMapId ?? ""}
          onChange={(e) => dispatch(selectMap(e.target.value || null))}
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
          <form onSubmit={onCreateMap} className="form">
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

          <form onSubmit={onCreateToken} className="form">
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
        <div className="map-stage" onMouseMove={onMove} onMouseUp={endDrag} onMouseLeave={endDrag}>
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
