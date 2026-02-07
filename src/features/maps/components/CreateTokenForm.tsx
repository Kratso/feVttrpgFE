import { useState } from "react";
import type { FormEvent } from "react";
import Field from "../../../components/ui/Field";
import TextInput from "../../../components/ui/TextInput";
import Button from "../../../components/ui/Button";

type CreateTokenPayload = {
  label: string;
  x: number;
  y: number;
  color: string;
};

type CreateTokenFormProps = {
  onCreateToken: (payload: CreateTokenPayload) => Promise<boolean> | boolean;
};

export default function CreateTokenForm({ onCreateToken }: CreateTokenFormProps) {
  const [newTokenLabel, setNewTokenLabel] = useState("A");
  const [newTokenX, setNewTokenX] = useState(0);
  const [newTokenY, setNewTokenY] = useState(0);
  const [newTokenColor, setNewTokenColor] = useState("#f43f5e");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onCreateToken({
      label: newTokenLabel,
      x: newTokenX,
      y: newTokenY,
      color: newTokenColor,
    });
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h3>Create token</h3>
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
      <Button type="submit" variant="primary">
        Add token
      </Button>
    </form>
  );
}
