import type { KeyboardEvent } from "react";
import type { Token } from "../../../api/types";
import SelectInput from "../../../components/ui/SelectInput";

export type TokenVisibility = "PUBLIC" | "DM_ONLY" | "HIDDEN";

type TokenListProps = {
  tokens: Token[];
  role: "DM" | "PLAYER" | null;
  selectedTokenId: string | null;
  visibilityById: Record<string, TokenVisibility>;
  onSelect: (tokenId: string) => void;
  onVisibilityChange: (tokenId: string, visibility: TokenVisibility) => void;
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
}: TokenListProps) {
  if (tokens.length === 0) {
    return <p className="muted">No tokens on this map yet.</p>;
  }

  return (
    <div className="token-list">
      {tokens.map((token) => {
        const visibility = visibilityById[token.id] ?? "PUBLIC";
        const isSelected = token.id === selectedTokenId;
        return (
          <div
            key={token.id}
            role="button"
            tabIndex={0}
            className={`token-row ${isSelected ? "selected" : ""}`.trim()}
            onClick={() => onSelect(token.id)}
            onKeyDown={(event) => handleKeySelect(event, token.id, onSelect)}
          >
            <div className="token-meta">
              <div className="token-label">
                <span className="token-swatch" style={{ backgroundColor: token.color }} />
                <strong>{token.label}</strong>
                <span className="muted">({token.x}, {token.y})</span>
              </div>
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
        );
      })}
    </div>
  );
}
