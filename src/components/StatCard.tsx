import type { Character } from "../api/types";

export default function StatCard({ character }: { character: Character }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <h3>{character.name}</h3>
        <span className="muted">{character.owner?.displayName ?? "Unassigned"}</span>
      </div>
      <div className="stat-body">
        {Object.entries(character.stats).map(([label, value]) => (
          <div key={label} className="stat-line">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
