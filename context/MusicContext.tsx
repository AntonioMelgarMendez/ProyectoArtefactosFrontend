import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const MusicContext = createContext<any>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (audioSource) {
      player.replace({ uri: audioSource });
      player.play();
    }
  }, [audioSource]);

  const playTrack = useCallback((uri: string, track: any) => {
    setAudioSource(uri);
    setSelectedTrack(track);
  }, []);

  const pauseTrack = useCallback(() => player.pause(), [player]);
  const resumeTrack = useCallback(() => player.play(), [player]);

  const seekToPosition = useCallback(
    (percent: number) => {
      if (status.duration > 0) {
        const seconds = percent * status.duration;
        player.seekTo(seconds);
      }
    },
    [player, status.duration]
  );
  const nextTrack = useCallback(() => {
    if (!selectedTrack || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === selectedTrack.id);
    if (idx < tracks.length - 1) {
      const next = tracks[idx + 1];
      playTrack(next.uri, next);
    }
  }, [selectedTrack, tracks, playTrack]);

  const prevTrack = useCallback(() => {
    if (!selectedTrack || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === selectedTrack.id);
    if (idx > 0) {
      const prev = tracks[idx - 1];
      playTrack(prev.uri, prev);
    }
  }, [selectedTrack, tracks, playTrack]);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        setTracks,
        loaded,
        setLoaded,
        player,
        status,
        selectedTrack,
        setSelectedTrack,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        prevTrack,
        seekToPosition,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => useContext(MusicContext);
