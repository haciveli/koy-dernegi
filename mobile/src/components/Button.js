import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { renkler, olcutler } from "../theme";

export default function Button({
  baslik,
  onPress,
  tur = "dolgu",
  ikon,
  yukleniyor = false,
  butuk = false,
  style,
}) {
  const dolgu = tur === "dolgu";
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={yukleniyor}
      style={[
        styles.buton,
        dolgu ? styles.dolgu : styles.ince,
        butuk ? styles.butuk : null,
        style,
      ]}
    >
      {yukleniyor ? (
        <ActivityIndicator color={dolgu ? "#fff" : renkler.ana_600} />
      ) : (
        <>
          {ikon ? <IconAlani ikon={ikon} dolgu={dolgu} /> : null}
          <Text style={[styles.metin, dolgu ? styles.metinDolgu : styles.metinInce]}>
            {baslik}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function IconAlani({ ikon, dolgu }) {
  return <Ionicons name={ikon} size={18} color={dolgu ? "#fff" : renkler.ana_600} />;
}

const styles = StyleSheet.create({
  buton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: olcutler.buton_radius,
  },
  dolgu: {
    backgroundColor: renkler.ana_600,
  },
  ince: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: renkler.ana_400,
  },
  butuk: {
    paddingVertical: 15,
  },
  metin: {
    fontSize: 15,
    fontWeight: "600",
  },
  metinDolgu: {
    color: "#fff",
  },
  metinInce: {
    color: renkler.ana_600,
  },
});