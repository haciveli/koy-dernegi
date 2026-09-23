import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { renkler } from "../theme";

export default function Badge({ metin, renk = renkler.ana_500 }) {
  return (
    <View style={[styles.kap, { backgroundColor: renk }]}>
      <Text style={styles.metin}>{metin}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metin: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});