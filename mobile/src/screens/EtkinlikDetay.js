import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { etkinlikDetay, etkinligeKayit } from "../api";
import { tarihSaatFormatla } from "../config";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import LoadingView from "../components/LoadingView";
import { renkler, olcutler } from "../theme";

export default function EtkinlikDetay({ route }) {
  const ilk = route.params?.etkinlik;
  const { token } = useAuth();
  const [etkinlik, setEtkinlik] = React.useState(ilk);
  const [yukleniyor, setYukleniyor] = React.useState(!ilk);
  const [kaydediyor, setKaydediyor] = React.useState(false);
  const [kayitli, setKayitli] = React.useState(false);

  React.useEffect(() => {
    if (ilk) return;
    etkinlikDetay(route.params?.id)
      .then(setEtkinlik)
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, [ilk, route.params?.id]);

  if (yukleniyor || !etkinlik) return <LoadingView metin="Etkinlik yükleniyor..." />;

  const tarih = new Date(etkinlik.tarih);
  const simdi = new Date();
  const gecti = tarih < simdi;
  const dolu = etkinlik.kayitli >= etkinlik.kontenjan;
  const yuzde = Math.min(100, Math.round((etkinlik.kayitli / etkinlik.kontenjan) * 100));

  const kayitOl = async () => {
    if (!token) {
      Alert.alert("Giriş gerekli", "Etkinliğe kayıt olmak için üye girişi yapmalısınız.");
      return;
    }
    setKaydediyor(true);
    try {
      await etkinligeKayit(etkinlik.id);
      setKayitli(true);
      const guncel = await etkinlikDetay(etkinlik.id);
      setEtkinlik(guncel);
      Alert.alert("Başarılı", "Etkinliğe kaydınız alındı.");
    } catch (hata) {
      Alert.alert("İşlem başarısız", hata.message || "Kayıt yapılamadı.");
    } finally {
      setKaydediyor(false);
    }
  };

  return (
    <ScrollView style={styles.kap} contentContainerStyle={styles.icerik}>
      <View style={styles.tarihBanner}>
        <Text style={styles.tarihGun}>{tarih.getDate()}</Text>
        <Text style={styles.tarihAy}>{tarih.toLocaleDateString("tr-TR", { month: "long" })}</Text>
        <Text style={styles.tarihYil}>{tarih.getFullYear()}</Text>
      </View>

      <Text style={styles.baslik}>{etkinlik.baslik}</Text>

      <View style={styles.bilgiKutusu}>
        <BilgiSatir ikon="calendar-outline" metin={tarihSaatFormatla(etkinlik.tarih)} />
        <BilgiSatir ikon="location-outline" metin={etkinlik.yer} />
      </View>

      <View style={styles.kontenjanKap}>
        <View style={styles.kontenjanUst}>
          <Text style={styles.kontenjanBaslik}>Kontenjan Durumu</Text>
          <Text style={styles.kontenjanSayi}>
            {etkinlik.kayitli}/{etkinlik.kontenjan} kişi
          </Text>
        </View>
        <View style={styles.kontenjanCubugu}>
          <View
            style={[
              styles.kontenjanDort,
              { width: `${yuzde}%`, backgroundColor: dolu ? renkler.tehlikeli : renkler.ana_500 },
            ]}
          />
        </View>
        {dolu ? <Text style={styles.doluMetin}>Kontenjan doldu.</Text> : null}
      </View>

      <View style={styles.aciklamaKap}>
        <Text style={styles.bolumBaslik}>Etkinlik Detayı</Text>
        <Text style={styles.aciklama}>{etkinlik.aciklama}</Text>
      </View>

      {gecti ? (
        <View style={styles.gectiKutu}>
          <Text style={styles.gectiMetin}>Bu etkinlik tarihi geçmiştir.</Text>
        </View>
      ) : (
        <Button
          baslik={kayitli ? "Kaydınız Alındı" : dolu ? "Kontenjan Dolu" : "Etkinliğe Kayıt Ol"}
          onPress={kayitOl}
          yukleniyor={kaydediyor}
          butuk
          ikon={kayitli ? "checkmark-circle-outline" : "person-add-outline"}
          style={kayitli ? styles.kayitliButon : null}
        />
      )}
    </ScrollView>
  );
}

function BilgiSatir({ ikon, metin }) {
  return (
    <View style={styles.bilgiSatir}>
      <Ionicons name={ikon} size={18} color={renkler.ana_600} />
      <Text style={styles.bilgiMetin}>{metin}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 20, paddingBottom: 40 },
  tarihBanner: {
    alignSelf: "flex-start",
    backgroundColor: renkler.ana_600,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  tarihGun: { color: "#fff", fontSize: 26, fontWeight: "800" },
  tarihAy: { color: renkler.vurgu_300, fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  tarihYil: { color: renkler.ana_100, fontSize: 11 },
  baslik: { fontSize: 24, fontWeight: "800", color: renkler.metin, marginTop: 16, lineHeight: 30 },
  bilgiKutusu: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  bilgiSatir: { flexDirection: "row", alignItems: "center", gap: 10 },
  bilgiMetin: { fontSize: 15, color: renkler.metin },
  kontenjanKap: { marginTop: 20, gap: 8 },
  kontenjanUst: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kontenjanBaslik: { fontSize: 15, fontWeight: "700", color: renkler.metin },
  kontenjanSayi: { fontSize: 13, color: renkler.metin_soluk },
  kontenjanCubugu: {
    height: 10,
    borderRadius: 999,
    backgroundColor: renkler.ana_100,
    overflow: "hidden",
  },
  kontenjanDort: { height: 10, borderRadius: 999 },
  doluMetin: { color: renkler.tehlikeli, fontSize: 13, fontWeight: "600" },
  aciklamaKap: { marginTop: 20 },
  bolumBaslik: { fontSize: 17, fontWeight: "700", color: renkler.metin, marginBottom: 10 },
  aciklama: { fontSize: 15, lineHeight: 24, color: renkler.metin },
  gectiKutu: {
    backgroundColor: renkler.ana_100,
    borderRadius: olcutler.buton_radius,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  gectiMetin: { color: renkler.ana_700, fontWeight: "600", fontSize: 14 },
  kayitliButon: { backgroundColor: renkler.basarili, marginTop: 20 },
});