import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import type { Character } from "../api/types";

const defaultStats = {
  HP: 30,
  STR: 10,
  MAG: 6,
  SKL: 8,
  SPD: 9,
  LCK: 7,
  DEF: 8,
  RES: 5,
};

export default function CharacterAdmin() {
  const { campaignId } = useParams();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [name, setName] = useState("");
  const [stats, setStats] = useState(defaultStats);
  const [error, setError] = useState<string | null>(null);

  const statKeys = useMemo(() => Object.keys(stats), [stats]);

  const load = async () => {
    if (!campaignId) return;
    const data = await apiFetch<{ characters: Character[] }>(`/campaigns/${campaignId}/characters`);
    setCharacters(data.characters);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [campaignId]);

  const createCharacter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    setError(null);
    try {
      await apiFetch(`/campaigns/${campaignId}/characters`, {
        method: "POST",
        body: JSON.stringify({ name, stats }),
      });
      setName("");
      setStats(defaultStats);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="panel">
      <h1>Character admin</h1>
      <form onSubmit={createCharacter} className="form">
        <label>
          Character name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className="stats-grid">
          {statKeys.map((key) => (
            <label key={key}>
              {key}
              <input
                type="number"
                value={stats[key as keyof typeof stats]}
                onChange={(e) =>
                  setStats((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary">
          Create character
        </button>
      </form>

      <div className="grid">
        {characters.map((character) => (
          <div key={character.id} className="card">
            <h3>{character.name}</h3>
            <p className="muted">Owner: {character.owner?.displayName ?? "Unassigned"}</p>
            <div className="stat-row">
              {Object.entries(character.stats).map(([label, value]) => (
                <div key={label} className="stat-chip">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
