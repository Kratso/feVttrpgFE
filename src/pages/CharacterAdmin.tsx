import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createCharacter as createCharacterAction, fetchCharacters } from "../store/slices/characterSlice";
import { fetchCampaignMembers } from "../store/slices/campaignSlice";
import { fetchClasses } from "../store/slices/classSlice";
import Panel from "../components/ui/Panel";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
import Card from "../components/ui/Card";
import SelectInput from "../components/ui/SelectInput";
import { getDisplayStats } from "../utils/character";

const defaultStats = {
  hp: 30,
  strength: 10,
  intelligence: 0,
  agility: 8,
  ability: 8,
  luck: 5,
  constitution: 5,
  wisdom: 0,
  build: 5,
  movement: 5,
};

export default function CharacterAdmin() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { characters, error } = useAppSelector((state) => state.characters);
  const members = useAppSelector((state) => state.campaigns.members);
  const classes = useAppSelector((state) => state.classes.classes);
  const weaponTypes = ["sword", "lance", "axe", "bow", "anima", "light", "dark", "staff"];
  const [name, setName] = useState("");
  const [stats, setStats] = useState(defaultStats);
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [weaponSelections, setWeaponSelections] = useState<Record<string, boolean>>({});
  const [kind, setKind] = useState<"PLAYER" | "NPC" | "ENEMY">("PLAYER");
  const [ownerId, setOwnerId] = useState<string>("");

  const statKeys = useMemo(() => Object.keys(stats), [stats]);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
    dispatch(fetchCampaignMembers(campaignId));
    dispatch(fetchClasses());
  }, [campaignId, dispatch]);

  const handleClassChange = (value: string) => {
    setClassName(value);
    const match = classes.find((gameClass) => gameClass.name === value);
    if (match?.baseStats && Object.keys(match.baseStats).length > 0) {
      setStats((prev) => ({
        ...prev,
        ...match.baseStats,
      }));
    }
    if (match?.weaponRanks) {
      const nextSelections: Record<string, boolean> = {};
      weaponTypes.forEach((weapon) => {
        const rank = match.weaponRanks?.[weapon];
        nextSelections[weapon] = !!rank && rank !== "-";
      });
      setWeaponSelections(nextSelections);
    }
  };

  const onCreateCharacter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;
    try {
      const match = classes.find((gameClass) => gameClass.name === className);
      const weaponSkills = weaponTypes
        .filter((weapon) => weaponSelections[weapon])
        .map((weapon) => ({
          weapon,
          rank: match?.weaponRanks?.[weapon] ?? "E",
        }));

      await dispatch(
        createCharacterAction({
          campaignId,
          name,
          stats: {
            baseStats: stats,
          },
          kind,
          ownerId: kind === "PLAYER" ? ownerId || undefined : undefined,
          className: className || undefined,
          level,
          exp,
          weaponSkills,
        })
      ).unwrap();
      setName("");
      setStats(defaultStats);
      setClassName("");
      setLevel(1);
      setExp(0);
      setKind("PLAYER");
      setOwnerId("");
      setWeaponSelections({});
    } catch {
      return;
    }
  };

  const playerMembers = members.filter((member) => member.role === "PLAYER");

  return (
    <Panel>
      <h1>Character admin</h1>
      <form onSubmit={onCreateCharacter} className="form">
        <Field label="Character name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <div className="stats-grid">
          <Field label="Class">
            <SelectInput value={className} onChange={(e) => handleClassChange(e.target.value)}>
              <option value="">Select class</option>
              {classes.map((gameClass) => (
                <option key={gameClass.id} value={gameClass.name}>
                  {gameClass.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Level">
            <TextInput
              type="number"
              min={1}
              max={20}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            />
          </Field>
          <Field label="EXP">
            <TextInput
              type="number"
              min={0}
              max={99}
              value={exp}
              onChange={(e) => setExp(Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="stats-grid">
          {weaponTypes.map((weapon) => (
            <label key={weapon} className="check-field">
              <input
                type="checkbox"
                checked={!!weaponSelections[weapon]}
                onChange={(e) =>
                  setWeaponSelections((prev) => ({
                    ...prev,
                    [weapon]: e.target.checked,
                  }))
                }
              />
              <span>{weapon}</span>
            </label>
          ))}
        </div>
        <Field label="Type">
          <SelectInput value={kind} onChange={(e) => setKind(e.target.value as "PLAYER" | "NPC" | "ENEMY")}>
            <option value="PLAYER">Player</option>
            <option value="NPC">NPC</option>
            <option value="ENEMY">Enemy</option>
          </SelectInput>
        </Field>
        {kind === "PLAYER" && (
          <Field label="Owner">
            <SelectInput value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Assign later</option>
              {playerMembers.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.displayName}
                </option>
              ))}
            </SelectInput>
          </Field>
        )}
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
            <p className="muted">
              {character.className ? `Class: ${character.className}` : "Class: Unassigned"} · Level {character.level ?? 1} · EXP {character.exp ?? 0}
            </p>
            {character.weaponSkills && character.weaponSkills.length > 0 && (
              <p className="muted">
                Weapon skills: {character.weaponSkills.map((skill: { weapon: string; rank: string }) => `${skill.weapon} ${skill.rank}`).join(", ")}
              </p>
            )}
            <p className="muted">Owner: {character.owner?.displayName ?? "Unassigned"}</p>
            <div className="stat-row">
              {Object.entries(getDisplayStats(character.stats)).map(([label, value]) => (
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
