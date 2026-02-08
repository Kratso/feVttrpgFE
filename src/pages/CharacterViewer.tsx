import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addInventoryItem,
  fetchCharacterDetail,
  fetchCharacters,
  removeInventoryItem,
  reorderInventory,
  setEquippedWeapon,
  updateInventoryItem,
} from "../store/slices/characterSlice";
import { fetchCampaignRole } from "../store/slices/campaignSlice";
import { fetchItems } from "../store/slices/itemSlice";
import { fetchClasses } from "../store/slices/classSlice";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import Card from "../components/ui/Card";
import SelectInput from "../components/ui/SelectInput";
import TextInput from "../components/ui/TextInput";
import { getDisplayStats } from "../utils/character";
import type { CharacterItem, Item } from "../api/types";

export default function CharacterViewer() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { characters, selectedCharacter, detailLoading, error } = useAppSelector(
    (state) => state.characters
  );
  const { role } = useAppSelector((state) => state.campaigns);
  const { items } = useAppSelector((state) => state.items);
  const { classes } = useAppSelector((state) => state.classes);
  const user = useAppSelector((state) => state.auth.user);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [inventoryDraft, setInventoryDraft] = useState<CharacterItem[]>([]);
  const [usesDraft, setUsesDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
    dispatch(fetchCampaignRole(campaignId));
    dispatch(fetchItems());
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
  }, [selectedCharacter]);

  const displayStats = useMemo(() => {
    if (!selectedCharacter) return {};
    return getDisplayStats(selectedCharacter.stats);
  }, [selectedCharacter]);

  const weaponOptions = useMemo(() => {
    return inventoryDraft.filter((item) => item.item.category === "WEAPON");
  }, [inventoryDraft]);

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

  const dummyCombatStats = [
    { label: "Atk", value: 14 },
    { label: "Hit", value: 126 },
    { label: "Crit", value: 8 },
    { label: "AS", value: 9 },
    { label: "Avo", value: 32 },
    { label: "Ddg", value: 9 },
    { label: "Rng", value: "1-2" },
    { label: "Effect", value: "-" },
  ];

  const canEditInventory = useMemo(() => {
    if (!selectedCharacter || !user) return false;
    if (role === "DM") return true;
    return selectedCharacter.owner?.id === user.id;
  }, [role, selectedCharacter, user]);

  const canEditItems = role === "DM";

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

  return (
    <Panel>
      <h1>Character viewer</h1>
      <p className="muted">Select a character to view the full sheet and inventory.</p>
      <ErrorBanner message={error} />
      <div className="character-viewer-panel">
        {selectedCharacter ? (
          <Card className="character-sheet">
            <div className="character-sheet-header">
              <div className="character-name-block">
                <h2>{selectedCharacter.name}</h2>
                <div className="character-subtitle">
                  <span>{selectedCharacter.className ?? "Unassigned class"}</span>
                  <span>Lv {selectedCharacter.level ?? 1}</span>
                  <span>Exp {selectedCharacter.exp ?? 0}</span>
                </div>
              </div>
              <div className="character-portrait" aria-hidden="true" />
              <div className="character-dummy-stats">
                {dummyCombatStats.map((entry) => (
                  <div key={entry.label} className="dummy-stat">
                    <span>{entry.label}</span>
                    <strong>{entry.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="character-sheet-body">
              <div className="character-ability-panel">
                <h3>Stats</h3>
                <div className="ability-list">
                  {statOrder.map((stat) => {
                    const value = displayStats[stat.key] ?? 0;
                    const maxValue = classMaxStats[stat.key] ?? value;
                    const ratio = maxValue > 0 ? Math.min(1, value / maxValue) : 0;
                    const isMaxed = maxValue > 0 && value >= maxValue;
                    return (
                      <div key={stat.key} className={`ability-row ${isMaxed ? "maxed" : ""}`.trim()}>
                        <span className="ability-label">{stat.label}</span>
                        <div className="ability-bar">
                          <div className="ability-fill" style={{ width: `${ratio * 100}%` }} />
                        </div>
                        <strong>{value}</strong>
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
                    {weaponOptions.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.item.name}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div className="inventory-selectors">
                  {slotItems.map((entry, index) => {
                    const currentUses = entry?.uses ?? entry?.item.uses ?? null;
                    const maxUses = entry?.item.uses ?? null;
                    return (
                      <div key={`slot-${index}`} className="inventory-slot">
                        <SelectInput
                          value={entry?.itemId ?? ""}
                          onChange={(event) => handleSlotChange(index, event.target.value)}
                          disabled={!canEditItems}
                        >
                          <option value="">Empty slot</option>
                          {items.map((item: Item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
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
                      </div>
                    );
                  })}
                </div>
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
