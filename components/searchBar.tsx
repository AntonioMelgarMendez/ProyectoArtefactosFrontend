import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function SearchBar({ value, onChangeText, placeholder, disabled }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Buscar..."}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
  },
  input: {
    height: 40,
    fontSize: 16,
  },
});