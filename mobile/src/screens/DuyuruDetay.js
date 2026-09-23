import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { duyuruDetay } from "../api";
import { tarihFormatla } from "../config";
import Badge from "../components/Badge";
import LoadingView from "../components/LoadingView";
import { renkler } from "../theme";

export default function DuyuruDetay({ route }) {
  const ilk = route.params?.duyuru;
  const [duyuru, setDuyuru] = React.useState(ilk);
  const [yukleniyor, setYukleniyor] = React.useState(!ilk);

  React.useEffect(() => {
    if (ilk) return;
    duyuruDetay(route.params?.id)
      .then(setDuyuru)
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, [ilk, route.params?.id]);

  if (yukleniyor || !duyuru) return <LoadingView metin="Duyuru yükleniyor..." />;

  return (
    <ScrollView style={styles.kap} contentContainerStyle={styles.icerik}>
      <View style={styles.ust}>
        <Badge metin={duyuru.kategori || "Genel"} renk={renkler.ana_500} />
        <Text style={styles.tarih}>{tarihFormatla(duyuru.olusturulma_tarihi)}</Text>
      </View>
      <Text style={styles.baslik}>{duyuru.baslik}</Text>
      <View style={styles.ayrac} />
      <Text style={styles.icerikMetin}>{duyuru.icerik}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 20, paddingBottom: 40 },
  ust: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tarih: { fontSize: 13, color: renkler.metin_soluk },
  baslik: {
    fontSize: 24,
    fontWeight: "800",
    color: renkler.metin,
    marginTop: 14,
    lineHeight: 30,
  },
  ayrac: {
    height: 3,
    width: 48,
    backgroundColor: renkler.vurgu_500,
    borderRadius: 999,
    marginVertical: 16,
  },
  icerikMetin: {
    fontSize: 15,
    lineHeight: 24,
    color: renkler.metin,
  },
});