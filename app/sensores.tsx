import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const API_URL = "http://192.168.0.14:3000/api/sensores";

type Registro = {
  temperatura: number;
  humedad: number;
  timestamp: number;
};

export default function Sensores() {
  const [actual, setActual] = useState<Registro | null>(null);
  const [historial, setHistorial] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSensores = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data: Registro[] = await res.json();
      if (data.length > 0) {
        setActual(data[data.length - 1]);
        setHistorial(data.slice(0, -1).reverse()); // Historial en orden descendente
      } else {
        setActual(null);
        setHistorial([]);
      }
    } catch (err) {
      setActual(null);
      setHistorial([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSensores();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSensores();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Sensores ESP32</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" />
      ) : actual ? (
        <>
          <View style={styles.card}>
            <View style={styles.sensorBox}>
              <Icon name="thermometer" size={64} color="#FF7043" style={styles.iconShadow} />
              <Text style={styles.label}>Temperatura actual</Text>
              <Text style={styles.value}>{actual.temperatura} °C</Text>
            </View>
            <View style={styles.sensorBox}>
              <Icon name="water-percent" size={64} color="#42A5F5" style={styles.iconShadow} />
              <Text style={styles.label}>Humedad actual</Text>
              <Text style={styles.value}>{actual.humedad} %</Text>
            </View>
            <Text style={styles.timestamp}>
              Última lectura: {new Date(actual.timestamp).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.historialTitle}>Historial de lecturas</Text>
          {historial.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 16 }}>
              No hay historial disponible.
            </Text>
          ) : (
            historial.map((reg, idx) => (
              <View key={reg.timestamp + "-" + idx} style={styles.historialItem}>
                <Text style={styles.historialText}>
                  {new Date(reg.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.historialText}>
                  🌡️ {reg.temperatura} °C   💧 {reg.humedad} %
                </Text>
              </View>
            ))
          )}
        </>
      ) : (
        <Text style={{ color: "#888", marginTop: 32 }}>
          No se pudo obtener datos del sensor.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#222",
    textAlign: "center",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  sensorBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#1DB954",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconShadow: {
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  label: {
    fontSize: 20,
    color: "#555",
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1DB954",
    textAlign: "center",
    marginTop: 2,
    letterSpacing: 1,
  },
  timestamp: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  historialTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
  },
  historialItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
    elevation: 2,
  },
  historialText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});