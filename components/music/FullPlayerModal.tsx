import React from "react";
import { View, TouchableOpacity, Text, Image, Dimensions, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

export default function FullPlayerModal({
  selectedTrack,
  status,
  formatTime,
  seekToPosition,
  pauseTrack,
  resumeTrack,
  nextTrack,
  prevTrack,
  setModalVisible,
}: any) {
  const percent = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.fullModalContainer}>
      <TouchableOpacity style={styles.fullBackBtn} onPress={() => setModalVisible(false)}>
        <Icon name="arrow-left" size={32} color="#222" />
      </TouchableOpacity>
      <View style={styles.fullModalContent}>
        {selectedTrack?.artwork ? (
          <Image
            source={{ uri: selectedTrack.artwork }}
            style={styles.fullModalCover}
            resizeMode="cover"
          />
        ) : (
          <Icon name="music" size={180} color="#1DB954" style={styles.fullModalCover} />
        )}
        <Text style={styles.fullTitle}>
          {selectedTrack?.title || selectedTrack?.filename || selectedTrack?.name}
        </Text>
        <Text style={styles.fullArtist}>{selectedTrack?.artist || ""}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressTime}>{formatTime(status.currentTime)}</Text>
          <TouchableOpacity
            style={styles.progressBarBg}
            activeOpacity={1}
            onPress={(e) => {
              const x = e.nativeEvent.locationX;
              const barWidth = width * 0.5;
              const p = Math.min(Math.max(x / barWidth, 0), 1);
              seekToPosition(p);
            }}
          >
            <View style={[styles.progressBar, { width: `${percent * 100}%` }]} />
          </TouchableOpacity>
          <Text style={styles.progressTime}>{formatTime(status.duration)}</Text>
        </View>
        <View style={styles.fullModalControls}>
          <TouchableOpacity onPress={prevTrack} style={styles.controlBtn}>
            <Icon name="skip-previous" size={48} color="#222" />
          </TouchableOpacity>
          {status.playing ? (
            <TouchableOpacity onPress={pauseTrack} style={styles.controlBtn}>
              <Icon name="pause-circle" size={64} color="#1DB954" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={resumeTrack} style={styles.controlBtn}>
              <Icon name="play-circle" size={64} color="#1DB954" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={nextTrack} style={styles.controlBtn}>
            <Icon name="skip-next" size={48} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullModalContainer: { flex: 1, backgroundColor: "#fff", paddingTop: 32 },
  fullBackBtn: { position: "absolute", top: 32, left: 24, zIndex: 10 },
  fullModalContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  fullModalCover: {
    width: 240,
    height: 240,
    borderRadius: 24,
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  fullTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 24,
    textAlign: "center",
  },
  fullArtist: {
    color: "#888",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 32,
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: "hidden",
    maxWidth: width * 0.5,
  },
  progressBar: { height: 10, backgroundColor: "#1DB954", borderRadius: 5 },
  progressTime: { fontSize: 14, color: "#888", width: 48, textAlign: "center" },
  fullModalControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  controlBtn: { marginHorizontal: 16 },
});