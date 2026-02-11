import { useMemo, useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";
import type { MapInfo, TileSet, Token } from "../../../api/types";
import TokenTooltip from "./TokenTooltip";

type MapStageProps = {
  map: MapInfo;
  tokens: Token[];
  role: "DM" | "PLAYER" | null;
  onMoveToken: (tokenId: string, x: number, y: number) => void;
  tileSets?: TileSet[];
  selectedTokenId?: string | null;
};

const flattenTiles = (tileSets: TileSet[]) => tileSets.flatMap((entry) => entry.tiles);

export default function MapStage({
  map,
  tokens,
  role,
  onMoveToken,
  tileSets = [],
  selectedTokenId = null,
}: MapStageProps) {
  const dragTokenId = useRef<string | null>(null);
  const gridSizeX = map.gridSizeX;
  const gridSizeY = map.gridSizeY;
  const tiles = useMemo(() => flattenTiles(tileSets), [tileSets]);
  const tileGrid = map.tileGrid as Array<Array<string | null>> | null;
  const tileRows = tileGrid?.length ?? 0;
  const tileCols = tileGrid?.[0]?.length ?? 0;

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

  const stageStyle =
    tileRows > 0 && tileCols > 0
      ? { width: `${tileCols * gridSizeX}px`, height: `${tileRows * gridSizeY}px` }
      : undefined;

  return (
    <div
      className="map-stage"
      style={stageStyle}
      onMouseMove={onMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      {map.imageUrl && <img src={map.imageUrl} alt={map.name} className="map-image" />}
      {tileGrid && tileGrid.length > 0 && (
        <div
          className="tile-layer"
          style={{
            gridTemplateColumns: `repeat(${tileGrid[0].length}, ${gridSizeX}px)`,
            gridAutoRows: `${gridSizeY}px`,
          }}
        >
          {tileGrid.map((row, rowIndex) =>
            row.map((tileId, colIndex) => {
              const tile = tiles.find((entry) => entry.id === tileId) ?? null;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="tile-cell"
                  style={{
                    width: `${gridSizeX}px`,
                    height: `${gridSizeY}px`,
                    backgroundImage: tile ? `url(${tile.imageUrl})` : "none",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              );
            })
          )}
        </div>
      )}
      <div className="grid-overlay" style={gridStyle} />
      {tokens.map((token) => (
        <div
          key={token.id}
          className={`token-shell ${selectedTokenId === token.id ? "selected" : ""}`.trim()}
          style={{
            transform: `translate(${map.gridOffsetX + token.x * gridSizeX}px, ${
              map.gridOffsetY + token.y * gridSizeY
            }px)`,
            width: `${gridSizeX}px`,
            height: `${gridSizeY}px`,
          }}
        >
          <div
            className="token"
            style={{
              backgroundColor: token.color,
            }}
            onMouseDown={() => startDrag(token.id)}
          >
            {token.label}
          </div>
          <TokenTooltip token={token} />
        </div>
      ))}
    </div>
  );
}
