import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const WIT_AI_TOKEN = "XHKBL6G2NVSQ6TVTR7U35TKWAUTAY3UC";
const GEMINI_API_KEY = "AIzaSyB9fL3DKGy7bM5QJaDj7704QCwhDzf2gzM";
const ESP32_NAME = "ESP32_PLAYER";

export default function Voz() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [audioToGemini, setAudioToGemini] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<
    { from: "user" | "gemini" | "esp32"; text: string }[]
  >([]);

  const [esp32Device, setEsp32Device] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === "granted");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
   
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION 
          ]);
        } else if (Platform.Version >= 23) {
         
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
        }
      }

      buscarYConectarESP32();
    })();
    return () => {
      if (esp32Device) {
        esp32Device.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const buscarYConectarESP32 = async () => {
    setIsConnecting(true);
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        try {
          await RNBluetoothClassic.requestBluetoothEnabled();
        } catch (e) {
          addMessage("esp32", "Bluetooth desactivado. Actívalo manualmente.");
          setIsConnecting(false);
          return;
        }
      }

      // Buscar dispositivos vinculados
      const devices = await RNBluetoothClassic.getBondedDevices();
      const esp32 = devices.find((d) => d.name === ESP32_NAME);

      if (esp32) {
        addMessage("esp32", `Encontrado ${ESP32_NAME}, conectando Serial...`);
        const connectedDevice = await RNBluetoothClassic.connectToDevice(
          esp32.address
        );

        if (connectedDevice) {
          setEsp32Device(connectedDevice);
          addMessage(
            "esp32",
            "Conectado a Comandos. Asegúrate que el Audio también esté conectado en Ajustes."
          );
        }
      } else {
        addMessage("esp32", "No se encontró ESP32_PLAYER vinculado.");
      }
    } catch (err: any) {
      addMessage("esp32", "Error conexión: " + err?.message);
      setEsp32Device(null);
    }
    setIsConnecting(false);
  };

  const enviarComandoESP32 = async (comando: string) => {
    if (!esp32Device) {
      addMessage("esp32", "No conectado. Reconectando...");
      await buscarYConectarESP32();
      return;
    }

    try {
      const isConnected = await esp32Device.isConnected();
      if (!isConnected) {
        addMessage("esp32", "Conexión perdida. Reconectando...");
        setEsp32Device(null);
        await buscarYConectarESP32();
        return;
      }

      await esp32Device.write(comando + "\n");
    } catch (err: any) {
      addMessage("esp32", "Error envío: " + err?.message);
    }
  };

  function detectarComandoMusica(texto: string) {
    const t = texto.toLowerCase();
    if (t.match(/(siguiente|next|adelanta|pasa)/)) return "next";
    if (t.match(/(anterior|previo|retrocede|atrás)/)) return "prev";
    if (t.match(/(pausa|detén|stop|silencio|apaga|quieto)/)) return "pause";
    if (t.match(/(reproduce|play|inicio|continúa|toca|pon)/)) return "play";
    if (t.match(/(sube|más|aumenta).*(volumen)/) || t.includes("subir volumen"))
      return "vol+";
    if (
      t.match(/(baja|menos|reduce).*(volumen)/) ||
      t.includes("bajar volumen")
    )
      return "vol-";
    return null;
  }

  const handleComandoVoz = async (texto: string) => {
    const comando = detectarComandoMusica(texto);

    if (comando) {
      await enviarComandoESP32(comando);
      const confirmacion = `Comando ejecutado: ${comando}`;
      addMessage("esp32", confirmacion);
    } else {
      const errorMsg = `Entendí "${texto}", pero no es un comando de música. Intenta: Play, Pausa, Siguiente...`;
      addMessage("esp32", errorMsg);
      Speech.speak(errorMsg, { language: "es-ES" });
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const startRecording = async (forGemini = false) => {
    stopSpeaking();
    setAudioToGemini(forGemini);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === "granted");
      if (status !== "granted") return;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err: any) {
      addMessage("gemini", "Error REC: " + err?.message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setLoading(true);
    try {
      if (!recording) {
        setLoading(false);
        setAudioToGemini(false);
        return;
      }

      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) return;

      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any);
      
      const backendResponse = await fetch("http://192.168.0.14:3000/convert", {
        method: "POST",
        body: formData,
      });

      if (!backendResponse.ok) throw new Error("Backend offline");

      const wavBlob = await backendResponse.blob();

      const witResponse = await fetch("https://api.wit.ai/speech?v=20230220", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WIT_AI_TOKEN}`,
          "Content-Type": "audio/wav",
        },
        body: wavBlob,
      });

      if (!witResponse.ok) throw new Error("Wit.ai error");

      const raw = await witResponse.text();
      const matches = raw.match(/\{[\s\S]*?\}/g);

      let finalText = null;
      let bestPartial = null;

      if (matches) {
        for (const m of matches) {
          try {
            const obj = JSON.parse(m);
            if (obj.text?.trim()) bestPartial = obj.text.trim();
            if (obj.is_final && obj.text?.trim()) finalText = obj.text.trim();
          } catch (_) {}
        }
      }

      const respuesta = finalText || bestPartial;

      if (!respuesta) {
        const msgError = "No te escuché bien. ¿Puedes repetir?";
        addMessage(audioToGemini ? "gemini" : "esp32", msgError);
        Speech.speak(msgError, { language: "es-ES" });
      } else {
        addMessage(audioToGemini ? "user" : "gemini", respuesta);

        if (audioToGemini) {
          await sendToGemini(respuesta);
        } else {
          await handleComandoVoz(respuesta);
        }
      }

      setAudioToGemini(false);
    } catch (err: any) {
      addMessage("gemini", "Error: " + err?.message);
      setAudioToGemini(false);
    }
    setLoading(false);
  };

  const sendToGemini = async (input?: string) => {
    const textToSend = input ?? chatInput;
    if (!textToSend.trim()) return;

    if (!input) {
      addMessage("user", textToSend);
      setChatInput("");
    }

    setLoading(true);
    try {
      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: textToSend }] }],
          }),
        }
      );

      if (!geminiResponse.ok) throw new Error("Gemini API Error");

      const data = await geminiResponse.json();
      const respuesta =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";

      setIsSpeaking(true);
      Speech.speak(respuesta, {
        language: "es-ES",
        voice: "es-es-x-eef-local",
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      addMessage("gemini", respuesta);
    } catch (err: any) {
      addMessage("gemini", "Error IA: " + err?.message);
    }
    setLoading(false);
  };

  const addMessage = (from: "user" | "gemini" | "esp32", text: string) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <View style={styles.chatSection}>
        <Text style={styles.title}>Jefry Chat</Text>
        <ScrollView
          style={styles.historyScroll}
          contentContainerStyle={styles.historyContent}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.messageBox,
                msg.from === "user"
                  ? { backgroundColor: "#fff", alignSelf: "flex-end" }
                  : { backgroundColor: "#e3f2fd", alignSelf: "flex-start" },
              ]}
            >
              <Text
                style={[
                  styles.resultLabel,
                  { color: msg.from === "user" ? "#1DB954" : "#4285F4" },
                ]}
              >
                {msg.from === "user"
                  ? "Tú:"
                  : msg.from === "esp32"
                    ? "Sistema:"
                    : "Jefry:"}
              </Text>
              <Text style={styles.resultText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputChat}
            placeholder="Escribe o habla..."
            placeholderTextColor="#888"
            value={chatInput}
            onChangeText={setChatInput}
            editable={!loading && !isRecording && !isSpeaking}
          />
          {isSpeaking ? (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: "#FF7043" }]}
              onPress={stopSpeaking}
            >
              <Icon name="pause" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendToGemini()}
              disabled={loading || isRecording}
            >
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: "#4285F4", marginLeft: 8 },
            ]}
            onPress={isRecording ? stopRecording : () => startRecording(true)}
            disabled={micPermission === false || loading || isSpeaking}
          >
            <Icon
              name={
                isRecording && audioToGemini ? "microphone-off" : "microphone"
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: "#FF7043", marginLeft: 8 },
            ]}
            onPress={isRecording ? stopRecording : () => startRecording(false)}
            disabled={micPermission === false || loading || isSpeaking}
          >
            <Icon
              name={
                isRecording && !audioToGemini
                  ? "microphone-off"
                  : "music-note-bluetooth"
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text
            style={{
              color: esp32Device ? "#1DB954" : "#FF7043",
              fontWeight: "bold",
            }}
          >
            {esp32Device
              ? "ESP32 Conectado (Comandos)"
              : isConnecting
                ? "Conectando..."
                : "Desconectado"}
          </Text>
        </View>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1DB954"
          style={{ marginTop: 24 }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
    textAlign: "center",
  },
  chatSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 0,
    padding: 24,
    elevation: 0,
    width: "100%",
    justifyContent: "flex-start",
  },
  historyScroll: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#faf9f9ff",
    borderColor: "#d3d3d3ff",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    minHeight: 120,
    maxHeight: "80%",
  },
  historyContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
    maxWidth: "90%",
  },
  resultLabel: {
    fontSize: 14,
    color: "#4285F4",
    marginBottom: 4,
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 16,
    color: "#222",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
    marginBottom: 4,
  },
  inputChat: {
    flex: 1,
    backgroundColor: "#dad9d9ff",
    color: "#000000ff",
    borderColor: "#d3d3d3ff",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});