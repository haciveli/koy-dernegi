import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { renkler } from "../theme";

export default function PageHeader({ baslik, altBaslik }) {
  return (
    <View style={styles.kap}>
      <Text style={styles.baslik}>{baslik}</Text>
      {altBaslik ? <Text style={styles.altBaslik}>{altBaslik}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    backgroundColor: renkler.ana_600,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  baslik: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  altBaslik: {
    color: renkler.ana_100,
    fontSize: 13,
    marginTop: 4,
  },
});