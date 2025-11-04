import { Audio } from "expo-audio";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const WIT_AI_TOKEN = "XHKBL6G2NVSQ6TVTR7U35TKWAUTAY3UC";

export default function Voz() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.getPermissionsAsync();
      setMicPermission(status === "granted");
    })();
  }, []);

  const startRecording = async () => {
    setResult("");
    setLoading(false);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === "granted");
      if (status !== "granted") {
        setResult("Permiso de micrófono denegado");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err: any) {
      setResult("Error al iniciar grabación: " + err?.message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setLoading(true);
    try {
      if (!recording) {
        setResult("No hay grabación activa");
        setLoading(false);
        return;
      }
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        // Obtén el audio grabado como blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Envía el audio a Wit.ai directamente en formato m4a
        const witResponse = await fetch("https://api.wit.ai/speech?v=20230220", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WIT_AI_TOKEN}`,
            "Content-Type": "audio/m4a",
          },
          body: blob,
        });

        if (!witResponse.ok) {
          const errorText = await witResponse.text();
          setResult("Error Wit.ai: " + errorText);
          setLoading(false);
          return;
        }

        const json = await witResponse.json();
        const respuesta = json.text || "No se reconoció la voz";
        setResult(respuesta);

        // Reproduce la respuesta con TTS
        Speech.speak(respuesta, { language: "es-ES" });
      } else {
        setResult("No se obtuvo el archivo de audio");
      }
    } catch (err: any) {
      setResult("Error al procesar el audio: " + err?.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reconocimiento de voz</Text>
      {micPermission === false && (
        <Text style={{ color: "#FF7043", marginBottom: 16 }}>
          El permiso de micrófono está denegado. Actívalo en ajustes.
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={micPermission === false}
      >
        <Icon name={isRecording ? "microphone-off" : "microphone"} size={64} color="#fff" />
        <Text style={styles.buttonText}>
          {isRecording ? "Detener y enviar" : "Presiona para grabar"}
        </Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 24 }} />}
      {result !== "" && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Reconocido / Error:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffff",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#222",
  },
  button: {
    backgroundColor: "#1DB954",
    borderRadius: 100,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    marginBottom: 24,
  },
  buttonActive: {
    backgroundColor: "#FF7043",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 12,
    fontWeight: "bold",
  },
  resultBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    elevation: 4,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  resultText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
});