import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCampaignRole } from "../store/slices/campaignSlice";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";
import CardLink from "../components/ui/CardLink";

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
    return <Panel>Missing campaign.</Panel>;
  }

  return (
    <Panel>
      <h1>Campaign dashboard</h1>
      <ErrorBanner message={error} />
      <div className="grid">
        {role === "DM" && (
          <CardLink to={`/campaigns/${campaignId}/characters/admin`}>
            <h3>Admin character editor</h3>
            <p className="muted">Create and update characters for the party.</p>
          </CardLink>
        )}
        <CardLink to={`/campaigns/${campaignId}/characters/view`}>
          <h3>Character viewer</h3>
          <p className="muted">Browse character sheets in a stat-viewer layout.</p>
        </CardLink>
        <CardLink to={`/campaigns/${campaignId}/maps`}>
          <h3>Map viewer</h3>
          <p className="muted">Grid overlay with tokens and realtime updates.</p>
        </CardLink>
        <CardLink to="/classes">
          <h3>Class viewer</h3>
          <p className="muted">Browse class base stats and promotions.</p>
        </CardLink>
      </div>
    </Panel>
  );
}
