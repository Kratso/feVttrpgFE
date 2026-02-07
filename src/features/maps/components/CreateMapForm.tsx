import { useState } from "react";
import type { FormEvent } from "react";
import Field from "../../../components/ui/Field";
import TextInput from "../../../components/ui/TextInput";
import Button from "../../../components/ui/Button";

type CreateMapPayload = {
  name: string;
  imageUrl: string;
  gridSize: number;
};

type CreateMapFormProps = {
  onCreateMap: (payload: CreateMapPayload) => Promise<boolean> | boolean;
};

export default function CreateMapForm({ onCreateMap }: CreateMapFormProps) {
  const [newMapName, setNewMapName] = useState("");
  const [newMapUrl, setNewMapUrl] = useState("");
  const [newGridSize, setNewGridSize] = useState(50);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const success = await onCreateMap({
      name: newMapName,
      imageUrl: newMapUrl,
      gridSize: newGridSize,
    });
    if (success) {
      setNewMapName("");
      setNewMapUrl("");
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h3>Create map</h3>
      <Field label="Map name">
        <TextInput value={newMapName} onChange={(e) => setNewMapName(e.target.value)} required />
      </Field>
      <Field label="Image URL">
        <TextInput value={newMapUrl} onChange={(e) => setNewMapUrl(e.target.value)} required />
      </Field>
      <Field label="Grid size (px)">
        <TextInput
          type="number"
          value={newGridSize}
          onChange={(e) => setNewGridSize(Number(e.target.value))}
          min={20}
        />
      </Field>
      <Button type="submit" variant="primary">
        Add map
      </Button>
    </form>
  );
}
