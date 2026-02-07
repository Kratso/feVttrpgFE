import { useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Token } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createMap as createMapAction,
  createToken as createTokenAction,
  selectMap,
  updateToken,
} from "../../store/slices/mapSlice";
import Panel from "../../components/ui/Panel";
import ErrorBanner from "../../components/ui/ErrorBanner";
import MapToolbar from "./components/MapToolbar";
import CreateMapForm from "./components/CreateMapForm";
import CreateTokenForm from "./components/CreateTokenForm";
import MapStage from "./components/MapStage";
import { useMapBootstrap } from "./hooks/useMapBootstrap";
import { useMapDetail } from "./hooks/useMapDetail";
import { useMapSocket } from "./hooks/useMapSocket";

export default function MapViewer() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { maps, selectedMapId, map, tokens, error } = useAppSelector((state) => state.maps);
  const { role } = useAppSelector((state) => state.campaigns);

  useMapBootstrap(campaignId);
  useMapDetail(selectedMapId);

  const handleSocketTokenMoved = useCallback(
    (token: Token) => {
      dispatch(updateToken(token));
    },
    [dispatch]
  );

  const { socketRef } = useMapSocket(selectedMapId, handleSocketTokenMoved);

  const handleCreateMap = async (payload: { name: string; imageUrl: string; gridSize: number }) => {
    if (!campaignId) return false;
    try {
      await dispatch(
        createMapAction({
          campaignId,
          name: payload.name,
          imageUrl: payload.imageUrl,
          gridSize: payload.gridSize,
        })
      ).unwrap();
      return true;
    } catch {
      return false;
    }
  };

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
        <div className="split">
          <CreateMapForm onCreateMap={handleCreateMap} />
          <CreateTokenForm onCreateToken={handleCreateToken} />
        </div>
      )}

      {map && <MapStage map={map} tokens={tokens} role={role} onMoveToken={handleMoveToken} />}
    </Panel>
  );
}
