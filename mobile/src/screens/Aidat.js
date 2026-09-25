import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { aidatlarBenim, aidatBenimOde, aidatOde, ayarlar, bagisEkle, bagislarBenim } from "../api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import EmptyState from "../components/EmptyState";
import LoadingView from "../components/LoadingView";
import { renkler, olcutler } from "../theme";
import { ayAdi } from "../utils";

const DURUM_ETIKET = {
  beklemede: { metin: "Bekliyor", renk: renkler.vurgu_600 },
  odeyenekadar: { metin: "Ödeme Bildirildi", renk: renkler.ana_600 },
  odendi: { metin: "Ödendi", renk: renkler.basarili },
  reddedildi: { metin: "Reddedildi", renk: renkler.tehlikeli },
};

export default function Aidat({ navigation, route }) {
  const { kullanici } = useAuth();
  const [yukleniyor, setYukleniyor] = useState(true);
  const [ayar, setAyar] = useState(null);
  const [aidatListe, setAidatListe] = useState([]);
  const [bagisListe, setBagisListe] = useState([]);
  const [sekme, setSekme] = useState(route?.params?.sekme === "bagis" ? "bagis" : "aidat");
  const [bagisTutar, setBagisTutar] = useState("");
  const [bagisAciklama, setBagisAciklama] = useState("");
  const [bagisGonderiliyor, setBagisGonderiliyor] = useState(false);

  const cek = useCallback(async () => {
    try {
      const [a, b, ay] = await Promise.all([
        aidatlarBenim().catch(() => []),
        bagislarBenim().catch(() => []),
        ayarlar().catch(() => ({})),
      ]);
      setAidatListe(Array.isArray(a) ? a : []);
      setBagisListe(Array.isArray(b) ? b : []);
      setAyar(ay);
    } catch {
      // sessiz
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (kullanici && kullanici.durum === "onayli") cek();
      else setYukleniyor(false);
    }, [kullanici, cek])
  );

  if (!kullanici || kullanici.durum !== "onayli") {
    return (
      <View style={styles.kap}>
        <PageHeader baslik="Aidat ve Bağış" altBaslik="Üyelik durumunuzu kontrol edin" />
        <View style={styles.girisGerek}>
          <EmptyState ikon="log-in-outline" metin="Bu bölümü kullanmak için üye girişi yapın." />
          <Button baslik="Üye Girişi" onPress={() => navigation.navigate("Giris")} butuk ikon="log-in-outline" />
        </View>
      </View>
    );
  }

  if (yukleniyor) {
    return <LoadingView metin="Bilgiler yükleniyor..." />;
  }

  const odenecekTutar = (aidat) => {
    try {
      if (aidat.tutar) return aidat.tutar;
      const yillik = Number(ayar?.aidat_yillik_tutar || 0);
      if (aidat.ay == 0 && yillik > 0) return yillik;
      const aylik = Number(ayar?.aidat_aylik_tutar || 0);
      if (aylik > 0) return aylik;
      return yillik > 0 ? yillik : 0;
    } catch {
      return aidat.tutar || 0;
    }
  };

  const bugun = new Date();
  const buYil = typeof bugun.getFullYear === "function" ? bugun.getFullYear() : 2026;
  const buAy = typeof bugun.getMonth === "function" ? bugun.getMonth() + 1 : 1;
  const buAyKaydi = (aidatListe || []).find((a) => a.yil == buYil && a.ay == buAy);
  const buYilYillikKaydi = (aidatListe || []).find((a) => a.yil == buYil && a.ay == 0);

  const borcToplami = (aidatListe || []).reduce((top, a) => {
    if (a.durum === "odendi") return top;
    return top + odenecekTutar(a);
  }, 0);

  const odemeBildir = (aidat) => {
    const tutar = odenecekTutar(aidat);
    const donem = aidat.ay == 0 ? `${aidat.yil} yılı (tüm yıl)` : `${ayAdi(aidat.ay)} ${aidat.yil}`;
    Alert.alert(
      "Ödeme Bildirimi",
      `${donem} aidatı için ${tutar} ₺ ödediğinizi onaylıyor musunuz?\n\nHavale/EFT açıklamasına "${ayar?.aidat_aciklama || ""}" yazınız.\nYönetici onayından sonra durum "Ödendi" olur.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Ödedim",
          onPress: async () => {
            try {
              await aidatOde(aidat.id);
              await cek();
              Alert.alert("Bildirim Alındı", "Yönetici onayı bekleniyor.");
            } catch (hata) {
              Alert.alert("Hata", hata?.message || "İşlem başarısız.");
            }
          },
        },
      ]
    );
  };

  const aylikAidatBildir = (ay, yil) => {
    const tutar = odenecekTutar({ ay, yil, tutar: 0 });
    const donem = ay == 0 ? `${yil} yılı (tüm yıl)` : `${ayAdi(ay)} ${yil}`;
    Alert.alert(
      ay == 0 ? "Yıllık Aidat Bildirimi" : "Aylık Aidat Bildirimi",
      `${donem} aidatı için ${tutar || "-"} ₺ ödediğinizi onaylıyor musunuz?\n\nHavale/EFT açıklamasına "${ayar?.aidat_aciklama || ""}" yazınız.\nYönetici onayından sonra durum "Ödendi" olur.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Ödedim",
          onPress: async () => {
            try {
              await aidatBenimOde({ yil, ay });
              await cek();
              Alert.alert("Bildirim Alındı", "Yönetici onayı bekleniyor.");
            } catch (hata) {
              Alert.alert("Hata", hata?.message || "İşlem başarısız.");
            }
          },
        },
      ]
    );
  };

  const bagisKaydet = async () => {
    const tutar = Number(bagisTutar);
    if (!tutar || tutar <= 0) {
      Alert.alert("Eksik Bilgi", "Geçerli bir bağış tutarı girin.");
      return;
    }
    setBagisGonderiliyor(true);
    try {
      await bagisEkle({ tutar, ad: `${kullanici.ad} ${kullanici.soyad}`, email: kullanici.email, aciklama: bagisAciklama });
      Alert.alert("Bağış Bildirimi", "Bağışınızı bildirdiniz. Yönetici onayı bekleniyor.");
      setBagisTutar("");
      setBagisAciklama("");
      await cek();
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Bağış bildirilemedi.");
    } finally {
      setBagisGonderiliyor(false);
    }
  };

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Aidat ve Bağış" altBaslik="Üyelik aidatlarınızı ödeyin, bağış yapın" />

      <View style={styles.sekmeler}>
        <TouchableOpacity style={[styles.sekme, sekme === "aidat" && styles.sekmeAktif]} onPress={() => setSekme("aidat")}>
          <Ionicons name="card-outline" size={18} color={sekme === "aidat" ? "#fff" : renkler.metin_soluk} />
          <Text style={[styles.sekmeMetin, sekme === "aidat" && styles.sekmeMetinAktif]}>Aidat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sekme, sekme === "bagis" && styles.sekmeAktif]} onPress={() => setSekme("bagis")}>
          <Ionicons name="heart-outline" size={18} color={sekme === "bagis" ? "#fff" : renkler.metin_soluk} />
          <Text style={[styles.sekmeMetin, sekme === "bagis" && styles.sekmeMetinAktif]}>Bağış</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.icerik}>
        {sekme === "aidat" ? (
          <>
            {borcToplami > 0 ? (
              <View style={styles.borcKart}>
                <Text style={styles.borcMetin}>Toplam Aidat Borcunuz</Text>
                <Text style={styles.borcTutar}>{borcToplami} ₺</Text>
                <Text style={styles.borcNot}>Ödenmemiş aidat kayıtlarınızın toplamı. Ödeme yaptığınızda "Ödeme Bildirimi" yaparak yönetici onayından sonra ödenmiş sayılır.</Text>
              </View>
            ) : null}

            {(ayar?.aidat_iban || ayar?.aidat_banka) ? (
              <View style={styles.ibanKarti}>
                <Text style={styles.ibanBaslik}>Aidat Hesabı</Text>
                {ayar?.aidat_banka ? <Text style={styles.ibanMetin}>Banka: {ayar.aidat_banka}</Text> : null}
                {ayar?.aidat_alici ? <Text style={styles.ibanMetin}>Alıcı: {ayar.aidat_alici}</Text> : null}
                <View style={styles.ibanKutu}>
                  <Text style={styles.ibanDeger}>{ayar?.aidat_iban}</Text>
                  <TouchableOpacity onPress={() => Alert.alert("IBAN", ayar?.aidat_iban)}>
                    <Ionicons name="copy-outline" size={18} color={renkler.ana_600} />
                  </TouchableOpacity>
                </View>
                {ayar?.aidat_aciklama ? <Text style={styles.ibanNot}>{ayar.aidat_aciklama}</Text> : null}
              </View>
            ) : null}

            {!buAyKaydi ? (
              <View style={styles.yillikKart}>
                <View style={styles.yillikUst}>
                  <Text style={styles.yillikYil}>{ayAdi(buAy)} {buYil}</Text>
                  <Text style={styles.yillikTutar}>{ayar?.aidat_aylik_tutar || "-"} ₺ / ay</Text>
                </View>
                <Text style={styles.yillikNot}>
                  Bu ayın aidat kaydı henüz girilmedi. Yine de ödemenizi bildirebilirsiniz.
                </Text>
                <Button baslik="Bu Ayın Aidatını Bildirdim" ikon="checkmark-circle-outline" onPress={() => aylikAidatBildir(buAy, buYil)} />
              </View>
            ) : null}

            {!buYilYillikKaydi ? (
              <View style={styles.yillikKart}>
                <View style={styles.yillikUst}>
                  <Text style={styles.yillikYil}>{buYil} · Tüm Yıl</Text>
                  <Text style={styles.yillikTutar}>{ayar?.aidat_yillik_tutar || "-"} ₺ / yıl</Text>
                </View>
                <Text style={styles.yillikNot}>
                  Yıllık ödeme yapmak isterseniz tüm yılın aidatını tek seferde bildirebilirsiniz.
                </Text>
                <Button baslik="Bu Yılın Aidatını Bildirdim" ikon="calendar-outline" onPress={() => aylikAidatBildir(0, buYil)} />
              </View>
            ) : null}

            {aidatListe.length === 0 ? (
              <EmptyState
                ikon="card-outline"
                metin={`Henüz aidat kaydınız yok. Aylık aidat: ${ayar?.aidat_aylik_tutar || "-"} ₺`}
              />
            ) : (
              aidatListe.map((aidat) => {
                const durum = DURUM_ETIKET[aidat.durum] || { metin: aidat.durum, renk: renkler.metin_soluk };
                const odendi = aidat.durum === "odendi";
                const bildirildi = aidat.durum === "odeyenekadar";
                return (
                  <View key={aidat.id} style={styles.aidatKart}>
                    <View style={styles.aidatUst}>
                      <View style={styles.aidatYil}>
                        <Text style={styles.aidatYilMetin}>{aidat.ay == 0 ? `Tüm Yıl ${aidat.yil}` : `${ayAdi(aidat.ay)} ${aidat.yil}`}</Text>
                        <Text style={styles.aidatTutar}>{odenecekTutar(aidat)} ₺{aidat.ay == 0 ? "" : " / ay"}</Text>
                      </View>
                      <View style={[styles.durumRozet, { backgroundColor: durum.renk }]}>
                        <Text style={styles.durumMetin}>{durum.metin}</Text>
                      </View>
                    </View>
                    {aidat.aciklama ? <Text style={styles.aidatNot}>{aidat.aciklama}</Text> : null}
                    {!odendi && !bildirildi ? (
                      <Button
                        baslik="Ödeme Bildirimimi Yap"
                        ikon="checkmark-circle-outline"
                        onPress={() => odemeBildir(aidat)}
                      />
                    ) : null}
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {(ayar?.bagis_iban || ayar?.bagis_banka) ? (
              <View style={styles.ibanKarti}>
                <Text style={styles.ibanBaslik}>Bağış Hesabı</Text>
                {ayar?.bagis_banka ? <Text style={styles.ibanMetin}>Banka: {ayar.bagis_banka}</Text> : null}
                {ayar?.bagis_alici ? <Text style={styles.ibanMetin}>Alıcı: {ayar.bagis_alici}</Text> : null}
                <View style={styles.ibanKutu}>
                  <Text style={styles.ibanDeger}>{ayar?.bagis_iban}</Text>
                </View>
                {ayar?.bagis_aciklama ? <Text style={styles.ibanNot}>{ayar.bagis_aciklama}</Text> : null}
              </View>
            ) : null}

            <View style={styles.bagisForm}>
              <Text style={styles.altsayfaBaslik}>Bağış Bildirimi</Text>
              <FormInput
                label="Tutar (₺)"
                ikon="cash-outline"
                keyboardType="numeric"
                placeholder="250"
                deger={bagisTutar}
                onChangeText={setBagisTutar}
                
              />
              <FormInput
                label="Açıklama"
                ikon="document-text-outline"
                placeholder="Bağış amacınız (opsiyonel)"
                multiline
                deger={bagisAciklama}
                onChangeText={setBagisAciklama}
              />
              <Button
                baslik={bagisGonderiliyor ? "Gönderiliyor..." : "Bağış Bildir"}
                ikon="heart-outline"
                yukleniyor={bagisGonderiliyor}
                onPress={bagisKaydet}
              />
            </View>

            {bagisListe.length > 0 ? (
              <>
                <Text style={styles.altsayfaBaslik}>Bağışlarınız</Text>
                {bagisListe.map((bagis) => {
                  const durum = {
                    beklemede: { metin: "Bekliyor", renk: renkler.vurgu_600 },
                    onaylandi: { metin: "Onaylandı", renk: renkler.basarili },
                    reddedildi: { metin: "Reddedildi", renk: renkler.tehlikeli },
                  }[bagis.durum] || { metin: bagis.durum, renk: renkler.metin_soluk };
                  return (
                    <View key={bagis.id} style={styles.bagisKart}>
                      <View style={styles.bagisUst}>
                        <Text style={styles.bagisTutar}>{bagis.tutar} ₺</Text>
                        <View style={[styles.durumRozet, { backgroundColor: durum.renk }]}>
                          <Text style={styles.durumMetin}>{durum.metin}</Text>
                        </View>
                      </View>
                      {bagis.aciklama ? <Text style={styles.aidatNot}>{bagis.aciklama}</Text> : null}
                    </View>
                  );
                })}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 16, gap: 14, paddingBottom: 40 },
  girisGerek: { padding: 24, gap: 16, alignItems: "center" },
  sekmeler: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 4,
    borderWidth: 1,
    borderColor: renkler.sinir,
    gap: 4,
  },
  sekme: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10 },
  sekmeAktif: { backgroundColor: renkler.ana_600 },
  sekmeMetin: { fontSize: 14, fontWeight: "600", color: renkler.metin_soluk },
  sekmeMetinAktif: { color: "#fff" },
  ibanKarti: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.sinir,
    padding: 16,
    gap: 6,
  },
  ibanBaslik: { fontSize: 15, fontWeight: "700", color: renkler.metin },
  ibanMetin: { fontSize: 13, color: renkler.metin_soluk },
  ibanKutu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: renkler.arkaplan,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  ibanDeger: { fontSize: 14, fontWeight: "600", color: renkler.metin, letterSpacing: 0.5 },
  ibanNot: { fontSize: 12, color: renkler.metin_soluk, fontStyle: "italic" },
  aidatKart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.sinir,
    padding: 16,
    gap: 12,
  },
  aidatUst: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aidatYil: { gap: 2 },
  aidatYilMetin: { fontSize: 20, fontWeight: "800", color: renkler.metin },
  aidatTutar: { fontSize: 14, color: renkler.metin_soluk },
  aidatNot: { fontSize: 13, color: renkler.metin_soluk },
  durumRozet: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  durumMetin: { color: "#fff", fontSize: 12, fontWeight: "700" },
  bagisForm: { backgroundColor: renkler.kart, borderRadius: olcutler.kart_radius, borderWidth: 1, borderColor: renkler.sinir, padding: 16, gap: 12 },
  altsayfaBaslik: { fontSize: 17, fontWeight: "700", color: renkler.metin, marginTop: 4 },
  bagisKart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.sinir,
    padding: 16,
    gap: 6,
  },
  bagisUst: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bagisTutar: { fontSize: 17, fontWeight: "700", color: renkler.metin },
  yillikKart: {
    backgroundColor: renkler.ana_50,
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.ana_200,
    padding: 16,
    gap: 10,
  },
  yillikUst: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  yillikYil: { fontSize: 22, fontWeight: "800", color: renkler.ana_600 },
  yillikTutar: { fontSize: 15, fontWeight: "700", color: renkler.metin },
  yillikNot: { fontSize: 13, color: renkler.metin_soluk },
  borcKart: {
    backgroundColor: "#fff3f3",
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.tehlikeli,
    padding: 16,
    gap: 6,
  },
  borcMetin: { fontSize: 13, fontWeight: "700", color: renkler.tehlikeli },
  borcTutar: { fontSize: 30, fontWeight: "800", color: renkler.tehlikeli },
  borcNot: { fontSize: 12, color: renkler.metin_soluk },
});