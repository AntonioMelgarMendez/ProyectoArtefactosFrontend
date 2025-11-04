import { Slot, useRouter, useSegments } from "expo-router";
import BottomBar from "../components/bottomBar";
import { View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import { MusicProvider } from "../context/MusicContext";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (segments.length === 0 || segments[0] === "")) {
      router.replace("music");
    }
  }, [mounted, segments]);

  React.useEffect(() => {
    SystemUI.setBackgroundColorAsync("#fff");
  }, []);

  const handleTabPress = (index: number) => {
    if (index === 0) router.push("sensores");
    if (index === 1) router.push("music");
    if (index === 2) router.push("voz");
  };

  return (
    <MusicProvider>
      <View
        style={{ flex: 1, marginBottom: insets.bottom, marginTop: insets.top }}
      >
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <Slot screenOptions={{ headerShown: false }} />
        <BottomBar onTabPress={handleTabPress} />
      </View>
    </MusicProvider>
  );
}
