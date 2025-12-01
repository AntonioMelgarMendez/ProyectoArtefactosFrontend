import * as MusicLibrary from "expo-music-library";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FolderList from "../components/music/FolderList";
import FullPlayerModal from "../components/music/FullPlayerModal";
import MiniPlayer from "../components/music/MiniPlayer";
import TrackList from "../components/music/TrackList";
import { useMusicContext } from "../context/MusicContext";

export default function Music() {
  const {
    tracks,
    setTracks,
    loaded,
    setLoaded,
    selectedTrack,
    setSelectedTrack,
    status,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    prevTrack,
    seekToPosition, 
  } = useMusicContext();

  const [loading, setLoading] = useState(!loaded);

  const [modalVisible, setModalVisible] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (selectedTrack) {
      setShowMiniPlayer(true);
    }
  }, [selectedTrack]);

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
    tracks.forEach((track: any) => {
      set.add(getFolderFromUri(track.uri || track.filename || ""));
    });
    return Array.from(set).sort();
  }, [tracks, getFolderFromUri]);

  const tracksInFolder = useMemo(() => {
    if (!selectedFolder) return [];
    return tracks.filter(
      (track: any) =>
        getFolderFromUri(track.uri || track.filename || "") === selectedFolder
    );
  }, [tracks, selectedFolder, getFolderFromUri]);

  const handlePlayTrack = (uri: string, track: any) => {
    playTrack(uri, track);
    setModalVisible(false); 
  };

  const handleStopTrack = () => {
    pauseTrack();
    setSelectedTrack(null);
    setShowMiniPlayer(false);
    setModalVisible(false);
  };

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#fff", marginBottom: insets.bottom }}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={{ marginTop: 10, color: "#1DB954" }}>
            Cargando música...
          </Text>
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
          playTrack={handlePlayTrack} // Usamos el wrapper local
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
          stopTrack={handleStopTrack}
          seekToPosition={seekToPosition}
          setModalVisible={setModalVisible}
        />
      )}
    </View>
  );
}
