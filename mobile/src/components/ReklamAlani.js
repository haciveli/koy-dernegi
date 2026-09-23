import React, { useEffect, useState } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { reklamlar } from "../api";
import { resimUrl } from "../config";
import { renkler, olcutler } from "../theme";

export default function ReklamAlani({ konum = "ana_sayfa" }) {
  const [listeler, setListeler] = useState([]);

  useEffect(() => {
    let aktif = true;
    reklamlar(konum)
      .then((veri) => {
        if (aktif) setListeler(Array.isArray(veri) ? veri : []);
      })
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, [konum]);

  if (!listeler.length) return null;

  return (
    <View style={styles.kap}>
      {listeler.map((reklam) => (
        <TouchableOpacity
          key={reklam.id}
          style={styles.kart}
          activeOpacity={0.9}
          onPress={() => reklam.link_url && Linking.openURL(reklam.link_url).catch(() => {})}
        >
          {reklam.resim_url ? (
            <Image
              source={{ uri: resimUrl(reklam.resim_url) }}
              style={styles.gorsel}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gorselYedek}>
              <Ionicons name="megaphone" size={28} color={renkler.vurgu_500} />
            </View>
          )}
          <View style={styles.yaziKap}>
            <Text style={styles.baslik}>{reklam.baslik}</Text>
            {reklam.aciklama ? (
              <Text style={styles.aciklama} numberOfLines={2}>
                {reklam.aciklama}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { gap: 12, marginVertical: 8 },
  kart: {
    flexDirection: "row",
    backgroundColor: renkler.vurgu_100,
    borderRadius: olcutler.kart_radius,
    padding: 12,
    gap: 12,
    alignItems: "center",
  },
  gorsel: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: renkler.ana_100,
  },
  gorselYedek: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: renkler.vurgu_100,
    alignItems: "center",
    justifyContent: "center",
  },
  yaziKap: { flex: 1, gap: 2 },
  baslik: {
    fontSize: 14,
    fontWeight: "700",
    color: renkler.metin,
  },
  aciklama: {
    fontSize: 12,
    color: renkler.metin_soluk,
  },
});