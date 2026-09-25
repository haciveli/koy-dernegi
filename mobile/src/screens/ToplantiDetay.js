import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { oyKullan } from "../api";
import { useAuth } from "../context/AuthContext";
import LoadingView from "../components/LoadingView";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { renkler, olcutler } from "../theme";

const DURUM_ETIKET = {
  planlandi: "Planlandı",
  duzenlendi: "Yapıldı",
  iptal: "İptal Edildi",
};

export default function ToplantiDetay({ route }) {
  const { token, kullanici } = useAuth();
  const [toplanti, setToplanti] = useState(route.params?.toplanti || null);
  const [yukleniyor, setYukleniyor] = useState(!toplanti);
  const [oySekme, setOySekme] = useState(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const veriCek = useCallback(() => {
    const hedefId = toplanti?.id || route.params?.toplanti_id;
    if (!hedefId) return;
    setYukleniyor(true);
    import("../api")
      .then(({ toplantiDetay }) => toplantiDetay(hedefId))
      .then((t) => setToplanti(t))
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, [toplanti?.id, route.params?.toplanti_id]);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  if (yukleniyor) return <LoadingView metin="Toplantı detayı yükleniyor..." />;
  if (!toplanti) return null;

  const oyVer = (oylama, secim) => {
    setGonderiliyor(true);
    oyKullan(toplanti.id, oylama.id, secim)
      .then(() => {
        Alert.alert("Oyunuz Kaydedildi", `Seçiminiz: ${secim}`);
        veriCek();
      })
      .catch((hata) => Alert.alert("Hata", hata?.message || "Oy kaydedilemedi."))
      .finally(() => setGonderiliyor(false));
  };

  return (
    <ScrollView style={styles.kap} contentContainerStyle={styles.icerik}>
      <View style={styles.ust}>
        <Text style={styles.baslik}>{toplanti.baslik}</Text>
        <View style={styles.metaSatir}>
          <Badge metin={DURUM_ETIKET[toplanti.durum] || toplanti.durum} renk={renkler.ana_500} />
          <Text style={styles.meta}>
            <Ionicons name="calendar-outline" size={13} />{" "}
            {new Date(toplanti.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </View>
        {toplanti.yer ? (
          <Text style={styles.meta}>
            <Ionicons name="location-outline" size={13} /> {toplanti.yer}
          </Text>
        ) : null}
        {toplanti.aciklama ? <Text style={styles.aciklama}>{toplanti.aciklama}</Text> : null}
      </View>

      {toplanti.gundem?.length > 0 ? (
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Gündem</Text>
          {toplanti.gundem.map((g, i) => (
            <View key={g.id} style={styles.gundemSatir}>
              <View style={styles.gundemNumara}>
                <Text style={styles.gundemNumaraMetin}>{g.sira || i + 1}</Text>
              </View>
              <Text style={styles.gundemMetin}>{g.baslik}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {toplanti.oylamalar?.length > 0 ? (
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Oylamalar</Text>
          {toplanti.oylamalar.map((oylama) => (
            <View key={oylama.id} style={styles.oylamaKart}>
              <View style={styles.oylamaUst}>
                <Text style={styles.oylamaKonu}>{oylama.konu}</Text>
                <Badge
                  metin={oylama.aktif ? "Açık" : "Kapatıldı"}
                  renk={oylama.aktif ? "#2f8f4f" : renkler.metin_soluk}
                />
              </View>
              {oySekme === oylama.id && oylama.aktif && token ? (
                <View style={styles.secenekler}>
                  {oylama.secenekler.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.secenek,
                        oylama.benim_oyum === s ? styles.secenekSecili : null,
                      ]}
                      onPress={() => oyVer(oylama, s)}
                      disabled={gonderiliyor}
                    >
                      <Text
                        style={[
                          styles.secenekMetin,
                          oylama.benim_oyum === s ? styles.secenekMetinSecili : null,
                        ]}
                      >
                        {s}
                        {oylama.benim_oyum === s ? "  ✓" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  {tamSonuc(oylama)}
                  {oylama.aktif && token && !oySekme ? (
                    <Button
                      baslik={oylama.benim_oyum ? "Oyunu Değiştir" : "Oy Ver"}
                      tur="ince"
                      ikon="hand-right-outline"
                      onPress={() => setOySekme(oylama.id)}
                    />
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </View>
      ) : null}

      {toplanti.video_url ? (
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Kayıt</Text>
          <Button
            baslik="Toplantı Videosunu İzle"
            ikon="videocam-outline"
            onPress={() => Linking.openURL(toplanti.video_url).catch(() => {})}
            butuk
          />
        </View>
      ) : null}

      {toplanti.tutanak ? (
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Tutanak</Text>
          <Text style={styles.tutanak}>{toplanti.tutanak}</Text>
        </View>
      ) : null}
    </ScrollView>
  );

  function tamSonuc(oylama) {
    const secenekler = oylama.secenekler || [];
    const secimler = oylama.oy_secimler || {};
    const toplam = oylama.oy_sayisi || 0;
    if (!toplam || !secenekler.length) {
      return (
        <Text style={styles.oyHic}>
          {kullanici ? "Henüz oy kullanılmadı." : "Sonuçları görmek için giriş yapın."}
        </Text>
      );
    }
    return (
      <View style={styles.sonucKap}>
        {secenekler.map((s) => {
          const sayi = secimler[s] || 0;
          const oran = Math.round((sayi / toplam) * 100);
          return (
            <View key={s} style={styles.sonucSatir}>
              <View style={styles.sonucUst}>
                <Text style={styles.sonucEtiket}>{s}</Text>
                <Text style={styles.sonucDeger}>{sayi} (%{oran})</Text>
              </View>
              <View style={styles.sonucBarKapsa}>
                <View style={[styles.sonucBar, { width: `${oran}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 16, paddingBottom: 40, gap: 16 },
  ust: { gap: 8 },
  baslik: { fontSize: 22, fontWeight: "800", color: renkler.metin, lineHeight: 28 },
  metaSatir: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  meta: { fontSize: 13, color: renkler.metin_soluk },
  aciklama: { fontSize: 14, color: renkler.metin_soluk, lineHeight: 20, marginTop: 2 },
  bolum: { backgroundColor: renkler.kart, borderRadius: olcutler.kart_radius, padding: 16, gap: 10 },
  bolumBaslik: { fontSize: 16, fontWeight: "700", color: renkler.metin, marginBottom: 2 },
  gundemSatir: { flexDirection: "row", alignItems: "center", gap: 10 },
  gundemNumara: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: renkler.ana_100,
    alignItems: "center",
    justifyContent: "center",
  },
  gundemNumaraMetin: { fontSize: 13, fontWeight: "700", color: renkler.ana_700 },
  gundemMetin: { fontSize: 14, color: renkler.metin, flex: 1 },
  oylamaKart: { gap: 10, paddingVertical: 4 },
  oylamaUst: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  oylamaKonu: { fontSize: 15, fontWeight: "700", color: renkler.metin, flex: 1 },
  secenekler: { gap: 6 },
  secenek: {
    borderWidth: 1,
    borderColor: renkler.sinir,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secenekSecili: { borderColor: renkler.ana_500, backgroundColor: renkler.ana_50 },
  secenekMetin: { fontSize: 14, color: renkler.metin, fontWeight: "500" },
  secenekMetinSecili: { color: renkler.ana_700, fontWeight: "700" },
  oyHic: { fontSize: 13, color: renkler.metin_soluk },
  sonucKap: { gap: 8 },
  sonucSatir: { gap: 4 },
  sonucUst: { flexDirection: "row", justifyContent: "space-between" },
  sonucEtiket: { fontSize: 13, color: renkler.metin, fontWeight: "600" },
  sonucDeger: { fontSize: 13, color: renkler.metin_soluk },
  sonucBarKapsa: { height: 8, backgroundColor: renkler.ana_100, borderRadius: 4, overflow: "hidden" },
  sonucBar: { height: 8, backgroundColor: renkler.ana_500, borderRadius: 4 },
  tutanak: { fontSize: 14, color: renkler.metin_soluk, lineHeight: 21 },
});