import type { Item } from "../api/types";

const formatDamageType = (value?: Item["damageType"]) => {
  if (!value) return null;
  return value === "PHYSICAL" ? "Physical" : "Magical";
};

const formatRange = (item: Item) => {
  if (item.rangeFormula) {
    return item.rangeFormula;
  }
  if (item.minRange === null && item.maxRange === null) {
    return item.type === "staff" ? "-" : null;
  }
  const min = item.minRange ?? 1;
  const max = item.maxRange ?? item.minRange ?? 1;
  return `${min}-${max}`;
};

type ChipEntry = {
  label: string;
  value: unknown;
  keepZero?: boolean;
};

const formatChipValue = (value: unknown, keepZero = false) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value === 0 && !keepZero) {
    return "-";
  }
  return String(value);
};

const renderChips = (entries: ChipEntry[], options: { filterZero?: boolean } = {}) => {
  const { filterZero = false } = options;
  const visibleEntries = entries.filter(({ value }) => {
    if (filterZero && typeof value === "number" && value === 0) {
      return false;
    }
    return true;
  });

  if (visibleEntries.length === 0) return null;

  return (
    <div className="stat-row">
      {visibleEntries.map(({ label, value, keepZero }) => (
        <div key={label} className="stat-chip">
          <span>{label}</span>
          <strong>{formatChipValue(value, keepZero)}</strong>
        </div>
      ))}
    </div>
  );
};

const renderObjectChips = (value?: Record<string, unknown> | null, filterZero = false) => {
  if (!value || Object.keys(value).length === 0) return null;
  const entries = Object.entries(value).map(([label, entry]) => ({ label, value: entry }));
  return renderChips(entries, { filterZero });
};

export default function ItemDetail({ item }: { item: Item | null }) {
  if (!item) {
    return <p className="muted">Select an item or weapon to inspect details.</p>;
  }

  const range = formatRange(item);
  const damageType = formatDamageType(item.damageType);
  const attributes: ChipEntry[] = [
    { label: "Might", value: item.might },
    { label: "Hit", value: item.hit },
    { label: "Crit", value: item.crit, keepZero: true },
    { label: "Weight", value: item.weight },
    { label: "Uses", value: item.uses },
    { label: "Price", value: item.price },
  ];

  const effectivenessChips = renderObjectChips(item.effectiveness ?? null);
  const bonusChips = renderObjectChips(item.bonus ?? null, true);

  return (
    <div className="item-detail">
      <div className="item-detail-header">
        <h3>{item.name}</h3>
        <div className="item-tags">
          <span className="stat-chip">
            <span>Category</span>
            <strong>{item.category}</strong>
          </span>
          <span className="stat-chip">
            <span>Type</span>
            <strong>{item.type}</strong>
          </span>
        </div>
      </div>
      {item.description && <p className="muted">{item.description}</p>}

      <div className="item-section">
        <p className="muted">Attributes</p>
        {renderChips(attributes)}
      </div>

      {(range || item.weaponRank || damageType || item.weaponExp) && (
        <div className="item-section">
          <p className="muted">Weapon info</p>
          <div className="stat-row">
            {range && (
              <div className="stat-chip">
                <span>Range</span>
                <strong>{range}</strong>
              </div>
            )}
            {item.weaponRank && (
              <div className="stat-chip">
                <span>Rank</span>
                <strong>{item.weaponRank}</strong>
              </div>
            )}
            {damageType && (
              <div className="stat-chip">
                <span>Damage</span>
                <strong>{damageType}</strong>
              </div>
            )}
            {item.weaponExp !== null && item.weaponExp !== undefined && (
              <div className="stat-chip">
                <span>WEXP</span>
                <strong>{item.weaponExp}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {effectivenessChips && (
        <div className="item-section">
          <p className="muted">Effectiveness</p>
          {effectivenessChips}
        </div>
      )}

      {bonusChips && (
        <div className="item-section">
          <p className="muted">Bonus</p>
          {bonusChips}
        </div>
      )}
    </div>
  );
}
