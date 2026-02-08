import type { ChangeEvent } from "react";
import TextInput from "./ui/TextInput";

type BannerStat = {
  label: string;
  value: string | number;
};

type CharacterBannerProps = {
  name: string;
  className?: string | null;
  level?: number | null;
  exp?: number | null;
  currentHp: string;
  maxHp: number;
  canEditHp: boolean;
  onHpChange?: (value: string) => void;
  onHpBlur?: () => void;
  combatStats: BannerStat[];
};

export default function CharacterBanner({
  name,
  className,
  level,
  exp,
  currentHp,
  maxHp,
  canEditHp,
  onHpChange,
  onHpBlur,
  combatStats,
}: CharacterBannerProps) {
  const handleHpChange = (event: ChangeEvent<HTMLInputElement>) => {
    onHpChange?.(event.target.value);
  };

  return (
    <div className="character-sheet-header">
      <div className="character-name-block">
        <h2>{name}</h2>
        <div className="character-subtitle">
          <span>{className ?? "Unassigned class"}</span>
          <span>Lv {level ?? 1}</span>
          <span>Exp {exp ?? 0}</span>
        </div>
        <div className="character-hp-line">
          <span>HP</span>
          {onHpChange ? (
            <TextInput
              type="number"
              min={0}
              max={maxHp}
              value={currentHp}
              onChange={handleHpChange}
              onBlur={onHpBlur}
              disabled={!canEditHp}
            />
          ) : (
            <strong>{currentHp}</strong>
          )}
          <span className="muted">/ {maxHp}</span>
        </div>
      </div>
      <div className="character-portrait" aria-hidden="true" />
      <div className="character-dummy-stats">
        {combatStats.map((entry) => (
          <div key={entry.label} className="dummy-stat">
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
