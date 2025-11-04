import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Puedes dejar el ESP32_URL para luego, pero ahora usaremos datos quemados
// const ESP32_URL = "http://192.168.1.100/sensor"; 

export default function Sensores() {
  // Datos quemados para mostrar los sensores
  const [data, setData] = useState<{ temperature: number; humidity: number } | null>({
    temperature: 24.5,
    humidity: 55,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Puedes dejar la función fetchData para cuando conectes el ESP32
  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(ESP32_URL);
  //     const json = await response.json();
  //     setData({
  //       temperature: json.temperature,
  //       humidity: json.humidity,
  //     });
  //   } catch (e) {
  //     setData(null);
  //   }
  //   setLoading(false);
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Aquí podrías llamar a fetchData en el futuro
    setTimeout(() => setRefreshing(false), 1000);
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
      ) : data ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Icon name="thermometer" size={48} color="#FF7043" />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.label}>Temperatura</Text>
              <Text style={styles.value}>{data.temperature} °C</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Icon name="water-percent" size={48} color="#42A5F5" />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.label}>Humedad</Text>
              <Text style={styles.value}>{data.humidity} %</Text>
            </View>
          </View>
        </View>
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
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    color: "#555",
    marginBottom: 4,
    textAlign: "center",
  },
  value: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1DB954",
    textAlign: "center",
  },
});