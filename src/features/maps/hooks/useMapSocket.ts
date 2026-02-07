import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Token } from "../../../api/types";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:4000";

export const useMapSocket = (selectedMapId: string | null, onTokenMoved: (token: Token) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!selectedMapId) return;
    const socket = io(WS_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.emit("map:join", { mapId: selectedMapId });
    socket.on("token:moved", ({ token }: { token: Token }) => {
      onTokenMoved(token);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedMapId, onTokenMoved]);

  return { socketRef };
};
