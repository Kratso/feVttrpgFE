import { useCallback, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { Character, CharacterItem, Token } from "../../../api/types";
import { apiFetch } from "../../../api/client";
import SelectInput from "../../../components/ui/SelectInput";
import TokenTooltip from "./TokenTooltip";

export type TokenVisibility = "PUBLIC" | "DM_ONLY" | "HIDDEN";

type TokenListProps = {
  tokens: Token[];
  role: "DM" | "PLAYER" | null;
  currentUserId?: string | null;
  selectedTokenId: string | null;
  visibilityById: Record<string, TokenVisibility>;
  onSelect: (tokenId: string) => void;
  onVisibilityChange: (tokenId: string, visibility: TokenVisibility) => void;
  onEquipWeapon?: (characterId: string, inventoryId: string | null) => void;
};

const visibilityLabel: Record<TokenVisibility, string> = {
  PUBLIC: "Viewable for all",
  DM_ONLY: "DM only",
  HIDDEN: "Invisible",
};

const handleKeySelect = (event: KeyboardEvent<HTMLDivElement>, tokenId: string, onSelect: TokenListProps["onSelect"]) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect(tokenId);
  }
};

export default function TokenList({
  tokens,
  role,
  selectedTokenId,
  visibilityById,
  onSelect,
  onVisibilityChange,
  currentUserId,
  onEquipWeapon,
}: TokenListProps) {
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [inventoryByCharacter, setInventoryByCharacter] = useState<
    Record<string, CharacterItem[]>
  >({});
  const [inventoryLoading, setInventoryLoading] = useState<Record<string, boolean>>({});

  const loadInventory = useCallback(async (characterId: string) => {
    if (inventoryByCharacter[characterId] || inventoryLoading[characterId]) return;
    setInventoryLoading((prev) => ({ ...prev, [characterId]: true }));
    try {
      const data = await apiFetch<{ character: Character }>(`/characters/${characterId}`);
      setInventoryByCharacter((prev) => ({
        ...prev,
        [characterId]: data.character.inventory ?? [],
      }));
    } catch {
      setInventoryByCharacter((prev) => ({ ...prev, [characterId]: [] }));
    } finally {
      setInventoryLoading((prev) => ({ ...prev, [characterId]: false }));
    }
  }, [inventoryByCharacter, inventoryLoading]);

  const handleHover = (event: MouseEvent<HTMLDivElement>, token: Token) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredToken(token);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleHoverEnd = () => {
    setHoveredToken(null);
    setTooltipPos(null);
  };

  if (tokens.length === 0) {
    return <p className="muted">No tokens on this map yet.</p>;
  }

  return (
    <>
      <div className="token-list">
        {tokens.map((token) => {
          const visibility = visibilityById[token.id] ?? "PUBLIC";
          const isSelected = token.id === selectedTokenId;
          const characterName = token.character?.name ?? "Unassigned";
          const ownerName = token.character?.owner?.displayName ?? "Unknown";
          const characterId = token.character?.id ?? null;
          const canEquip =
            !!characterId && (role === "DM" || (!!currentUserId && token.character?.owner?.id === currentUserId));
          const inventory = characterId ? inventoryByCharacter[characterId] ?? null : null;
          const weaponOptions = (inventory ?? []).filter((item) => item.item.category === "WEAPON");
          const equippedId = token.character?.equippedWeaponItem?.id ?? "";
          return (
            <div
              key={token.id}
              role="button"
              tabIndex={0}
              className={`token-row ${isSelected ? "selected" : ""}`.trim()}
              onClick={() => onSelect(token.id)}
              onKeyDown={(event) => handleKeySelect(event, token.id, onSelect)}
              onMouseEnter={(event) => handleHover(event, token)}
              onMouseMove={(event) => handleHover(event, token)}
              onMouseLeave={handleHoverEnd}
            >
              <div className="token-meta">
                <div className="token-meta-main">
                  <div className="token-label">
                    <span className="token-swatch" style={{ backgroundColor: token.color }} />
                    <strong>{token.label}</strong>
                    <span className="muted">({token.x}, {token.y})</span>
                  </div>
                  <div className="token-character">
                    <span className="muted">{characterName}</span>
                    <span className="muted">{ownerName}</span>
                  </div>
                </div>
                <div className="token-meta-controls">
                  {canEquip && characterId && (
                    <SelectInput
                      value={equippedId}
                      onFocus={() => loadInventory(characterId)}
                      onChange={(event) =>
                        onEquipWeapon?.(characterId, event.target.value || null)
                      }
                      disabled={inventoryLoading[characterId]}
                    >
                      <option value="">No weapon</option>
                      {weaponOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item.name}
                        </option>
                      ))}
                    </SelectInput>
                  )}
                  {role === "DM" ? (
                    <SelectInput
                      value={visibility}
                      onChange={(event) => onVisibilityChange(token.id, event.target.value as TokenVisibility)}
                    >
                      <option value="PUBLIC">Viewable for all</option>
                      <option value="DM_ONLY">DM only</option>
                      <option value="HIDDEN">Invisible</option>
                    </SelectInput>
                  ) : (
                    <span className="muted">{visibilityLabel[visibility]}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hoveredToken && tooltipPos &&
        createPortal(
          <TokenTooltip
            token={hoveredToken}
            className="floating"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          />,
          document.body
        )}
    </>
  );
}
