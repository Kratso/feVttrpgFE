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
        <CardLink to={`/campaigns/${campaignId}/maps/view`}>
          <h3>Map viewer</h3>
          <p className="muted">Grid overlay with tokens and realtime updates.</p>
        </CardLink>
        {role === "DM" && (
          <CardLink to={`/campaigns/${campaignId}/maps/create`}>
            <h3>Map creator</h3>
            <p className="muted">Build new maps using tiles.</p>
          </CardLink>
        )}
        {role === "DM" && (
          <CardLink to={`/campaigns/${campaignId}/maps/edit`}>
            <h3>Map editor</h3>
            <p className="muted">Edit existing maps with a map selector.</p>
          </CardLink>
        )}
        {role === "DM" && (
          <CardLink to={`/campaigns/${campaignId}/tilesets`}>
            <h3>Tileset uploader</h3>
            <p className="muted">Upload tilesets and review tiles.</p>
          </CardLink>
        )}
        {role === "DM" && (
          <CardLink to={`/campaigns/${campaignId}/presets`}>
            <h3>Preset builder</h3>
            <p className="muted">Create reusable tile presets.</p>
          </CardLink>
        )}
        {role === "DM" && (
          <CardLink to={`/campaigns/${campaignId}/logs`}>
            <h3>Log audit</h3>
            <p className="muted">Review map and character changes.</p>
          </CardLink>
        )}
        <CardLink to={`/campaigns/${campaignId}/tilesets/view`}>
          <h3>Tileset viewer</h3>
          <p className="muted">Browse all tilesets and tiles.</p>
        </CardLink>
        <CardLink to={`/campaigns/${campaignId}/items`}>
          <h3>Item viewer</h3>
          <p className="muted">Browse items and weapons in a modular layout.</p>
        </CardLink>
        <CardLink to="/classes">
          <h3>Class viewer</h3>
          <p className="muted">Browse class base stats and promotions.</p>
        </CardLink>
      </div>
    </Panel>
  );
}
