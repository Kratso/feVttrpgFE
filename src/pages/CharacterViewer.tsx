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
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
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
  const user = useAppSelector((state) => state.auth.user);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [inventoryDraft, setInventoryDraft] = useState<CharacterItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [usesDraft, setUsesDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
    dispatch(fetchCampaignRole(campaignId));
    dispatch(fetchItems());
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

  const canEditInventory = useMemo(() => {
    if (!selectedCharacter || !user) return false;
    if (role === "DM") return true;
    return selectedCharacter.owner?.id === user.id;
  }, [role, selectedCharacter, user]);

  const canEditItems = role === "DM";

  const handleDrop = (targetId: string) => {
    if (!selectedCharacter || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const next = [...inventoryDraft];
    const fromIndex = next.findIndex((item) => item.id === draggedId);
    const toIndex = next.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggedId(null);
      return;
    }
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    const normalized = next.map((item, index) => ({ ...item, sortOrder: index }));
    setInventoryDraft(normalized);
    setDraggedId(null);
    dispatch(reorderInventory({
      characterId: selectedCharacter.id,
      orderedIds: normalized.map((item) => item.id),
    }));
  };

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

  const addItem = async () => {
    if (!selectedCharacter || !selectedItemId) return;
    await dispatch(addInventoryItem({
      characterId: selectedCharacter.id,
      itemId: selectedItemId,
    }));
    setSelectedItemId("");
  };

  return (
    <Panel>
      <h1>Character viewer</h1>
      <p className="muted">Select a character to view the full sheet and inventory.</p>
      <ErrorBanner message={error} />
      <div className="character-viewer-panel">
        {selectedCharacter ? (
          <Card className="character-detail">
            <div className="character-detail-header">
              <div>
                <h2>{selectedCharacter.name}</h2>
                <p className="muted">
                  {selectedCharacter.className ? selectedCharacter.className : "Unassigned class"} ·
                  Level {selectedCharacter.level ?? 1} · {selectedCharacter.kind}
                </p>
              </div>
              <div className="character-owner">
                <span className="muted">Owner</span>
                <strong>{selectedCharacter.owner?.displayName ?? "Unassigned"}</strong>
              </div>
            </div>
            <div className="character-detail-body">
              <div className="character-stats">
                <h3>Stats</h3>
                <div className="stats-grid">
                  {Object.entries(displayStats).map(([label, value]) => (
                    <div key={label} className="stat-chip">
                      <span className="muted">{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="character-inventory">
                <div className="inventory-header">
                  <h3>Inventory</h3>
                  <span className="muted">
                    {inventoryDraft.length} / 8 slots
                  </span>
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
                {canEditItems && (
                  <div className="inventory-add">
                    <Field label="Add item">
                      <SelectInput
                        value={selectedItemId}
                        onChange={(event) => setSelectedItemId(event.target.value)}
                      >
                        <option value="">Select item</option>
                        {items.map((item: Item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Button type="button" variant="primary" onClick={addItem} disabled={!selectedItemId}>
                      Add
                    </Button>
                  </div>
                )}
                <div className="inventory-list">
                  {inventoryDraft.length === 0 && (
                    <p className="muted">No items in inventory.</p>
                  )}
                  {inventoryDraft.map((entry) => (
                    <div
                      key={entry.id}
                      className="inventory-row"
                      draggable={canEditInventory}
                      onDragStart={() => setDraggedId(entry.id)}
                      onDragOver={(event) => {
                        if (!canEditInventory) return;
                        event.preventDefault();
                      }}
                      onDrop={() => handleDrop(entry.id)}
                    >
                      <div className="inventory-info">
                        <strong>{entry.item.name}</strong>
                        <span className="muted">{entry.item.category}</span>
                      </div>
                      <div className="inventory-actions">
                        {entry.item.uses !== null && entry.item.uses !== undefined && (
                          <TextInput
                            type="number"
                            min={0}
                            value={usesDraft[entry.id] ?? ""}
                            onChange={(event) =>
                              setUsesDraft((prev) => ({ ...prev, [entry.id]: event.target.value }))
                            }
                            onBlur={() => handleUsesBlur(entry.id)}
                            disabled={!canEditInventory}
                          />
                        )}
                        {canEditItems && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              dispatch(
                                removeInventoryItem({
                                  characterId: selectedCharacter.id,
                                  inventoryId: entry.id,
                                })
                              )
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
