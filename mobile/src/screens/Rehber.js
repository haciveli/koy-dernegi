import React, { useCallback, useState } from "react";
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { rehber } from "../api";
import PageHeader from "../components/PageHeader";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

const KATEGORILER = ["Tümü", "Kafe", "Fırın", "Bakkal", "Tarım", "Esnaf", "Sağlık", "Diğer"];

export default function Rehber() {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliKategori, setSeciliKategori] = useState("Tümü");

  const veriCek = useCallback(() => {
    rehber()
      .then((list) => setVeriler(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  if (yukleniyor) return <LoadingView metin="Rehber yükleniyor..." />;

  const goruntulenen =
    seciliKategori === "Tümü"
      ? veriler
      : veriler.filter((r) => r.kategori === seciliKategori);

  const ara = (telefon) => {
    if (telefon) Linking.openURL(`tel:${telefon.replace(/[^0-9+]/g, "")}`).catch(() => {});
  };

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Köy Rehberi" altBaslik="Köyümüzün işletmeleri ve hizmetleri" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kategoriBar}
        contentContainerStyle={styles.kategoriKap}
        data={KATEGORILER}
        keyExtractor={(k) => k}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.kategoriChip, seciliKategori === item ? styles.kategoriChipAktif : null]}
            onPress={() => setSeciliKategori(item)}
          >
            <Text
              style={[styles.kategoriMetin, seciliKategori === item ? styles.kategoriMetinAktif : null]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={goruntulenen}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={<EmptyState ikon="storefront-outline" metin="Rehberde kayıt bulunamadı." />}
        renderItem={({ item }) => (
          <View style={styles.kart}>
            <View style={styles.kartUst}>
              <Text style={styles.baslik}>{item.ad}</Text>
              <View style={styles.rozet}>
                <Text style={styles.rozetMetin}>{item.kategori || "Genel"}</Text>
              </View>
            </View>
            {item.aciklama ? <Text style={styles.aciklama}>{item.aciklama}</Text> : null}
            <View style={styles.ileri}>
              {item.adres ? (
                <View style={styles.meta}>
                  <Ionicons name="location-outline" size={15} color={renkler.metin_soluk} />
                  <Text style={styles.metaMetin}>{item.adres}</Text>
                </View>
              ) : null}
              {item.telefon ? (
                <TouchableOpacity style={styles.arama} onPress={() => ara(item.telefon)}>
                  <Ionicons name="call-outline" size={15} color={renkler.ana_100} />
                  <Text style={styles.aramaMetin}>{item.telefon}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  kategoriBar: { flexGrow: 0 },
  kategoriKap: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  kategoriChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  kategoriChipAktif: { backgroundColor: renkler.ana_600, borderColor: renkler.ana_600 },
  kategoriMetin: { fontSize: 13, fontWeight: "600", color: renkler.metin_soluk },
  kategoriMetinAktif: { color: "#fff" },
  liste: { padding: 16, paddingBottom: 32, gap: 10 },
  kart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 8,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kartUst: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  baslik: { fontSize: 16, fontWeight: "700", color: renkler.metin, flex: 1 },
  rozet: {
    backgroundColor: renkler.ana_100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rozetMetin: { fontSize: 12, fontWeight: "600", color: renkler.ana_700 },
  aciklama: { fontSize: 14, color: renkler.metin_soluk, lineHeight: 20 },
  ileri: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaMetin: { fontSize: 13, color: renkler.metin_soluk, flexShrink: 1 },
  arama: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: renkler.ana_600,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aramaMetin: { fontSize: 13, fontWeight: "600", color: "#fff" },
});