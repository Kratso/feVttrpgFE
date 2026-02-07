import type { MapInfo } from "../../../api/types";
import Toolbar from "../../../components/ui/Toolbar";
import SelectInput from "../../../components/ui/SelectInput";

type MapToolbarProps = {
  maps: MapInfo[];
  selectedMapId: string | null;
  role: "DM" | "PLAYER" | null;
  onSelectMap: (value: string) => void;
};

export default function MapToolbar({ maps, selectedMapId, role, onSelectMap }: MapToolbarProps) {
  return (
    <Toolbar>
      <SelectInput value={selectedMapId ?? ""} onChange={(e) => onSelectMap(e.target.value)}>
        {maps.map((map) => (
          <option key={map.id} value={map.id}>
            {map.name}
          </option>
        ))}
      </SelectInput>
      <span className="muted">Role: {role ?? "..."}</span>
    </Toolbar>
  );
}
