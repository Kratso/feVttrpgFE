import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { fetchMaps } from "../../../store/slices/mapSlice";
import { fetchCampaignRole } from "../../../store/slices/campaignSlice";
import { fetchCharacters } from "../../../store/slices/characterSlice";

export const useMapBootstrap = (campaignId?: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!campaignId) return;
    dispatch(fetchMaps(campaignId));
    dispatch(fetchCampaignRole(campaignId));
    dispatch(fetchCharacters(campaignId));
  }, [campaignId, dispatch]);
};
