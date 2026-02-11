import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Character, CharacterItem, GameClass, Item } from "../api/types";
import { apiFetch } from "../api/client";
import Panel from "../components/ui/Panel";
import Card from "../components/ui/Card";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import ErrorBanner from "../components/ui/ErrorBanner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCharacters } from "../store/slices/characterSlice";
import { fetchItems } from "../store/slices/itemSlice";
import { fetchClasses } from "../store/slices/classSlice";
import { fetchSkills } from "../store/slices/skillSlice";
import { getDisplayStats } from "../utils/character";
import { getClassStatsAtLevel } from "../utils/leveling";
import { buildBattleSummary } from "../utils/battle";
import { getBattleSkillSummaries, getDeterministicModifiers } from "../utils/skills";
import { canUseWeaponForClass } from "../utils/weapon";

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

const getWeaponOptionsFromInventory = (inventory: CharacterItem[]) =>
  inventory.filter((entry) => entry.item.category === "WEAPON");

const buildGenericCharacter = (name: string, stats: Record<string, number>, level: number): Character => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  stats: { baseStats: stats },
  kind: "NPC",
  level,
  currentHp: stats.hp ?? 0,
});

export default function BattleCalculator() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { characters, error } = useAppSelector((state) => state.characters);
  const { items } = useAppSelector((state) => state.items);
  const { classes } = useAppSelector((state) => state.classes);
  const [leftSelection, setLeftSelection] = useState("generic-left");
  const [rightSelection, setRightSelection] = useState("generic-right");
  const [leftDetail, setLeftDetail] = useState<Character | null>(null);
  const [rightDetail, setRightDetail] = useState<Character | null>(null);
  const [leftWeaponId, setLeftWeaponId] = useState<string>("");
  const [rightWeaponId, setRightWeaponId] = useState<string>("");
  const [leftClassName, setLeftClassName] = useState<string>("");
  const [rightClassName, setRightClassName] = useState<string>("");
  const [leftLevel, setLeftLevel] = useState<number>(1);
  const [rightLevel, setRightLevel] = useState<number>(1);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
    dispatch(fetchItems());
    dispatch(fetchClasses());
    dispatch(fetchSkills());
  }, [campaignId, dispatch]);

  useEffect(() => {
    if (!leftSelection || leftSelection.startsWith("generic")) {
      setLeftDetail(null);
      return;
    }
    apiFetch<{ character: Character }>(`/characters/${leftSelection}`)
      .then((data) => setLeftDetail(data.character))
      .catch(() => setLeftDetail(null));
  }, [leftSelection]);

  useEffect(() => {
    if (!rightSelection || rightSelection.startsWith("generic")) {
      setRightDetail(null);
      return;
    }
    apiFetch<{ character: Character }>(`/characters/${rightSelection}`)
      .then((data) => setRightDetail(data.character))
      .catch(() => setRightDetail(null));
  }, [rightSelection]);

  useEffect(() => {
    if (leftDetail?.equippedWeaponItemId) {
      setLeftWeaponId(leftDetail.equippedWeaponItemId);
    }
  }, [leftDetail?.equippedWeaponItemId]);

  useEffect(() => {
    if (rightDetail?.equippedWeaponItemId) {
      setRightWeaponId(rightDetail.equippedWeaponItemId);
    }
  }, [rightDetail?.equippedWeaponItemId]);

  const leftClass = useMemo(
    () => classes.find((entry) => entry.name === leftClassName) ?? null,
    [classes, leftClassName]
  );
  const rightClass = useMemo(
    () => classes.find((entry) => entry.name === rightClassName) ?? null,
    [classes, rightClassName]
  );

  const leftGenericStats = useMemo(
    () => getClassStatsAtLevel(leftClass, leftLevel, defaultStats),
    [leftClass, leftLevel]
  );
  const rightGenericStats = useMemo(
    () => getClassStatsAtLevel(rightClass, rightLevel, defaultStats),
    [rightClass, rightLevel]
  );

  const leftCharacter = leftDetail
    ? leftDetail
    : buildGenericCharacter("Generic left", leftGenericStats, leftLevel);
  const rightCharacter = rightDetail
    ? rightDetail
    : buildGenericCharacter("Generic right", rightGenericStats, rightLevel);

  const leftInventoryWeapons = getWeaponOptionsFromInventory(leftDetail?.inventory ?? []);
  const rightInventoryWeapons = getWeaponOptionsFromInventory(rightDetail?.inventory ?? []);

  const leftGenericWeapons = useMemo(
    () => items.filter((item) => item.category === "WEAPON" && canUseWeaponForClass(leftClass, item)),
    [items, leftClass]
  );
  const rightGenericWeapons = useMemo(
    () => items.filter((item) => item.category === "WEAPON" && canUseWeaponForClass(rightClass, item)),
    [items, rightClass]
  );

  const leftWeapon = useMemo(() => {
    if (leftDetail) {
      return leftInventoryWeapons.find((entry) => entry.id === leftWeaponId)?.item ?? null;
    }
    return leftGenericWeapons.find((entry) => entry.id === leftWeaponId) ?? null;
  }, [leftDetail, leftInventoryWeapons, leftGenericWeapons, leftWeaponId]);

  const rightWeapon = useMemo(() => {
    if (rightDetail) {
      return rightInventoryWeapons.find((entry) => entry.id === rightWeaponId)?.item ?? null;
    }
    return rightGenericWeapons.find((entry) => entry.id === rightWeaponId) ?? null;
  }, [rightDetail, rightInventoryWeapons, rightGenericWeapons, rightWeaponId]);

  const leftStats = useMemo(
    () => (leftDetail ? getDisplayStats(leftDetail.stats) : leftGenericStats),
    [leftDetail, leftGenericStats]
  );
  const rightStats = useMemo(
    () => (rightDetail ? getDisplayStats(rightDetail.stats) : rightGenericStats),
    [rightDetail, rightGenericStats]
  );

  const leftSkillSummaries = getBattleSkillSummaries(
    leftDetail?.skills ?? [],
    leftCharacter,
    rightCharacter,
    leftWeapon
  );
  const rightSkillSummaries = getBattleSkillSummaries(
    rightDetail?.skills ?? [],
    rightCharacter,
    leftCharacter,
    rightWeapon
  );

  const leftModifiers = getDeterministicModifiers(leftSkillSummaries);
  const rightModifiers = getDeterministicModifiers(rightSkillSummaries);

  const leftBattle = buildBattleSummary(
    { stats: leftStats, weapon: leftWeapon, modifiers: leftModifiers },
    { stats: rightStats, weapon: rightWeapon, modifiers: rightModifiers }
  );
  const rightBattle = buildBattleSummary(
    { stats: rightStats, weapon: rightWeapon, modifiers: rightModifiers },
    { stats: leftStats, weapon: leftWeapon, modifiers: leftModifiers }
  );

  const characterOptions = useMemo(
    () => characters.map((entry) => ({ id: entry.id, name: entry.name })),
    [characters]
  );

  const renderSkillList = (summaries: ReturnType<typeof getBattleSkillSummaries>) => {
    if (summaries.length === 0) {
      return <p className="muted">No battle skills.</p>;
    }

    return (
      <div className="battle-skill-list">
        {summaries.map((entry) => (
          <div key={entry.id} className="battle-skill-row">
            <div>
              <strong>{entry.name}</strong>
              {entry.effectText && <span className="muted">{entry.effectText}</span>}
            </div>
            <span className="muted">
              {entry.rate === null ? "--" : `${entry.rate}%`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Panel>
      <h1>Battle calculator</h1>
      <p className="muted">Simulate combat outcomes with weapon triangle and skills.</p>
      <ErrorBanner message={error} />
      <div className="battle-grid">
        {["left", "right"].map((side) => {
          const isLeft = side === "left";
          const selection = isLeft ? leftSelection : rightSelection;
          const setSelection = isLeft ? setLeftSelection : setRightSelection;
          const className = isLeft ? leftClassName : rightClassName;
          const setClassName = isLeft ? setLeftClassName : setRightClassName;
          const level = isLeft ? leftLevel : rightLevel;
          const setLevel = isLeft ? setLeftLevel : setRightLevel;
          const weaponId = isLeft ? leftWeaponId : rightWeaponId;
          const setWeaponId = isLeft ? setLeftWeaponId : setRightWeaponId;
          const detail = isLeft ? leftDetail : rightDetail;
          const weapons = detail
            ? (isLeft ? leftInventoryWeapons : rightInventoryWeapons).map((entry) => entry.item)
            : isLeft
              ? leftGenericWeapons
              : rightGenericWeapons;
          const battle = isLeft ? leftBattle : rightBattle;
          const skills = isLeft ? leftSkillSummaries : rightSkillSummaries;

          return (
            <Card key={side} className="battle-side">
              <div className="battle-header">
                <h2>{isLeft ? "Attacker" : "Defender"}</h2>
              </div>
              <div className="battle-controls">
                <label>
                  <span className="muted">Character</span>
                  <SelectInput value={selection} onChange={(e) => setSelection(e.target.value)}>
                    <option value={`generic-${side}`}>Generic character</option>
                    {characterOptions.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                {selection.startsWith("generic") && (
                  <>
                    <label>
                      <span className="muted">Class</span>
                      <SelectInput value={className} onChange={(e) => setClassName(e.target.value)}>
                        <option value="">Select class</option>
                        {classes.map((entry) => (
                          <option key={entry.id} value={entry.name}>
                            {entry.name}
                          </option>
                        ))}
                      </SelectInput>
                    </label>
                    <label>
                      <span className="muted">Level</span>
                      <TextInput
                        type="number"
                        min={1}
                        max={20}
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                      />
                    </label>
                  </>
                )}
                <label>
                  <span className="muted">Equipped weapon</span>
                  <SelectInput value={weaponId} onChange={(e) => setWeaponId(e.target.value)}>
                    <option value="">None</option>
                    {weapons.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              </div>
              <div className="battle-stats">
                <div>
                  <span>Atk</span>
                  <strong>{battle.atk}</strong>
                </div>
                <div>
                  <span>Hit</span>
                  <strong>{battle.hit}</strong>
                </div>
                <div>
                  <span>Crit</span>
                  <strong>{battle.crit}</strong>
                </div>
                <div>
                  <span>AS</span>
                  <strong>{battle.attackSpeed}</strong>
                </div>
              </div>
              <div className="battle-results">
                <div>
                  <span>Battle Hit</span>
                  <strong>{battle.battleHit}</strong>
                </div>
                <div>
                  <span>Battle Crit</span>
                  <strong>{battle.battleCrit}</strong>
                </div>
                <div>
                  <span>Damage</span>
                  <strong>{battle.damage}</strong>
                </div>
                <div>
                  <span>Crit dmg</span>
                  <strong>{battle.critDamage}</strong>
                </div>
                <div>
                  <span>Doubles</span>
                  <strong>{battle.doubles ? "Yes" : "No"}</strong>
                </div>
              </div>
              <div className="battle-skills">
                <h3>Battle skills</h3>
                {renderSkillList(skills)}
              </div>
            </Card>
          );
        })}
      </div>
    </Panel>
  );
}
