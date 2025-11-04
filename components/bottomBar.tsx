import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSegments } from "expo-router";

const tabs = [
  { name: "Sensores", icon: "access-point", route: "sensores" },
  { name: "Music", icon: "music", route: "music" },
  { name: "Voz", icon: "microphone", route: "voz" },
];

export default function BottomBar({ onTabPress }: { onTabPress?: (index: number) => void }) {
  const segments = useSegments();
  const [selected, setSelected] = useState(1); 

  // Actualiza el tab seleccionado cuando cambia la ruta
  useEffect(() => {
    const current = segments[0];
    const idx = tabs.findIndex(tab => tab.route === current);
    if (idx !== -1 && idx !== selected) {
      setSelected(idx);
    }
  }, [segments]);

  const handlePress = (idx: number) => {
    setSelected(idx);
    if (onTabPress) onTabPress(idx);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, idx) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tab,
            selected === idx && styles.selectedTab,
          ]}
          onPress={() => handlePress(idx)}
        >
          <Icon
            name={tab.icon}
            size={28}
            color={selected === idx ? "#fff" : "#000"}
          />
          <Text
            style={{
              color: selected === idx ? "#fff" : "#000",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
  },
  selectedTab: {
    backgroundColor: "#000",
  },
});