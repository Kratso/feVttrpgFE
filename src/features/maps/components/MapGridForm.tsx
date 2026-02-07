import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { MapInfo } from "../../../api/types";
import Field from "../../../components/ui/Field";
import TextInput from "../../../components/ui/TextInput";
import Button from "../../../components/ui/Button";

type UpdateGridPayload = {
  gridSizeX: number;
  gridSizeY: number;
  gridOffsetX: number;
  gridOffsetY: number;
};

type MapGridFormProps = {
  map: MapInfo;
  onUpdateGrid: (payload: UpdateGridPayload) => Promise<boolean> | boolean;
};

export default function MapGridForm({ map, onUpdateGrid }: MapGridFormProps) {
  const [gridSizeX, setGridSizeX] = useState(map.gridSizeX);
  const [gridSizeY, setGridSizeY] = useState(map.gridSizeY);
  const [gridOffsetX, setGridOffsetX] = useState(map.gridOffsetX);
  const [gridOffsetY, setGridOffsetY] = useState(map.gridOffsetY);

  useEffect(() => {
    setGridSizeX(map.gridSizeX);
    setGridSizeY(map.gridSizeY);
    setGridOffsetX(map.gridOffsetX);
    setGridOffsetY(map.gridOffsetY);
  }, [map]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onUpdateGrid({
      gridSizeX,
      gridSizeY,
      gridOffsetX,
      gridOffsetY,
    });
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h3>Adjust grid</h3>
      <div className="stats-grid">
        <Field label="Grid width (px)">
          <TextInput type="number" value={gridSizeX} onChange={(e) => setGridSizeX(Number(e.target.value))} min={10} />
        </Field>
        <Field label="Grid height (px)">
          <TextInput type="number" value={gridSizeY} onChange={(e) => setGridSizeY(Number(e.target.value))} min={10} />
        </Field>
      </div>
      <div className="stats-grid">
        <Field label="Offset X (px)">
          <TextInput type="number" value={gridOffsetX} onChange={(e) => setGridOffsetX(Number(e.target.value))} />
        </Field>
        <Field label="Offset Y (px)">
          <TextInput type="number" value={gridOffsetY} onChange={(e) => setGridOffsetY(Number(e.target.value))} />
        </Field>
      </div>
      <Button type="submit" variant="primary">
        Update grid
      </Button>
    </form>
  );
}
