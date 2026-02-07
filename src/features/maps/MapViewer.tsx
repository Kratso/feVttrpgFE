import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { TileSet, Token } from "../../api/types";
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
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [showTokenList, setShowTokenList] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [tokenVisibility, setTokenVisibility] = useState<Record<string, TokenVisibility>>({});

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

  const handleSocketTokenMoved = useCallback(
    (token: Token) => {
      dispatch(updateToken(token));
    },
    [dispatch]
  );

  const { socketRef } = useMapSocket(selectedMapId, handleSocketTokenMoved);

  const handleCreateToken = async (payload: { label: string; x: number; y: number; color: string }) => {
    if (!selectedMapId) return false;
    try {
      await dispatch(
        createTokenAction({
          mapId: selectedMapId,
          label: payload.label,
          x: payload.x,
          y: payload.y,
          color: payload.color,
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
        >
          <CreateTokenForm onCreateToken={handleCreateToken} />
        </FloatingPanel>
      )}

      <FloatingPanel
        side="left"
        title="Tokens"
        isOpen={showTokenList}
        onToggle={() => setShowTokenList((open) => !open)}
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
