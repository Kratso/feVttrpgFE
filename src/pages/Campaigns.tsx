import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import type { CampaignSummary } from "../api/types";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const data = await apiFetch<{ campaigns: CampaignSummary[] }>("/campaigns");
    setCampaigns(data.campaigns);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const createCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch("/campaigns", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setName("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="panel">
      <h1>Campaigns</h1>
      <form onSubmit={createCampaign} className="inline-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New campaign name"
          required
        />
        <button type="submit" className="primary">
          Create
        </button>
      </form>
      {error && <div className="error">{error}</div>}

      <div className="grid">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="card">
            <h3>{campaign.name}</h3>
            <p className="muted">Role: {campaign.role}</p>
            <span className="link">Open dashboard →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
