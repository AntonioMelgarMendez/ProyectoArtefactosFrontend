import React from "react";
import { FlatList, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function FolderList({ folders, tracks, getFolderFromUri, onSelectFolder }: any) {
  return folders.length > 0 ? (
    <FlatList
      data={folders}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.folderItem} onPress={() => onSelectFolder(item)}>
          <Icon name="folder-music" size={40} color="#1DB954" />
          <Text style={styles.folderName}>{item}</Text>
          <Text style={styles.folderCount}>
            {tracks.filter(
              (track: any) =>
                getFolderFromUri(track.uri || track.filename || "") === item
            ).length} canciones
          </Text>
        </TouchableOpacity>
      )}
    />
  ) : (
    <Text style={{ textAlign: "center" }}>No se encontraron carpetas de música.</Text>
  );
}

const styles = StyleSheet.create({
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  folderName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    flex: 1,
    color: "#222",
  },
  folderCount: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
});