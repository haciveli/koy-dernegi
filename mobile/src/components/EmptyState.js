import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { renkler } from "../theme";

export default function EmptyState({ ikon = "file-tray-outline", metin = "Henüz içerik yok" }) {
  return (
    <View style={styles.kap}>
      <Ionicons name={ikon} size={48} color={renkler.ana_300} />
      <Text style={styles.metin}>{metin}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 48,
  },
  metin: {
    color: renkler.metin_soluk,
    fontSize: 15,
    textAlign: "center",
  },
});