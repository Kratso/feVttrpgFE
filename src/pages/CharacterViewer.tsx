import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addInventoryItem,
  addSkill,
  fetchCharacterDetail,
  fetchCharacters,
  removeInventoryItem,
  removeSkill,
  reorderInventory,
  setEquippedWeapon,
  updateCharacterHp,
  updateInventoryItem,
} from "../store/slices/characterSlice";
import { fetchCampaignRole } from "../store/slices/campaignSlice";
import { fetchItems } from "../store/slices/itemSlice";
import { fetchClasses } from "../store/slices/classSlice";
import { fetchSkills } from "../store/slices/skillSlice";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import Card from "../components/ui/Card";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import CharacterBanner from "../components/CharacterBanner";
import { getCombatStats, getDisplayStats } from "../utils/character";
import { getItemRangeLabel } from "../utils/item";
import type { CharacterItem, Item } from "../api/types";

export default function CharacterViewer() {
  const staffRangeBoostSkillId = "cmlcdhzfz003rlj6wpru1th44";
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { characters, selectedCharacter, detailLoading, error } = useAppSelector(
    (state) => state.characters
  );
  const { role } = useAppSelector((state) => state.campaigns);
  const { items } = useAppSelector((state) => state.items);
  const { classes } = useAppSelector((state) => state.classes);
  const { skills } = useAppSelector((state) => state.skills);
  const user = useAppSelector((state) => state.auth.user);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [inventoryDraft, setInventoryDraft] = useState<CharacterItem[]>([]);
  const [usesDraft, setUsesDraft] = useState<Record<string, string>>({});
  const [currentHpDraft, setCurrentHpDraft] = useState<string>("");

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
    dispatch(fetchCampaignRole(campaignId));
    dispatch(fetchItems());
    dispatch(fetchClasses());
    dispatch(fetchSkills());
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
    if (!selectedCharacter) {
      setInventoryDraft([]);
      setUsesDraft({});
      return;
    }
    const nextInventory = [...(selectedCharacter.inventory ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    setInventoryDraft(nextInventory);
    const nextUses: Record<string, string> = {};
    nextInventory.forEach((item) => {
      nextUses[item.id] = item.uses === null || item.uses === undefined ? "" : String(item.uses);
    });
    setUsesDraft(nextUses);
    const maxHp = getDisplayStats(selectedCharacter.stats).hp ?? 0;
    const currentHp = selectedCharacter.currentHp ?? maxHp;
    setCurrentHpDraft(String(currentHp));
  }, [selectedCharacter]);

  const displayStats = useMemo(() => {
    if (!selectedCharacter) return {};
    return getDisplayStats(selectedCharacter.stats);
  }, [selectedCharacter]);

  const weaponOptions = useMemo(() => {
    return inventoryDraft.filter((item) => item.item.category === "WEAPON");
  }, [inventoryDraft]);

  const canEquipWeapon = useMemo(() => {
    const rankOrder = ["E", "D", "C", "B", "A", "S"];
    return (entry: CharacterItem) => {
      if (!selectedCharacter?.className) return false;
      const item = entry.item;
      if (item.type?.toLowerCase() === "laguz") {
        if (item.classRestriction && item.classRestriction !== selectedCharacter.className) {
          return false;
        }
      }

      const requiredRank = item.weaponRank ?? "E";
      const currentRank = selectedCharacter.weaponSkills?.find(
        (skill) => skill.weapon.toLowerCase() === item.type?.toLowerCase()
      )?.rank;
      if (!currentRank) return false;
      return rankOrder.indexOf(currentRank) >= rankOrder.indexOf(requiredRank);
    };
  }, [selectedCharacter?.className, selectedCharacter?.weaponSkills]);

  const itemGroups = useMemo(() => {
    const groups = new Map<string, Item[]>();
    items.forEach((item) => {
      const key = item.type || "Other";
      const bucket = groups.get(key) ?? [];
      bucket.push(item);
      groups.set(key, bucket);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const statOrder = [
    { key: "strength", label: "Str" },
    { key: "intelligence", label: "Mag" },
    { key: "ability", label: "Skl" },
    { key: "agility", label: "Spd" },
    { key: "luck", label: "Lck" },
    { key: "constitution", label: "Def" },
    { key: "wisdom", label: "Res" },
    { key: "hp", label: "HP" },
  ];

  const classMaxStats = useMemo(() => {
    if (!selectedCharacter?.className) return {} as Record<string, number>;
    const match = classes.find((entry) => entry.name === selectedCharacter.className);
    return match?.maxStats ?? {};
  }, [classes, selectedCharacter?.className]);

  const slotItems = useMemo(() => {
    const slots: Array<CharacterItem | null> = Array.from({ length: 8 }, () => null);
    inventoryDraft.forEach((entry) => {
      if (entry.sortOrder >= 0 && entry.sortOrder < 8) {
        slots[entry.sortOrder] = entry;
      }
    });
    return slots;
  }, [inventoryDraft]);

  const equippedItem = useMemo(() => {
    if (!selectedCharacter?.equippedWeaponItemId) return null;
    return inventoryDraft.find((entry) => entry.id === selectedCharacter.equippedWeaponItemId) ?? null;
  }, [inventoryDraft, selectedCharacter?.equippedWeaponItemId]);

  const bonusStats = useMemo(() => {
    const bonus = equippedItem?.item?.bonus;
    if (!bonus || typeof bonus !== "object") return {} as Record<string, number>;
    const next: Record<string, number> = {};
    Object.entries(bonus).forEach(([key, value]) => {
      if (typeof value === "number") {
        next[key] = value;
      }
    });
    return next;
  }, [equippedItem]);

  const skillBonusStats = useMemo(() => {
    const next: Record<string, number> = {};
    (selectedCharacter?.skills ?? []).forEach((entry) => {
      const bonus = entry.skill?.bonusStats;
      if (!bonus || typeof bonus !== "object") return;
      Object.entries(bonus).forEach(([key, value]) => {
        if (typeof value !== "number") return;
        next[key] = (next[key] ?? 0) + value;
      });
    });
    return next;
  }, [selectedCharacter?.skills]);

  const effectiveStats = useMemo(() => {
    const totals: Record<string, number> = { ...displayStats };
    Object.entries(bonusStats).forEach(([key, value]) => {
      totals[key] = (totals[key] ?? 0) + value;
    });
    Object.entries(skillBonusStats).forEach(([key, value]) => {
      totals[key] = (totals[key] ?? 0) + value;
    });
    return totals;
  }, [bonusStats, displayStats, skillBonusStats]);

  const hasStaffRangeBoost = useMemo(() => {
    return (selectedCharacter?.skills ?? []).some(
      (entry) => entry.skillId === staffRangeBoostSkillId || entry.skill?.id === staffRangeBoostSkillId
    );
  }, [selectedCharacter?.skills, staffRangeBoostSkillId]);

  const applyStaffRangeBoost = useCallback((item: Item | null, range: string | number): string | number => {
    if (!hasStaffRangeBoost || !item || item.type?.toLowerCase() !== "staff") {
      return range;
    }

    const minRange = item.minRange ?? null;
    let maxRange = item.maxRange ?? null;

    if (typeof maxRange === "number" && maxRange < 10) {
      maxRange = 10;
    }

    if (typeof minRange === "number" && typeof maxRange === "number") {
      return minRange === maxRange ? String(maxRange) : `${minRange}-${maxRange}`;
    }

    if (typeof maxRange === "number") {
      return String(maxRange);
    }

    if (typeof range === "number") {
      return range < 10 ? 10 : range;
    }

    if (typeof range === "string") {
      const match = range.match(/^(\d+)(?:-(\d+))?$/);
      if (match) {
        const minParsed = Number(match[1]);
        const maxParsed = Number(match[2] ?? match[1]);
        const boostedMax = Math.max(maxParsed, 10);
        return match[2] ? `${minParsed}-${boostedMax}` : String(boostedMax);
      }
    }

    return range;
  }, [hasStaffRangeBoost]);

  const dummyCombatStats = useMemo(() => {
    const baseStats = getCombatStats(effectiveStats, equippedItem?.item ?? null).map((entry) => {
      if (entry.label !== "Rng") return entry;
      return {
        ...entry,
        value: applyStaffRangeBoost(equippedItem?.item ?? null, entry.value),
      };
    });
    const derivedBonus: Record<string, number> = {};
    (selectedCharacter?.skills ?? []).forEach((entry) => {
      const bonus = entry.skill?.bonusDerived;
      if (!bonus || typeof bonus !== "object") return;
      Object.entries(bonus).forEach(([key, value]) => {
        if (typeof value !== "number") return;
        derivedBonus[key] = (derivedBonus[key] ?? 0) + value;
      });
    });

    const labelMap: Record<string, string> = {
      Atk: "atk",
      Hit: "hit",
      Crit: "crit",
      AS: "as",
      Avo: "avoid",
      Ddg: "dodge",
      Rng: "range",
    };

    return baseStats.map((entry) => {
      const key = labelMap[entry.label];
      if (!key) return entry;
      const bonus = derivedBonus[key] ?? 0;
      if (bonus === 0) return entry;
      if (typeof entry.value === "number") {
        return { ...entry, value: entry.value + bonus };
      }
      return entry;
    });
  }, [applyStaffRangeBoost, effectiveStats, equippedItem, selectedCharacter?.skills]);

  const canEditInventory = useMemo(() => {
    if (!selectedCharacter || !user) return false;
    if (role === "DM") return true;
    return selectedCharacter.owner?.id === user.id;
  }, [role, selectedCharacter, user]);

  const canEditItems = role === "DM";
  const canEditSkills = role === "DM";
  const canEditHp = canEditInventory;

  const characterSkills = selectedCharacter?.skills ?? [];
  const weaponRankMap = useMemo(() => {
    const map = new Map<string, string>();
    (selectedCharacter?.weaponSkills ?? []).forEach((entry) => {
      map.set(entry.weapon.toLowerCase(), entry.rank);
    });
    return map;
  }, [selectedCharacter?.weaponSkills]);

  const weaponRankRows = [
    { key: "sword", label: "Sword" },
    { key: "lance", label: "Lance" },
    { key: "axe", label: "Axe" },
    { key: "bow", label: "Bow" },
    { key: "knife", label: "Knife" },
    { key: "strike", label: "Strike" },
    { key: "fire", label: "Fire" },
    { key: "thunder", label: "Thunder" },
    { key: "wind", label: "Wind" },
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
    { key: "staff", label: "Staff" },
  ];

  const handleUsesBlur = (inventoryId: string) => {
    if (!selectedCharacter) return;
    const raw = usesDraft[inventoryId];
    const value = raw === "" ? null : Number(raw);
    if (Number.isNaN(value as number)) return;
    dispatch(updateInventoryItem({
      characterId: selectedCharacter.id,
      inventoryId,
      uses: value,
    }));
  };

  const handleSlotChange = async (slotIndex: number, nextItemId: string) => {
    if (!selectedCharacter || !canEditItems) return;
    const current = slotItems[slotIndex];
    if (!nextItemId) {
      if (!current) return;
      await dispatch(removeInventoryItem({
        characterId: selectedCharacter.id,
        inventoryId: current.id,
      })).unwrap();
      const remaining = inventoryDraft
        .filter((item) => item.id !== current.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      dispatch(reorderInventory({
        characterId: selectedCharacter.id,
        orderedIds: remaining.map((item) => item.id),
      }));
      return;
    }

    if (current?.itemId === nextItemId) return;

    if (current) {
      await dispatch(removeInventoryItem({
        characterId: selectedCharacter.id,
        inventoryId: current.id,
      })).unwrap();
    }

    const added = await dispatch(addInventoryItem({
      characterId: selectedCharacter.id,
      itemId: nextItemId,
    })).unwrap();
    const withoutCurrent = inventoryDraft
      .filter((item) => item.id !== current?.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    withoutCurrent.splice(slotIndex, 0, added.inventoryItem);
    dispatch(reorderInventory({
      characterId: selectedCharacter.id,
      orderedIds: withoutCurrent.map((item) => item.id),
    }));
  };

  const handleSkillAdd = async (skillId: string) => {
    if (!selectedCharacter || !canEditSkills) return;
    if (characterSkills.some((entry) => entry.skillId === skillId)) return;
    await dispatch(addSkill({ characterId: selectedCharacter.id, skillId })).unwrap();
  };

  const handleSkillReplace = async (characterSkillId: string, nextSkillId: string) => {
    if (!selectedCharacter || !canEditSkills) return;
    const existing = characterSkills.find((entry) => entry.id === characterSkillId);
    if (!existing || existing.skillId === nextSkillId) return;
    if (characterSkills.some((entry) => entry.skillId === nextSkillId)) return;
    await dispatch(removeSkill({ characterId: selectedCharacter.id, characterSkillId })).unwrap();
    await dispatch(addSkill({ characterId: selectedCharacter.id, skillId: nextSkillId })).unwrap();
  };

  const handleHpBlur = () => {
    if (!selectedCharacter || !canEditHp) return;
    const value = Number(currentHpDraft);
    if (Number.isNaN(value)) return;
    const maxHp = (displayStats.hp ?? 0) + (bonusStats.hp ?? 0) + (skillBonusStats.hp ?? 0);
    const clamped = Math.max(0, Math.min(value, maxHp));
    setCurrentHpDraft(String(clamped));
    dispatch(updateCharacterHp({ characterId: selectedCharacter.id, currentHp: clamped }));
  };

  return (
    <Panel>
      <h1>Character viewer</h1>
      <p className="muted">Select a character to view the full sheet and inventory.</p>
      <ErrorBanner message={error} />
      <div className="character-viewer-panel">
        {selectedCharacter ? (
          <Card className="character-sheet">
            <CharacterBanner
              name={selectedCharacter.name}
              className={selectedCharacter.className}
              level={selectedCharacter.level}
              exp={selectedCharacter.exp}
              currentHp={currentHpDraft}
              maxHp={(displayStats.hp ?? 0) + (bonusStats.hp ?? 0) + (skillBonusStats.hp ?? 0)}
              canEditHp={canEditHp}
              onHpChange={setCurrentHpDraft}
              onHpBlur={handleHpBlur}
              combatStats={dummyCombatStats}
            />
            <div className="character-sheet-body">
              <div className="character-ability-panel">
                <h3>Stats</h3>
                <div className="ability-list">
                  {statOrder.map((stat) => {
                    const value = displayStats[stat.key] ?? 0;
                    const weaponBonusValue = bonusStats[stat.key] ?? 0;
                    const skillBonusValue = skillBonusStats[stat.key] ?? 0;
                    const totalBonus = weaponBonusValue + skillBonusValue;
                    const totalValue = value + totalBonus;
                    const maxValue = classMaxStats[stat.key] ?? value;
                    const ratio = maxValue > 0 ? Math.min(1, value / maxValue) : 0;
                    const bonusRatio = maxValue > 0 ? totalBonus / maxValue : 0;
                    const isMaxed = maxValue > 0 && value >= maxValue;
                    const hasBonus = totalBonus !== 0;
                    const bonusParts = [
                      weaponBonusValue ? `Weapon ${weaponBonusValue > 0 ? "+" : ""}${weaponBonusValue}` : null,
                      skillBonusValue ? `Skills ${skillBonusValue > 0 ? "+" : ""}${skillBonusValue}` : null,
                    ].filter(Boolean);
                    return (
                      <div
                        key={stat.key}
                        className={`ability-row ${isMaxed ? "maxed" : ""} ${hasBonus ? "has-bonus" : ""}`.trim()}
                      >
                        <span className="ability-label">{stat.label}</span>
                        <div className="ability-bar">
                          <div className="ability-fill" style={{ width: `${ratio * 100}%` }} />
                          {totalBonus > 0 && (
                            <div
                              className="ability-bonus"
                              style={{ left: `${ratio * 100}%`, width: `${bonusRatio * 100}%` }}
                            />
                          )}
                        </div>
                        <strong>{totalValue}</strong>
                        {hasBonus && (
                          <div className="stat-bonus-tooltip" role="tooltip">
                            {bonusParts.length > 0 ? bonusParts.join(" · ") : "Bonus applied"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="character-items-panel">
                <div className="items-header">
                  <h3>Items</h3>
                  <span className="muted">{inventoryDraft.length} / 8</span>
                </div>
                <div className="equipped-slot">
                  <span className="muted">Equipped weapon</span>
                  <SelectInput
                    value={selectedCharacter.equippedWeaponItemId ?? ""}
                    onChange={(event) =>
                      dispatch(
                        setEquippedWeapon({
                          characterId: selectedCharacter.id,
                          inventoryId: event.target.value || null,
                        })
                      )
                    }
                    disabled={!canEditInventory}
                  >
                    <option value="">None</option>
                    {weaponOptions.map((entry) => {
                      const allowed = canEquipWeapon(entry);
                      return (
                        <option
                          key={entry.id}
                          value={entry.id}
                          disabled={!allowed}
                        >
                          {entry.item.name}
                          {!allowed ? " (restricted)" : ""}
                        </option>
                      );
                    })}
                  </SelectInput>
                </div>
                <div className="inventory-selectors">
                  {slotItems.map((entry, index) => {
                    const currentUses = entry?.uses ?? entry?.item.uses ?? null;
                    const maxUses = entry?.item.uses ?? null;
                    const item = entry?.item ?? null;
                    const isWeapon = item?.category === "WEAPON";
                    const rawRangeLabel = item
                      ? getItemRangeLabel(item, { fallback: "-" }) ?? "-"
                      : "-";
                    const rangeLabel = applyStaffRangeBoost(item, rawRangeLabel);
                    return (
                      <div key={`slot-${index}`} className={`inventory-slot ${isWeapon ? "weapon" : ""}`.trim()}>
                        <SelectInput
                          value={entry?.itemId ?? ""}
                          onChange={(event) => handleSlotChange(index, event.target.value)}
                          disabled={!canEditItems}
                        >
                          <option value="">Empty slot</option>
                          {itemGroups.map(([group, groupItems]) => (
                            <optgroup key={group} label={group}>
                              {groupItems.map((item: Item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </SelectInput>
                        <div className="slot-uses">
                          {maxUses !== null && (
                            <>
                              <TextInput
                                type="number"
                                min={0}
                                value={usesDraft[entry?.id ?? ""] ?? String(currentUses ?? "")}
                                onChange={(event) =>
                                  entry &&
                                  setUsesDraft((prev) => ({ ...prev, [entry.id]: event.target.value }))
                                }
                                onBlur={() => entry && handleUsesBlur(entry.id)}
                                disabled={!canEditInventory}
                              />
                              <span className="muted">/ {maxUses}</span>
                            </>
                          )}
                        </div>
                        {isWeapon && item && (
                          <div className="weapon-tooltip" role="tooltip">
                            <div className="weapon-tooltip-header">
                              <strong>{item.name}</strong>
                              <span className="muted">{item.weaponRank ?? "-"}</span>
                            </div>
                            <div className="weapon-tooltip-stats">
                              <div><span>Mt</span><strong>{item.might ?? 0}</strong></div>
                              <div><span>Hit</span><strong>{item.hit ?? 0}</strong></div>
                              <div><span>Crit</span><strong>{item.crit ?? 0}</strong></div>
                              <div><span>Wt</span><strong>{item.weight ?? 0}</strong></div>
                              <div><span>Rng</span><strong>{rangeLabel}</strong></div>
                            </div>
                            {item.description && (
                              <p className="muted weapon-tooltip-desc">{item.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="character-extra-panel">
              <div className="personal-data">
                <h3>Personal Data</h3>
                <div className="personal-list">
                  <div className="personal-row">
                    <span>Cn</span>
                    <strong>{displayStats.constitution ?? 0}</strong>
                  </div>
                  <div className="personal-row">
                    <span>Wt</span>
                    <strong>--</strong>
                  </div>
                  <div className="personal-row">
                    <span>Move</span>
                    <strong>{displayStats.movement ?? 0}</strong>
                  </div>
                  <div className="personal-row">
                    <span>Aff</span>
                    <strong>--</strong>
                  </div>
                  <div className="personal-row">
                    <span>Trv</span>
                    <strong>--</strong>
                  </div>
                  <div className="personal-row">
                    <span>Cd</span>
                    <strong>--</strong>
                  </div>
                </div>
              </div>
              <div className="weapon-ranks">
                <h3>Weapon Level</h3>
                <div className="weapon-rank-grid">
                  {weaponRankRows.map((row) => (
                    <div key={row.key} className="weapon-rank-row">
                      <span>{row.label}</span>
                      <strong>{weaponRankMap.get(row.key) ?? "--"}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="character-skills-panel">
              <div className="items-header">
                <h3>Skills</h3>
                <span className="muted">{characterSkills.length}</span>
              </div>
              <div className="skills-list">
                {characterSkills.map((entry) => (
                  <div key={entry.id} className="skill-row">
                    <SelectInput
                      value={entry.skillId}
                      onChange={(event) => handleSkillReplace(entry.id, event.target.value)}
                      disabled={!canEditSkills}
                    >
                      {!skills.some((skill) => skill.id === entry.skillId) && (
                        <option value={entry.skillId}>{entry.skill?.name ?? "Unknown skill"}</option>
                      )}
                      {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </SelectInput>
                    {canEditSkills && (
                      <button
                        type="button"
                        className="skill-remove"
                        onClick={() =>
                          dispatch(
                            removeSkill({
                              characterId: selectedCharacter.id,
                              characterSkillId: entry.id,
                            })
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                    {entry.skill?.description && (
                      <div className="skill-tooltip" role="tooltip">
                        <strong>{entry.skill.name}</strong>
                        <p className="muted">{entry.skill.description}</p>
                      </div>
                    )}
                  </div>
                ))}
                {canEditSkills && (
                  <div className="skill-row">
                    <SelectInput value="" onChange={(event) => handleSkillAdd(event.target.value)}>
                      <option value="">Add skill...</option>
                      {skills
                        .filter((skill) => !characterSkills.some((entry) => entry.skillId === skill.id))
                        .map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                    </SelectInput>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            {detailLoading ? <p className="muted">Loading character...</p> : <p className="muted">Select a character to view details.</p>}
          </Card>
        )}
      </div>
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
