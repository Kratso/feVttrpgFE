import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function CampaignDashboard() {
  const { campaignId } = useParams();
  const [role, setRole] = useState<"DM" | "PLAYER" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      return;
    }
    apiFetch<{ role: "DM" | "PLAYER" }>(`/campaigns/${campaignId}/role`)
      .then((data) => setRole(data.role))
      .catch((err) => setError(err.message));
  }, [campaignId]);

  if (!campaignId) {
    return <div className="panel">Missing campaign.</div>;
  }

  return (
    <div className="panel">
      <h1>Campaign dashboard</h1>
      {error && <div className="error">{error}</div>}
      <div className="grid">
        {role === "DM" && (
          <Link to={`/campaigns/${campaignId}/characters/admin`} className="card">
            <h3>Admin character editor</h3>
            <p className="muted">Create and update characters for the party.</p>
          </Link>
        )}
        <Link to={`/campaigns/${campaignId}/characters/view`} className="card">
          <h3>Character viewer</h3>
          <p className="muted">Browse character sheets in a stat-viewer layout.</p>
        </Link>
        <Link to={`/campaigns/${campaignId}/maps`} className="card">
          <h3>Map viewer</h3>
          <p className="muted">Grid overlay with tokens and realtime updates.</p>
        </Link>
      </div>
    </div>
  );
}
