import { useMemo, useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";
import type { MapInfo, Token } from "../../../api/types";

type MapStageProps = {
  map: MapInfo;
  tokens: Token[];
  role: "DM" | "PLAYER" | null;
  onMoveToken: (tokenId: string, x: number, y: number) => void;
};

export default function MapStage({ map, tokens, role, onMoveToken }: MapStageProps) {
  const dragTokenId = useRef<string | null>(null);

  const gridStyle = useMemo(() => {
    return {
      backgroundSize: `${map.gridSize}px ${map.gridSize}px`,
      backgroundPosition: `${map.gridOffsetX}px ${map.gridOffsetY}px`,
    } as CSSProperties;
  }, [map.gridSize, map.gridOffsetX, map.gridOffsetY]);

  const startDrag = (tokenId: string) => {
    if (role !== "DM") return;
    dragTokenId.current = tokenId;
  };

  const endDrag = () => {
    dragTokenId.current = null;
  };

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (role !== "DM") return;
    const tokenId = dragTokenId.current;
    if (!tokenId) return;

    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const relX = event.clientX - rect.left - map.gridOffsetX;
    const relY = event.clientY - rect.top - map.gridOffsetY;
    const x = Math.max(0, Math.round(relX / map.gridSize));
    const y = Math.max(0, Math.round(relY / map.gridSize));

    onMoveToken(tokenId, x, y);
  };

  return (
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
  );
}
