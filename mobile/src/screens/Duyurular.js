import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { duyurular } from "../api";
import { tarihFormatla } from "../config";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

const KATEGORILER = ["Tümü", "Genel", "Etkinlik", "Yardımlaşma", "Eğitim", "Burs", "Önemli"];

export default function Duyurular({ navigation }) {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtre, setFiltre] = useState("Tümü");

  useFocusEffect(
    useCallback(() => {
      let gecerli = true;
      duyurular()
        .then((list) => {
          if (gecerli) setVeriler(Array.isArray(list) ? list : []);
        })
        .catch(() => {})
        .finally(() => gecerli && setYukleniyor(false));
      return () => {
        gecerli = false;
      };
    }, [])
  );

  const filtreliler = filtre === "Tümü" ? veriler : veriler.filter((d) => d.kategori === filtre);

  if (yukleniyor) return <LoadingView metin="Duyurular yükleniyor..." />;

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Duyurular" altBaslik="Derneğimizden tüm güncel haberler" />
      <FlatList
        ListHeaderComponent={
          <View style={styles.filtreler}>
            {KATEGORILER.map((kategori) => {
              const aktif = kategori === filtre;
              return (
                <TouchableOpacity
                  key={kategori}
                  style={[styles.filtre, aktif && styles.filtreAktif]}
                  onPress={() => setFiltre(kategori)}
                >
                  <Text style={[styles.filtreMetin, aktif && styles.filtreMetinAktif]}>
                    {kategori}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        }
        data={filtreliler}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={renkler.ana_600}
            onRefresh={() => {
              duyurular()
                .then((list) => setVeriler(Array.isArray(list) ? list : []))
                .catch(() => {});
            }}
          />
        }
        ListEmptyComponent={<EmptyState ikon="megaphone-outline" metin="Bu kategoride duyuru bulunamadı." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.kart}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("DuyuruDetay", { duyuru: item })}
          >
            <View style={styles.kartUst}>
              <Badge metin={item.kategori || "Genel"} renk={renkler.ana_500} />
              <Text style={styles.tarih}>{tarihFormatla(item.olusturulma_tarihi)}</Text>
            </View>
            <Text style={styles.baslik}>{item.baslik}</Text>
            <Text style={styles.ozet} numberOfLines={3}>
              {item.icerik}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  liste: { padding: 16, paddingBottom: 32 },
  filtreler: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filtre: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  filtreAktif: {
    backgroundColor: renkler.ana_600,
    borderColor: renkler.ana_600,
  },
  filtreMetin: { fontSize: 13, fontWeight: "600", color: renkler.metin_soluk },
  filtreMetinAktif: { color: "#fff" },
  kart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 16,
    gap: 8,
    marginBottom: 12,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kartUst: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tarih: { fontSize: 12, color: renkler.metin_soluk },
  baslik: { fontSize: 17, fontWeight: "700", color: renkler.metin },
  ozet: { fontSize: 14, color: renkler.metin_soluk, lineHeight: 20 },
});