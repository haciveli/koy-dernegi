import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { renkler } from "../theme";

export default function LoadingView({ metin = "Yükleniyor..." }) {
  return (
    <View style={styles.kap}>
      <ActivityIndicator size="large" color={renkler.ana_600} />
      <Text style={styles.metin}>{metin}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  metin: {
    color: renkler.metin_soluk,
    fontSize: 14,
  },
});