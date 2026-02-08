import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Character } from "../../../api/types";
import Field from "../../../components/ui/Field";
import SelectInput from "../../../components/ui/SelectInput";
import TextInput from "../../../components/ui/TextInput";
import Button from "../../../components/ui/Button";

type CreateTokenPayload = {
  label: string;
  x: number;
  y: number;
  color: string;
  characterId: string;
};

type CreateTokenFormProps = {
  onCreateToken: (payload: CreateTokenPayload) => Promise<boolean> | boolean;
  characters: Character[];
};

export default function CreateTokenForm({ onCreateToken, characters }: CreateTokenFormProps) {
  const [newTokenLabel, setNewTokenLabel] = useState("A");
  const [newTokenX, setNewTokenX] = useState(0);
  const [newTokenY, setNewTokenY] = useState(0);
  const [newTokenColor, setNewTokenColor] = useState("#f43f5e");
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [selectedCharacterName, setSelectedCharacterName] = useState("");

  const characterOptions = useMemo(
    () => characters.map((character) => ({ id: character.id, name: character.name })),
    [characters]
  );

  useEffect(() => {
    if (characterOptions.length === 0) {
      setSelectedCharacterId("");
      setSelectedCharacterName("");
      return;
    }

    if (!selectedCharacterId) {
      const first = characterOptions[0];
      setSelectedCharacterId(first.id);
      setSelectedCharacterName(first.name);
      if (newTokenLabel === "" || newTokenLabel === "A") {
        setNewTokenLabel(first.name);
      }
      return;
    }

    const match = characterOptions.find((entry) => entry.id === selectedCharacterId);
    if (!match) {
      const fallback = characterOptions[0];
      setSelectedCharacterId(fallback.id);
      setSelectedCharacterName(fallback.name);
      if (newTokenLabel === "" || newTokenLabel === selectedCharacterName) {
        setNewTokenLabel(fallback.name);
      }
      return;
    }

    if (match.name !== selectedCharacterName) {
      if (newTokenLabel === "" || newTokenLabel === selectedCharacterName) {
        setNewTokenLabel(match.name);
      }
      setSelectedCharacterName(match.name);
    }
  }, [characterOptions, selectedCharacterId, selectedCharacterName, newTokenLabel]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCharacterId) return;
    await onCreateToken({
      label: newTokenLabel,
      x: newTokenX,
      y: newTokenY,
      color: newTokenColor,
      characterId: selectedCharacterId,
    });
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h3>Create token</h3>
      {characterOptions.length === 0 && (
        <p className="muted">No characters available to assign.</p>
      )}
      <Field label="Character">
        <SelectInput
          value={selectedCharacterId}
          onChange={(event) => {
            const value = event.target.value;
            const match = characterOptions.find((entry) => entry.id === value);
            setSelectedCharacterId(value);
            if (match && (newTokenLabel === "" || newTokenLabel === selectedCharacterName)) {
              setNewTokenLabel(match.name);
            }
            setSelectedCharacterName(match?.name ?? "");
          }}
        >
          {characterOptions.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Label">
        <TextInput value={newTokenLabel} onChange={(e) => setNewTokenLabel(e.target.value)} />
      </Field>
      <div className="stats-grid">
        <Field label="X">
          <TextInput type="number" value={newTokenX} onChange={(e) => setNewTokenX(Number(e.target.value))} />
        </Field>
        <Field label="Y">
          <TextInput type="number" value={newTokenY} onChange={(e) => setNewTokenY(Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Color">
        <TextInput type="color" value={newTokenColor} onChange={(e) => setNewTokenColor(e.target.value)} />
      </Field>
      <Button type="submit" variant="primary" disabled={!selectedCharacterId}>
        Add token
      </Button>
    </form>
  );
}
