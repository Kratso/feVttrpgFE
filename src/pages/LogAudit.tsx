import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Panel from "../components/ui/Panel";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
import Card from "../components/ui/Card";
import { apiFetch } from "../api/client";
import type { AuditLog } from "../api/types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCampaignRole } from "../store/slices/campaignSlice";
import { fetchMaps } from "../store/slices/mapSlice";
import { fetchCharacters } from "../store/slices/characterSlice";

const formatPayload = (payload: unknown) => {
  if (!payload) return "null";
  return JSON.stringify(payload, null, 2);
};

type AuditTab = "maps" | "characters";

export default function LogAudit() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { role } = useAppSelector((state) => state.campaigns);
  const { maps } = useAppSelector((state) => state.maps);
  const { characters } = useAppSelector((state) => state.characters);
  const [activeTab, setActiveTab] = useState<AuditTab>("maps");
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCampaignRole(campaignId));
    dispatch(fetchMaps(campaignId));
    dispatch(fetchCharacters(campaignId));
  }, [campaignId, dispatch]);

  useEffect(() => {
    if (activeTab !== "maps") return;
    if (!selectedMapId && maps.length > 0) {
      setSelectedMapId(maps[0].id);
    }
  }, [activeTab, maps, selectedMapId]);

  useEffect(() => {
    if (activeTab !== "characters") return;
    if (!selectedCharacterId && characters.length > 0) {
      setSelectedCharacterId(characters[0].id);
    }
  }, [activeTab, characters, selectedCharacterId]);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        if (activeTab === "maps" && selectedMapId) {
          const data = await apiFetch<{ logs: AuditLog[] }>(`/maps/${selectedMapId}/audit`);
          setLogs(data.logs);
        }
        if (activeTab === "characters" && selectedCharacterId) {
          const data = await apiFetch<{ logs: AuditLog[] }>(`/characters/${selectedCharacterId}/audit`);
          setLogs(data.logs);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load logs";
        setError(message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, selectedMapId, selectedCharacterId]);

  const currentList = useMemo(() => {
    if (activeTab === "maps") {
      return maps.map((map) => ({ id: map.id, name: map.name }));
    }
    return characters.map((character) => ({
      id: character.id,
      name: character.name,
      subtitle: character.owner?.displayName ?? "Unassigned",
    }));
  }, [activeTab, maps, characters]);

  const selectedId = activeTab === "maps" ? selectedMapId : selectedCharacterId;

  if (!campaignId) {
    return <Panel>Missing campaign.</Panel>;
  }

  if (role !== "DM") {
    return (
      <Panel>
        <h1>Audit logs</h1>
        <p className="muted">Only DMs can view audit logs.</p>
      </Panel>
    );
  }

  return (
    <Panel>
      <h1>Audit logs</h1>
      <p className="muted">View map and character changes with before/after snapshots.</p>
      <ErrorBanner message={error} />
      <div className="audit-tabs">
        <Button
          type="button"
          variant={activeTab === "maps" ? "primary" : "default"}
          onClick={() => setActiveTab("maps")}
        >
          Maps
        </Button>
        <Button
          type="button"
          variant={activeTab === "characters" ? "primary" : "default"}
          onClick={() => setActiveTab("characters")}
        >
          Characters
        </Button>
      </div>
      <div className="audit-layout">
        <Card className="audit-list">
          <h3>{activeTab === "maps" ? "Maps" : "Characters"}</h3>
          {currentList.length === 0 && <p className="muted">No entries available.</p>}
          <div className="audit-list-items">
            {currentList.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`audit-list-row ${selectedId === entry.id ? "selected" : ""}`.trim()}
                onClick={() =>
                  activeTab === "maps" ? setSelectedMapId(entry.id) : setSelectedCharacterId(entry.id)
                }
              >
                <div>
                  <strong>{entry.name}</strong>
                  {entry.subtitle && <span className="muted">{entry.subtitle}</span>}
                </div>
              </button>
            ))}
          </div>
        </Card>
        <Card className="audit-detail">
          <h3>Logs</h3>
          {loading && <p className="muted">Loading logs...</p>}
          {!loading && logs.length === 0 && <p className="muted">No logs for this entry.</p>}
          <div className="audit-entries">
            {logs.map((log) => (
              <div key={log.id} className="audit-entry">
                <div className="audit-entry-header">
                  <strong>{log.action}</strong>
                  <span className="muted">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div className="audit-entry-meta">
                  <span className="muted">By {log.user.displayName}</span>
                </div>
                <details>
                  <summary>Before</summary>
                  <pre>{formatPayload(log.before)}</pre>
                </details>
                <details>
                  <summary>After</summary>
                  <pre>{formatPayload(log.after)}</pre>
                </details>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Panel>
  );
}
