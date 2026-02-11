import type { CSSProperties } from "react";
import type { Token } from "../../../api/types";
import { getDisplayStats } from "../../../utils/character";

type TokenTooltipProps = {
  token: Token;
  className?: string;
  style?: CSSProperties;
};

export default function TokenTooltip({ token, className, style }: TokenTooltipProps) {
  const character = token.character;
  const characterName = character?.name ?? token.label;
  const stats = getDisplayStats(character?.stats ?? {});
  const maxHp = stats.hp ?? 0;
  const currentHp = character?.currentHp ?? maxHp;
  const level = character?.level ?? 1;
  const weaponName = character?.equippedWeaponItem?.item?.name ?? "None";

  return (
    <div className={`token-tooltip ${className ?? ""}`.trim()} role="tooltip" style={style}>
      <div className="token-tooltip-header">
        <strong>{characterName}</strong>
      </div>
      <div className="token-tooltip-body">
        <div className="token-tooltip-portrait" aria-hidden="true" />
        <div className="token-tooltip-stats">
          <div className="token-tooltip-row">
            <span>Lv</span>
            <strong>{level}</strong>
          </div>
          <div className="token-tooltip-row">
            <span>HP</span>
            <strong>
              {currentHp}/{maxHp}
            </strong>
          </div>
          <div className="token-tooltip-row token-tooltip-weapon">
            <span>Weapon</span>
            <strong>{weaponName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
