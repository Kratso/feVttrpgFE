import { useEffect, useMemo, useState } from "react";
import Panel from "../components/ui/Panel";
import Card from "../components/ui/Card";
import ErrorBanner from "../components/ui/ErrorBanner";
import Field from "../components/ui/Field";
import SelectInput from "../components/ui/SelectInput";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchClasses } from "../store/slices/classSlice";

export default function ClassViewer() {
  const dispatch = useAppDispatch();
  const { classes, error } = useAppSelector((state) => state.classes);
  const [rootName, setRootName] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const classMap = useMemo(() => new Map(classes.map((c) => [c.name, c])), [classes]);
  const childNames = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => (c.promotesTo ?? []).forEach((child) => set.add(child)));
    return set;
  }, [classes]);

  const roots = useMemo(
    () => classes.filter((c) => !childNames.has(c.name)),
    [classes, childNames]
  );

  const renderTree = (name: string) => {
    const node = classMap.get(name);
    if (!node) return null;
    return (
      <li key={name}>
        <button
          className={`tree-item ${selectedName === name ? "active" : ""}`}
          onClick={() => setSelectedName(name)}
        >
          {name}
        </button>
        {(node.promotesTo ?? []).length > 0 && (
          <ul className="class-tree">
            {(node.promotesTo ?? []).map((child) => renderTree(child))}
          </ul>
        )}
      </li>
    );
  };

  const selectedClass = selectedName ? classMap.get(selectedName) : null;

  const handleRootChange = (value: string) => {
    setRootName(value || null);
    setSelectedName(value || null);
  };

  return (
    <Panel>
      <h1>Class viewer</h1>
      <p className="muted">Browse base stats and promotion trees.</p>
      <ErrorBanner message={error} />
      <div className="split">
        <Card>
          <h3>Root class</h3>
          {roots.length === 0 ? (
            <p className="muted">No classes loaded.</p>
          ) : (
            <Field label="Select root">
              <SelectInput value={rootName ?? ""} onChange={(e) => handleRootChange(e.target.value)}>
                <option value="">Select root class</option>
                {roots.map((root) => (
                  <option key={root.id} value={root.name}>
                    {root.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}
          {rootName && (
            <div style={{ marginTop: "1rem" }}>
              <div className="class-tree-panel">
                <ul className="class-tree">{renderTree(rootName)}</ul>
              </div>
            </div>
          )}
        </Card>
        <Card>
          <div className="stat-header">
            <h3>{selectedClass?.name ?? "Select a class"}</h3>
          </div>
          {selectedClass?.description && <p className="muted">{selectedClass.description}</p>}
          {selectedClass?.types && selectedClass.types.length > 0 && (
            <p className="muted">Types: {selectedClass.types.join(", ")}</p>
          )}
          <div className="stat-row">
            {selectedClass?.powerBonus !== undefined && (
              <div className="stat-chip">
                <span>Power Bonus</span>
                <strong>{selectedClass.powerBonus}</strong>
              </div>
            )}
            {selectedClass?.expBonus !== undefined && (
              <div className="stat-chip">
                <span>EXP Bonus</span>
                <strong>{selectedClass.expBonus}</strong>
              </div>
            )}
          </div>
          {selectedClass?.promotesTo && selectedClass.promotesTo.length > 0 && (
            <p className="muted">Promotes to: {selectedClass.promotesTo.join(", ")}</p>
          )}
          {selectedClass?.weaponRanks && (
            <div style={{ marginTop: "1rem" }}>
              <p className="muted">Weapon ranks</p>
              <div className="stat-row">
                {Object.entries(selectedClass.weaponRanks).map(([label, value]) => (
                  <div key={label} className="stat-chip">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedClass?.skills && selectedClass.skills.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p className="muted">Skills: {selectedClass.skills.join(", ")}</p>
            </div>
          )}
          {selectedClass?.baseStats ? (
            <div style={{ marginTop: "1rem" }}>
              <p className="muted">Base stats</p>
              <div className="stat-row">
                {Object.entries(selectedClass.baseStats).map(([label, value]) => (
                  <div key={label} className="stat-chip">
                    <span>{label}</span>
                    <strong>
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="muted">Choose a class to see base stats.</p>
          )}
          {selectedClass?.maxStats && (
            <div style={{ marginTop: "1rem" }}>
              <p className="muted">Max stats</p>
              <div className="stat-row">
                {Object.entries(selectedClass.maxStats).map(([label, value]) => (
                  <div key={label} className="stat-chip">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedClass?.growths && (
            <div style={{ marginTop: "1rem" }}>
              <p className="muted">Growths</p>
              <div className="stat-row">
                {Object.entries(selectedClass.growths).map(([label, value]) => (
                  <div key={label} className="stat-chip">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Panel>
  );
}
