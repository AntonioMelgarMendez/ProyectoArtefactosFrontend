import React, { createContext, useContext, useState } from "react";

type MusicContextType = {
  tracks: any[];
  setTracks: (tracks: any[]) => void;
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  return (
    <MusicContext.Provider value={{ tracks, setTracks, loaded, setLoaded }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusicContext must be used within MusicProvider");
  return context;
}