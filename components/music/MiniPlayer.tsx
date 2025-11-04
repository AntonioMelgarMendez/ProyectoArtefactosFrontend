import React from "react";
import { View, TouchableOpacity, Text, Image, Dimensions, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

export default function MiniPlayer({
  selectedTrack,
  status,
  pauseTrack,
  resumeTrack,
  nextTrack,
  prevTrack,
  stopTrack,
  seekToPosition,
  setModalVisible,
}: any) {
  const percent = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.playerBar}>
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        {selectedTrack.artwork ? (
          <Image
            source={{ uri: selectedTrack.artwork }}
            style={styles.playerCover}
            resizeMode="cover"
          />
        ) : (
          <Icon name="music" size={48} color="#fff" style={styles.playerCover} />
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }} numberOfLines={1}>
            {selectedTrack.title || selectedTrack.filename || selectedTrack.name}
          </Text>
          <Text style={{ color: "#eee", fontSize: 12 }} numberOfLines={1}>
            {selectedTrack.artist || ""}
          </Text>
        </View>
        <TouchableOpacity onPress={prevTrack}>
          <Icon name="skip-previous" size={32} color="#fff" />
        </TouchableOpacity>
        {status.playing ? (
          <TouchableOpacity onPress={pauseTrack}>
            <Icon name="pause-circle" size={40} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={resumeTrack}>
            <Icon name="play-circle" size={40} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={nextTrack}>
          <Icon name="skip-next" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={stopTrack}>
          <Icon name="close" size={32} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.playerProgressBg}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={(e) => {
            const x = e.nativeEvent.locationX;
            const barWidth = width - 32;
            const p = Math.min(Math.max(x / barWidth, 0), 1);
            seekToPosition(p);
          }}
        >
          <View style={[styles.playerProgress, { width: `${percent * 100}%` }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 80,
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 16,
    flexDirection: "column",
    elevation: 8,
    alignItems: "center",
    zIndex: 20,
  },
  playerCover: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1DB954",
  },
  playerProgressBg: {
    width: "100%",
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  playerProgress: { height: 4, backgroundColor: "#222", borderRadius: 2 },
});