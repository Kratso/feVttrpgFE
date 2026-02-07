import { useEffect, useMemo, useState } from "react";
import Panel from "../components/ui/Panel";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import SelectInput from "../components/ui/SelectInput";
import ErrorBanner from "../components/ui/ErrorBanner";
import ItemDetail from "../components/ItemDetail";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchItems } from "../store/slices/itemSlice";

type ItemViewerProps = {
  layout?: "split" | "stacked";
};

export default function ItemViewer({ layout = "split" }: ItemViewerProps) {
  const dispatch = useAppDispatch();
  const { items, error } = useAppSelector((state) => state.items);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const { itemOptions, weaponOptions } = useMemo(() => {
    const itemOptions = items.filter((item) => item.category === "ITEM");
    const weaponOptions = items.filter((item) => item.category === "WEAPON");
    return { itemOptions, weaponOptions };
  }, [items]);

  const selectedItem = useMemo(() => {
    const id = selectedItemId ?? selectedWeaponId;
    return items.find((entry) => entry.id === id) ?? null;
  }, [items, selectedItemId, selectedWeaponId]);

  const weaponGroups = useMemo(() => {
    const groups = new Map<string, typeof weaponOptions>();
    weaponOptions.forEach((weapon) => {
      const key = weapon.type || "Other";
      const bucket = groups.get(key) ?? [];
      bucket.push(weapon);
      groups.set(key, bucket);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [weaponOptions]);

  const onSelectItem = (value: string) => {
    setSelectedItemId(value || null);
    if (value) {
      setSelectedWeaponId(null);
    }
  };

  const onSelectWeapon = (value: string) => {
    setSelectedWeaponId(value || null);
    if (value) {
      setSelectedItemId(null);
    }
  };

  const layoutClass = layout === "stacked" ? "item-layout-stacked" : "split";

  return (
    <Panel>
      <h1>Item viewer</h1>
      <p className="muted">Choose an item or weapon to inspect its details.</p>
      <ErrorBanner message={error} />
      <div className={layoutClass}>
        <Card>
          <h3>Select item</h3>
          <div className="item-selectors">
            <Field label="Items">
              <SelectInput value={selectedItemId ?? ""} onChange={(e) => onSelectItem(e.target.value)}>
                <option value="">Select item</option>
                {itemOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Weapons">
              <SelectInput value={selectedWeaponId ?? ""} onChange={(e) => onSelectWeapon(e.target.value)}>
                <option value="">Select weapon</option>
                {weaponGroups.map(([group, entries]) => (
                  <optgroup key={group} label={group}>
                    {entries.map((weapon) => (
                      <option key={weapon.id} value={weapon.id}>
                        {weapon.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </SelectInput>
            </Field>
          </div>
        </Card>
        <Card>
          <ItemDetail item={selectedItem} />
        </Card>
      </div>
    </Panel>
  );
}
