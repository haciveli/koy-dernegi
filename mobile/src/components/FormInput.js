import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { renkler, olcutler } from "../theme";

export default function FormInput({
  label,
  ikon,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  ...degerler
}) {
  return (
    <View style={styles.kap}>
      {label ? <Text style={styles.etiket}>{label}</Text> : null}
      <View style={[styles.satir, error ? styles.satirHata : null]}>
        {ikon ? (
          <View style={styles.ikonKap}>
            <Ionicons name={ikon} size={20} color={renkler.ana_600} />
          </View>
        ) : null}
        <TextInput
          style={styles.girdi}
          placeholderTextColor={renkler.metin_soluk}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "sentences"}
          {...degerler}
        />
      </View>
      {error ? <Text style={styles.hata}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    gap: 6,
    marginBottom: 14,
  },
  etiket: {
    fontSize: 13,
    fontWeight: "600",
    color: renkler.metin,
  },
  satir: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
    borderRadius: olcutler.buton_radius,
  },
  satirHata: {
    borderColor: renkler.tehlikeli,
  },
  ikonKap: {
    paddingLeft: 12,
  },
  girdi: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: renkler.metin,
  },
  hata: {
    color: renkler.tehlikeli,
    fontSize: 12,
  },
});