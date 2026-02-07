import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { fetchMapDetail, fetchTokens } from "../../../store/slices/mapSlice";

export const useMapDetail = (selectedMapId: string | null) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!selectedMapId) return;
    dispatch(fetchMapDetail(selectedMapId));
    dispatch(fetchTokens(selectedMapId));
  }, [selectedMapId, dispatch]);
};
