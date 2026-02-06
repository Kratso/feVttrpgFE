import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createCharacter as createCharacterAction, fetchCharacters } from "../store/slices/characterSlice";

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
  const dispatch = useAppDispatch();
  const { characters, error } = useAppSelector((state) => state.characters);
  const [name, setName] = useState("");
  const [stats, setStats] = useState(defaultStats);

  const statKeys = useMemo(() => Object.keys(stats), [stats]);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
  }, [campaignId, dispatch]);

  const onCreateCharacter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    try {
      await dispatch(createCharacterAction({ campaignId, name, stats })).unwrap();
      setName("");
      setStats(defaultStats);
    } catch {
      return;
    }
  };

  return (
    <div className="panel">
      <h1>Character admin</h1>
      <form onSubmit={onCreateCharacter} className="form">
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
