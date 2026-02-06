import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createCampaign, fetchCampaigns } from "../store/slices/campaignSlice";
import Panel from "../components/ui/Panel";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
import CardLink from "../components/ui/CardLink";

export default function Campaigns() {
  const dispatch = useAppDispatch();
  const { campaigns, error } = useAppSelector((state) => state.campaigns);
  const [name, setName] = useState("");

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const onCreateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(createCampaign({ name })).unwrap();
      setName("");
    } catch {
      return;
    }
  };

  return (
    <Panel>
      <h1>Campaigns</h1>
      <form onSubmit={onCreateCampaign} className="inline-form">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New campaign name"
          required
        />
        <Button type="submit" variant="primary">
          Create
        </Button>
      </form>
      <ErrorBanner message={error} />

      <div className="grid">
        {campaigns.map((campaign) => (
          <CardLink key={campaign.id} to={`/campaigns/${campaign.id}`}>
            <h3>{campaign.name}</h3>
            <p className="muted">Role: {campaign.role}</p>
            <span className="link">Open dashboard →</span>
          </CardLink>
        ))}
      </div>
    </Panel>
  );
}
