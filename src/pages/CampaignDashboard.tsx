import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCampaignRole } from "../store/slices/campaignSlice";

export default function CampaignDashboard() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { role, error } = useAppSelector((state) => state.campaigns);

  useEffect(() => {
    if (!campaignId) {
      return;
    }
    dispatch(fetchCampaignRole(campaignId));
  }, [campaignId, dispatch]);

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
