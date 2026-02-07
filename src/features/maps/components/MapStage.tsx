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
  const gridSizeX = map.gridSizeX;
  const gridSizeY = map.gridSizeY;

  const gridStyle = useMemo(() => {
    return {
      backgroundSize: `${gridSizeX}px ${gridSizeY}px`,
      backgroundPosition: `${map.gridOffsetX}px ${map.gridOffsetY}px`,
    } as CSSProperties;
  }, [gridSizeX, gridSizeY, map.gridOffsetX, map.gridOffsetY]);

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
    const x = Math.max(0, Math.round(relX / gridSizeX));
    const y = Math.max(0, Math.round(relY / gridSizeY));

    onMoveToken(tokenId, x, y);
  };

  return (
    <div className="map-stage" onMouseMove={onMove} onMouseUp={endDrag} onMouseLeave={endDrag}>
      {map.imageUrl && <img src={map.imageUrl} alt={map.name} className="map-image" />}
      <div className="grid-overlay" style={gridStyle} />
      {tokens.map((token) => (
        <div
          key={token.id}
          className="token"
          style={{
            transform: `translate(${map.gridOffsetX + token.x * gridSizeX}px, ${
              map.gridOffsetY + token.y * gridSizeY
            }px)`,
            width: `${gridSizeX}px`,
            height: `${gridSizeY}px`,
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
