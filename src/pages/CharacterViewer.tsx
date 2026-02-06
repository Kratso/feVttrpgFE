import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import type { Character } from "../api/types";
import StatCard from "../components/StatCard";

export default function CharacterViewer() {
  const { campaignId } = useParams();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch<{ characters: Character[] }>(`/campaigns/${campaignId}/characters`)
      .then((data) => setCharacters(data.characters))
      .catch((err) => setError(err.message));
  }, [campaignId]);

  return (
    <div className="panel">
      <h1>Character viewer</h1>
      <p className="muted">Inspired by the Radiant Dawn stat viewer layout.</p>
      {error && <div className="error">{error}</div>}
      <div className="stat-grid">
        {characters.map((character) => (
          <StatCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
