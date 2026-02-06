import type { Character } from "../api/types";
import { getDisplayStats } from "../utils/character";

export default function StatCard({ character }: { character: Character }) {
  const displayStats = getDisplayStats(character.stats);
  return (
    <div className="stat-card">
      <div className="stat-header">
        <h3>{character.name}</h3>
        <span className="muted">{character.owner?.displayName ?? "Unassigned"}</span>
      </div>
      <p className="muted">
        {character.className ? `Class: ${character.className}` : "Class: Unassigned"} · Level {character.level ?? 1} · EXP {character.exp ?? 0}
      </p>
      {character.weaponSkills && character.weaponSkills.length > 0 && (
        <p className="muted">
          Weapon skills: {character.weaponSkills.map((skill: { weapon: string; rank: string }) => `${skill.weapon} ${skill.rank}`).join(", ")}
        </p>
      )}
      <div className="stat-body">
        {Object.entries(displayStats).map(([label, value]) => (
          <div key={label} className="stat-line">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
