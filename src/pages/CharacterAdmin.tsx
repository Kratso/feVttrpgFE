import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createCharacter as createCharacterAction, fetchCharacters } from "../store/slices/characterSlice";
import Panel from "../components/ui/Panel";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
import Card from "../components/ui/Card";

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
    <Panel>
      <h1>Character admin</h1>
      <form onSubmit={onCreateCharacter} className="form">
        <Field label="Character name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <div className="stats-grid">
          {statKeys.map((key) => (
            <Field key={key} label={key}>
              <TextInput
                type="number"
                value={stats[key as keyof typeof stats]}
                onChange={(e) =>
                  setStats((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            </Field>
          ))}
        </div>
        <ErrorBanner message={error} />
        <Button type="submit" variant="primary">
          Create character
        </Button>
      </form>

      <div className="grid">
        {characters.map((character) => (
          <Card key={character.id}>
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
          </Card>
        ))}
      </div>
    </Panel>
  );
}
