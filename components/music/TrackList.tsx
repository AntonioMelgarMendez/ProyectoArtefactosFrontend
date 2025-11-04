import React, { useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function TrackCover({ artwork }: { artwork: string }) {
  const [error, setError] = useState(false);

  if (
    !artwork ||
    typeof artwork !== "string" ||
    artwork.trim() === "" ||
    error
  ) {
    return (
      <Icon
        name="music"
        size={40}
        color="#1DB954"
        style={styles.coverIcon}
      />
    );
  }

  return (
    <Image
      source={{ uri: artwork }}
      style={styles.cover}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

export default function TrackList({
  tracks,
  selectedTrack,
  playTrack,
  formatTime,
  onBack,
  folderName,
}: any) {
  return (
    <>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Icon name="arrow-left" size={28} color="#1DB954" />
        <Text style={{ color: "#1DB954", marginLeft: 8 }}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.folderTitle}>{folderName}</Text>
      {tracks.length > 0 ? (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id || item.uri}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => playTrack(item.uri, item)}
              style={[
                styles.trackItem,
                selectedTrack?.id === item.id ? styles.selectedTrack : null,
              ]}
            >
              <View style={styles.coverContainer}>
                <TrackCover artwork={item.artwork} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: selectedTrack?.id === item.id ? "#1DB954" : "#222",
                  }}
                  numberOfLines={1}
                >
                  {item.title || item.filename || item.name}
                </Text>
                <Text style={{ color: "#555" }}>
                  {item.duration && item.duration > 0
                    ? formatTime(item.duration)
                    : "--:--"}
                </Text>
                <Text style={{ color: "#888", fontSize: 12 }}>
                  {item.artist || ""}
                </Text>
              </View>
              {selectedTrack?.id === item.id && (
                <Icon name="equalizer" size={28} color="#1DB954" />
              )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={{ textAlign: "center" }}>
          No se encontraron canciones en esta carpeta.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  folderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#1DB954",
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  selectedTrack: {
    backgroundColor: "#E6F4FE",
    borderColor: "#1DB954",
    borderWidth: 1,
  },
  coverContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  coverIcon: {
    width: 48,
    height: 48,
    textAlign: "center",
    textAlignVertical: "center",
  },
});