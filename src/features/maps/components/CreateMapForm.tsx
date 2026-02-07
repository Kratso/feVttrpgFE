import { useState } from "react";
import type { FormEvent } from "react";
import Field from "../../../components/ui/Field";
import TextInput from "../../../components/ui/TextInput";
import Button from "../../../components/ui/Button";

type CreateMapPayload = {
  name: string;
  imageUrl: string;
  gridSizeX: number;
  gridSizeY: number;
};

type CreateMapFormProps = {
  onCreateMap: (payload: CreateMapPayload) => Promise<boolean> | boolean;
};

export default function CreateMapForm({ onCreateMap }: CreateMapFormProps) {
  const [newMapName, setNewMapName] = useState("");
  const [newMapUrl, setNewMapUrl] = useState("");
  const [newGridSizeX, setNewGridSizeX] = useState(50);
  const [newGridSizeY, setNewGridSizeY] = useState(50);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const success = await onCreateMap({
      name: newMapName,
      imageUrl: newMapUrl,
      gridSizeX: newGridSizeX,
      gridSizeY: newGridSizeY,
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
      <div className="stats-grid">
        <Field label="Grid width (px)">
          <TextInput
            type="number"
            value={newGridSizeX}
            onChange={(e) => setNewGridSizeX(Number(e.target.value))}
            min={10}
          />
        </Field>
        <Field label="Grid height (px)">
          <TextInput
            type="number"
            value={newGridSizeY}
            onChange={(e) => setNewGridSizeY(Number(e.target.value))}
            min={10}
          />
        </Field>
      </div>
      <Button type="submit" variant="primary">
        Add map
      </Button>
    </form>
  );
}
