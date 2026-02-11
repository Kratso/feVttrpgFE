import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { MapRollLog, TileSet, Token } from "../../api/types";
import { apiFetch } from "../../api/client";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createToken as createTokenAction,
  selectMap,
  updateToken,
} from "../../store/slices/mapSlice";
import Panel from "../../components/ui/Panel";
import ErrorBanner from "../../components/ui/ErrorBanner";
import FloatingPanel from "../../components/ui/FloatingPanel";
import Button from "../../components/ui/Button";
import MapToolbar from "./components/MapToolbar";
import CreateTokenForm from "./components/CreateTokenForm";
import MapStage from "./components/MapStage";
import TokenList, { type TokenVisibility } from "./components/TokenList";
import { useMapBootstrap } from "./hooks/useMapBootstrap";
import { useMapDetail } from "./hooks/useMapDetail";
import { useMapSocket } from "./hooks/useMapSocket";

export default function MapViewer() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { maps, selectedMapId, map, tokens, error } = useAppSelector((state) => state.maps);
  const { role } = useAppSelector((state) => state.campaigns);
  const { characters } = useAppSelector((state) => state.characters);
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [showTokenList, setShowTokenList] = useState(false);
  const [showRoller, setShowRoller] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [tokenVisibility, setTokenVisibility] = useState<Record<string, TokenVisibility>>({});
  const [rollLogs, setRollLogs] = useState<MapRollLog[]>([]);
  const [rollLoading, setRollLoading] = useState(false);

  useMapBootstrap(campaignId);
  useMapDetail(selectedMapId);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ tileSets: TileSet[] }>(`/campaigns/${campaignId}/tilesets`)
      .then((data) => setTileSets(data.tileSets))
      .catch(() => setTileSets([]));
  }, [campaignId]);

  useEffect(() => {
    setTokenVisibility((prev) => {
      const next: Record<string, TokenVisibility> = {};
      tokens.forEach((token) => {
        next[token.id] = prev[token.id] ?? "PUBLIC";
      });
      return next;
    });
  }, [tokens]);

  useEffect(() => {
    if (selectedTokenId && !tokens.some((token) => token.id === selectedTokenId)) {
      setSelectedTokenId(null);
    }
  }, [selectedTokenId, tokens]);

  useEffect(() => {
    if (!selectedMapId) {
      setRollLogs([]);
      return;
    }
    setRollLoading(true);
    apiFetch<{ rolls: MapRollLog[] }>(`/maps/${selectedMapId}/rolls`)
      .then((data) => setRollLogs(data.rolls))
      .catch(() => setRollLogs([]))
      .finally(() => setRollLoading(false));
  }, [selectedMapId]);

  const handleSocketTokenMoved = useCallback(
    (token: Token) => {
      dispatch(updateToken(token));
    },
    [dispatch]
  );

  const handleSocketRollCreated = useCallback((roll: MapRollLog) => {
    setRollLogs((prev) => {
      if (prev.some((entry) => entry.id === roll.id)) return prev;
      return [roll, ...prev];
    });
  }, []);

  const { socketRef } = useMapSocket(selectedMapId, handleSocketTokenMoved, handleSocketRollCreated);

  const handleCreateToken = async (payload: {
    label: string;
    x: number;
    y: number;
    color: string;
    characterId: string;
  }) => {
    if (!selectedMapId) return false;
    try {
      await dispatch(
        createTokenAction({
          mapId: selectedMapId,
          label: payload.label,
          x: payload.x,
          y: payload.y,
          color: payload.color,
          characterId: payload.characterId,
        })
      ).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const handleMoveToken = (tokenId: string, x: number, y: number) => {
    if (!map) return;
    const token = tokens.find((entry) => entry.id === tokenId);
    if (!token) return;

    dispatch(updateToken({ ...token, x, y }));
    socketRef.current?.emit("token:move", { mapId: map.id, tokenId, x, y });
  };

  const handleCreateRoll = async (type: "REGULAR" | "COMBAT") => {
    if (!selectedMapId) return;
    setRollLoading(true);
    try {
      const data = await apiFetch<{ roll: MapRollLog }>(`/maps/${selectedMapId}/rolls`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      setRollLogs((prev) => {
        if (prev.some((entry) => entry.id === data.roll.id)) return prev;
        return [data.roll, ...prev];
      });
    } finally {
      setRollLoading(false);
    }
  };

  const visibleTokens = useMemo(() => {
    return tokens.filter((token) => {
      const visibility = tokenVisibility[token.id] ?? "PUBLIC";
      if (visibility === "HIDDEN") return false;
      if (visibility === "DM_ONLY" && role !== "DM") return false;
      return true;
    });
  }, [tokens, tokenVisibility, role]);

  const listTokens = useMemo(() => {
    if (role === "DM") return tokens;
    return visibleTokens;
  }, [role, tokens, visibleTokens]);

  return (
    <Panel>
      <h1>Map viewer</h1>
      <ErrorBanner message={error} />
      <MapToolbar
        maps={maps}
        selectedMapId={selectedMapId}
        role={role}
        onSelectMap={(value) => dispatch(selectMap(value || null))}
      />

      {role === "DM" && (
        <FloatingPanel
          side="right"
          title="Add token"
          isOpen={showTokenForm}
          onToggle={() => setShowTokenForm((open) => !open)}
          toggleTop={180}
          panelTop={140}
        >
          <CreateTokenForm onCreateToken={handleCreateToken} characters={characters} />
        </FloatingPanel>
      )}

      <FloatingPanel
        side="left"
        title="Tokens"
        isOpen={showTokenList}
        onToggle={() => setShowTokenList((open) => !open)}
        toggleTop={180}
        panelTop={140}
      >
        <TokenList
          tokens={listTokens}
          role={role}
          selectedTokenId={selectedTokenId}
          visibilityById={tokenVisibility}
          onSelect={setSelectedTokenId}
          onVisibilityChange={(tokenId, visibility) =>
            setTokenVisibility((prev) => ({ ...prev, [tokenId]: visibility }))
          }
        />
      </FloatingPanel>

      <FloatingPanel
        side="right"
        title="Die roller"
        isOpen={showRoller}
        onToggle={() => setShowRoller((open) => !open)}
        toggleTop={340}
        panelTop={300}
      >
        <div className="roll-panel">
          <div className="roll-actions">
            <Button type="button" variant="primary" onClick={() => handleCreateRoll("REGULAR")}>
              Regular roll
            </Button>
            <Button type="button" variant="ghost" onClick={() => handleCreateRoll("COMBAT")}>
              Combat roll
            </Button>
          </div>
          {rollLoading && rollLogs.length === 0 ? (
            <p className="muted">Loading rolls...</p>
          ) : rollLogs.length === 0 ? (
            <p className="muted">No rolls recorded yet.</p>
          ) : (
            <div className="roll-log">
              {rollLogs.map((roll) => (
                <div key={roll.id} className="roll-row">
                  <span className="roll-user">{roll.user.displayName}</span>
                  <span className="roll-type">
                    {roll.type === "REGULAR" ? "Regular" : "Combat"}
                  </span>
                  <strong className="roll-result">{roll.result}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </FloatingPanel>

      {map && (
        <div className="map-stage-scroll">
          <MapStage
            map={map}
            tokens={visibleTokens}
            role={role}
            onMoveToken={handleMoveToken}
            tileSets={tileSets}
            selectedTokenId={selectedTokenId}
          />
        </div>
      )}
    </Panel>
  );
}
