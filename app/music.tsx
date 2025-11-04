import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ActivityIndicator, Modal } from "react-native";
import * as MusicLibrary from "expo-music-library";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import FolderList from "../components/music/FolderList";
import TrackList from "../components/music/TrackList";
import MiniPlayer from "../components/music/MiniPlayer";
import FullPlayerModal from "../components/music/FullPlayerModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicContext } from "../context/MusicContext";

export default function Music() {
  const { tracks, setTracks, loaded, setLoaded } = useMusicContext();
  const [loading, setLoading] = useState(!loaded);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loaded) {
      (async () => {
        setLoading(true);
        let permissions = await MusicLibrary.requestPermissionsAsync();
        while (!permissions.granted) {
          permissions = await MusicLibrary.requestPermissionsAsync();
        }
        try {
          const result = await MusicLibrary.getAssetsAsync({ first: 200 });
          const filtered = (result.assets || []).filter(
            (item) => item.duration && item.duration > 0
          );
          setTracks(filtered);
          setLoaded(true);
        } catch {
          setTracks([]);
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [loaded, setTracks, setLoaded]);

  const getFolderFromUri = useCallback((uri: string) => {
    if (!uri) return "Desconocido";
    const cleanUri = uri.replace(/^file:\/\//, "");
    const parts = cleanUri.split("/");
    if (parts.length <= 1) return "Raíz";
    return parts[parts.length - 2] || "Raíz";
  }, []);

  const folders = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((track) => {
      set.add(getFolderFromUri(track.uri || track.filename || ""));
    });
    return Array.from(set).sort();
  }, [tracks, getFolderFromUri]);

  const tracksInFolder = useMemo(() => {
    if (!selectedFolder) return [];
    return tracks.filter(
      (track) => getFolderFromUri(track.uri || track.filename || "") === selectedFolder
    );
  }, [tracks, selectedFolder, getFolderFromUri]);

  useEffect(() => {
    if (audioSource) {
      player.replace({ uri: audioSource });
      player.play();
    }
  }, [audioSource, player]);

  const playTrack = useCallback((uri: string, track: any) => {
    setAudioSource(uri);
    setSelectedTrack(track);
    setShowMiniPlayer(true);
    setModalVisible(false);
  }, []);

  const pauseTrack = useCallback(() => {
    player.pause();
  }, [player]);

  const resumeTrack = useCallback(() => {
    player.play();
  }, [player]);

  const stopTrack = useCallback(() => {
    player.pause();
    player.seekTo(0);
    setSelectedTrack(null);
    setShowMiniPlayer(false);
    setModalVisible(false);
  }, [player]);

  const nextTrack = useCallback(() => {
    if (!selectedTrack) return;
    const idx = tracksInFolder.findIndex((t) => t.id === selectedTrack.id);
    if (idx < tracksInFolder.length - 1) {
      const next = tracksInFolder[idx + 1];
      setAudioSource(next.uri);
      setSelectedTrack(next);
      setShowMiniPlayer(true);
    }
  }, [selectedTrack, tracksInFolder]);

  const prevTrack = useCallback(() => {
    if (!selectedTrack) return;
    const idx = tracksInFolder.findIndex((t) => t.id === selectedTrack.id);
    if (idx > 0) {
      const prev = tracksInFolder[idx - 1];
      setAudioSource(prev.uri);
      setSelectedTrack(prev);
      setShowMiniPlayer(true);
    }
  }, [selectedTrack, tracksInFolder]);

  const seekToPosition = useCallback(
    (percent: number) => {
      if (status.duration > 0) {
        const seconds = percent * status.duration;
        player.seekTo(seconds);
      }
    },
    [player, status.duration]
  );

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", marginBottom: insets.bottom }}>
      {loading ? (
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text>Cargando música...</Text>
        </View>
      ) : selectedFolder === null ? (
        <FolderList
          folders={folders}
          tracks={tracks}
          getFolderFromUri={getFolderFromUri}
          onSelectFolder={setSelectedFolder}
        />
      ) : (
        <TrackList
          tracks={tracksInFolder}
          selectedTrack={selectedTrack}
          playTrack={playTrack}
          formatTime={formatTime}
          onBack={() => setSelectedFolder(null)}
          folderName={selectedFolder}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <FullPlayerModal
          selectedTrack={selectedTrack}
          status={status}
          formatTime={formatTime}
          seekToPosition={seekToPosition}
          pauseTrack={pauseTrack}
          resumeTrack={resumeTrack}
          nextTrack={nextTrack}
          prevTrack={prevTrack}
          setModalVisible={setModalVisible}
        />
      </Modal>

      {showMiniPlayer && selectedTrack && !modalVisible && (
        <MiniPlayer
          selectedTrack={selectedTrack}
          status={status}
          pauseTrack={pauseTrack}
          resumeTrack={resumeTrack}
          nextTrack={nextTrack}
          prevTrack={prevTrack}
          stopTrack={stopTrack}
          seekToPosition={seekToPosition}
          setModalVisible={setModalVisible}
        />
      )}
    </View>
  );
}