import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createCharacter as createCharacterAction,
  fetchCharacterDetail,
  fetchCharacters,
  updateCharacter as updateCharacterAction,
} from "../store/slices/characterSlice";
import { fetchCampaignMembers } from "../store/slices/campaignSlice";
import { fetchClasses } from "../store/slices/classSlice";
import Panel from "../components/ui/Panel";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
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
  const { characters, selectedCharacter, error } = useAppSelector((state) => state.characters);
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
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [autoLevel, setAutoLevel] = useState(false);
  const [lastLevel, setLastLevel] = useState(1);

  const statKeys = useMemo(() => Object.keys(stats), [stats]);
  const classTreeOptions = useMemo(() => {
    const byName = new Map(classes.map((gameClass) => [gameClass.name, gameClass]));
    const childNames = new Set<string>();

    classes.forEach((gameClass) => {
      (gameClass.promotesTo ?? []).forEach((child) => childNames.add(child));
    });

    const roots = classes.filter((gameClass) => !childNames.has(gameClass.name));
    const options: Array<{ name: string; label: string }> = [];

    const walk = (name: string, depth: number) => {
      const node = byName.get(name);
      if (!node) return;
      options.push({ name: node.name, label: `${"— ".repeat(depth)}${node.name}` });
      (node.promotesTo ?? []).forEach((child) => walk(child, depth + 1));
    };

    roots.forEach((root) => walk(root.name, 0));
    if (options.length === 0) {
      return classes.map((gameClass) => ({ name: gameClass.name, label: gameClass.name }));
    }
    return options;
  }, [classes]);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
    dispatch(fetchCampaignMembers(campaignId));
    dispatch(fetchClasses());
  }, [campaignId, dispatch]);

  useEffect(() => {
    if (!selectedCharacterId && characters.length > 0) {
      setSelectedCharacterId(characters[0].id);
    }
  }, [characters, selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId) return;
    dispatch(fetchCharacterDetail(selectedCharacterId));
  }, [dispatch, selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacter) return;
    setName(selectedCharacter.name ?? "");
    setStats({ ...defaultStats, ...getDisplayStats(selectedCharacter.stats) });
    setClassName(selectedCharacter.className ?? "");
    setLevel(selectedCharacter.level ?? 1);
    setLastLevel(selectedCharacter.level ?? 1);
    setExp(selectedCharacter.exp ?? 0);
    setKind(selectedCharacter.kind ?? "PLAYER");
    setOwnerId(selectedCharacter.owner?.id ?? "");
    setAutoLevel((selectedCharacter.kind ?? "PLAYER") !== "PLAYER");
    const nextSelections: Record<string, boolean> = {};
    weaponTypes.forEach((weapon) => {
      nextSelections[weapon] = !!selectedCharacter.weaponSkills?.some((skill) => skill.weapon === weapon);
    });
    setWeaponSelections(nextSelections);
  }, [selectedCharacter]);

  const applyGrowths = (
    baseStats: Record<string, number>,
    growths: Record<string, number> | undefined,
    delta: number
  ) => {
    if (!growths || delta === 0) return baseStats;
    const next: Record<string, number> = { ...baseStats };
    Object.keys(baseStats).forEach((key) => {
      const growth = growths[key] ?? 0;
      const adjustment = Math.round((delta * growth) / 100);
      next[key] = (baseStats[key] ?? 0) + adjustment;
    });
    return next;
  };

  const handleClassChange = (value: string) => {
    setClassName(value);
    const match = classes.find((gameClass) => gameClass.name === value);
    if (match?.baseStats && Object.keys(match.baseStats).length > 0) {
      const baseStats = { ...defaultStats, ...match.baseStats };
      if (autoLevel) {
        const delta = level - 1;
        setStats(applyGrowths(baseStats, match.growths ?? undefined, delta));
      } else {
        setStats((prev) => ({
          ...prev,
          ...match.baseStats,
        }));
      }
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

  const handleLevelChange = (value: number) => {
    const nextLevel = Number.isNaN(value) ? 1 : value;
    if (autoLevel && className) {
      const match = classes.find((gameClass) => gameClass.name === className);
      const growths = match?.growths ?? undefined;
      setStats((prev) => applyGrowths(prev, growths, nextLevel - lastLevel));
    }
    setLevel(nextLevel);
    setLastLevel(nextLevel);
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
      setSelectedCharacterId(null);
    } catch {
      return;
    }
  };

  const onUpdateCharacter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignId || !selectedCharacterId) return;
    try {
      const match = classes.find((gameClass) => gameClass.name === className);
      const weaponSkills = weaponTypes
        .filter((weapon) => weaponSelections[weapon])
        .map((weapon) => ({
          weapon,
          rank: match?.weaponRanks?.[weapon] ?? "E",
        }));

      await dispatch(
        updateCharacterAction({
          characterId: selectedCharacterId,
          name,
          stats: {
            baseStats: stats,
          },
          kind,
          ownerId: kind === "PLAYER" ? ownerId || null : null,
          className: className || null,
          level,
          exp,
          weaponSkills,
        })
      ).unwrap();
    } catch {
      return;
    }
  };

  const startNewCharacter = () => {
    setSelectedCharacterId(null);
    setName("");
    setStats(defaultStats);
    setClassName("");
    setLevel(1);
    setLastLevel(1);
    setExp(0);
    setKind("PLAYER");
    setOwnerId("");
    setWeaponSelections({});
    setAutoLevel(false);
  };

  const playerMembers = members.filter((member) => member.role === "PLAYER");

  return (
    <Panel>
      <h1>Character admin</h1>
      <form onSubmit={selectedCharacterId ? onUpdateCharacter : onCreateCharacter} className="form">
        <Field label="Character name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <div className="stats-grid">
          <Field label="Class">
            <SelectInput value={className} onChange={(e) => handleClassChange(e.target.value)}>
              <option value="">Select class</option>
              {classTreeOptions.map((option, idx) => (
                <option key={`${option.name}-${idx}`} value={option.name}>
                  {option.label}
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
              onChange={(e) => handleLevelChange(Number(e.target.value))}
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
          <label className="switch-field">
            <span className="switch-label">Auto level stats</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={autoLevel}
                onChange={(e) => setAutoLevel(e.target.checked)}
              />
              <span className="slider" />
            </div>
          </label>
        </div>
        <div className="stats-grid">
          {weaponTypes.map((weapon, idx) => (
            <label key={`${weapon}-${idx}`} className="check-field">
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
          <SelectInput
            value={kind}
            onChange={(e) => {
              const nextKind = e.target.value as "PLAYER" | "NPC" | "ENEMY";
              setKind(nextKind);
              setAutoLevel(nextKind !== "PLAYER");
              if (nextKind !== "PLAYER") {
                setOwnerId("");
              }
            }}
          >
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
          {statKeys.map((key, idx) => (
            <Field key={`${key}-${idx}`} label={key}>
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
        <div className="character-admin-actions">
          <Button type="submit" variant="primary">
            {selectedCharacterId ? "Update character" : "Create character"}
          </Button>
          <Button type="button" variant="ghost" onClick={startNewCharacter}>
            New character
          </Button>
        </div>
      </form>

      <div className="character-list">
        {characters.map((character) => (
          <button
            key={character.id}
            type="button"
            className={`character-row ${selectedCharacterId === character.id ? "selected" : ""}`.trim()}
            onClick={() => setSelectedCharacterId(character.id)}
          >
            <div>
              <strong>{character.name}</strong>
              <span className="muted">{character.owner?.displayName ?? "Unassigned"}</span>
            </div>
            <div className="character-meta">
              <span className="muted">{character.className ?? "Unassigned"}</span>
              <span className="muted">Level {character.level ?? 1}</span>
              <span className="muted">{character.kind}</span>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
