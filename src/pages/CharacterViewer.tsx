import { useEffect } from "react";
import { useParams } from "react-router-dom";
import StatCard from "../components/StatCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCharacters } from "../store/slices/characterSlice";
import Panel from "../components/ui/Panel";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function CharacterViewer() {
  const { campaignId } = useParams();
  const dispatch = useAppDispatch();
  const { characters, error } = useAppSelector((state) => state.characters);

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchCharacters(campaignId));
  }, [campaignId, dispatch]);

  return (
    <Panel>
      <h1>Character viewer</h1>
      <p className="muted">Inspired by the Radiant Dawn stat viewer layout.</p>
      <ErrorBanner message={error} />
      <div className="stat-grid">
        {characters.map((character) => (
          <StatCard key={character.id} character={character} />
        ))}
      </div>
    </Panel>
  );
}
