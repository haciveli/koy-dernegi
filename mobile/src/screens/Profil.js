import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ayarlar, sifreDegistir, bildirimTercihleri, bildirimTercihleriGuncelle } from "../api";
import { kisaAd } from "../utils";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Badge from "../components/Badge";
import FormInput from "../components/FormInput";
import { renkler, olcutler } from "../theme";

const BILDIRIM_TURLERI = [
  { anahtar: "duyuru", etiket: "Duyurular", aciklama: "Yeni duyuru yayınlandığında" },
  { anahtar: "etkinlik", etiket: "Etkinlikler", aciklama: "Etkinlik duyurulduğunda" },
  { anahtar: "toplanti", etiket: "Toplantılar", aciklama: "Toplantı ve oylama açıldığında" },
  { anahtar: "oylama", etiket: "Oylamalar", aciklama: "Yeni oylama başlatıldığında" },
  { anahtar: "aidat", etiket: "Aidat", aciklama: "Aidat ödemenizle ilgili" },
  { anahtar: "bagis", etiket: "Bağış", aciklama: "Bağışınızla ilgili" },
];

export default function Profil({ navigation }) {
  const { token, kullanici, cikisYap } = useAuth();
  const [ayar, setAyar] = useState(null);
  const [sifreForm, setSifreForm] = useState({ mevcut: "", yeni: "" });
  const [sifreYuKleniyor, setSifreYuKleniyor] = useState(false);
  const [sifreKart, setSifreKart] = useState(false);
  const [bildirimTercih, setBildirimTercih] = useState(null);
  const [bildirimKart, setBildirimKart] = useState(false);

  useEffect(() => {
    ayarlar()
      .then(setAyar)
      .catch(() => {});
    bildirimTercihleri()
      .then((yanit) => setBildirimTercih(yanit?.tercihler || null))
      .catch(() => {});
  }, []);

  const tercihDegistir = (anahtar, deger) => {
    const yeni = { ...(bildirimTercih || {}), [anahtar]: deger };
    setBildirimTercih(yeni);
    bildirimTercihleriGuncelle({ [anahtar]: deger }).catch(() => {
      setBildirimTercih((t) => ({ ...(t || {}), [anahtar]: !deger }));
      Alert.alert("Hata", "Bildirim tercihi kaydedilemedi.");
    });
  };

  const cikis = () => {
    Alert.alert("Çıkış", "Oturumunuz kapatılsın mı?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: cikisYap },
    ]);
  };

  const sifreKaydet = () => {
    if (!sifreForm.mevcut || !sifreForm.yeni) {
      Alert.alert("Bilgi", "Mevcut ve yeni şifrenizi girin");
      return;
    }
    if (sifreForm.yeni.length < 6) {
      Alert.alert("Bilgi", "Yeni şifre en az 6 karakter olmalı");
      return;
    }
    setSifreYuKleniyor(true);
    sifreDegistir({ mevcut_sifre: sifreForm.mevcut, yeni_sifre: sifreForm.yeni })
      .then(() => {
        Alert.alert("Başarılı", "Şifreniz değiştirildi. Tüm oturumlar kapatıldı, tekrar giriş yapın.", [
          { text: "Tamam", onPress: cikisYap },
        ]);
      })
      .catch((hata) => Alert.alert("Hata", hata.message))
      .finally(() => {
        setSifreYuKleniyor(false);
        setSifreForm({ mevcut: "", yeni: "" });
        setSifreKart(false);
      });
  };

  if (!token || !kullanici) {
    return (
      <ScrollView style={styles.kap} contentContainerStyle={styles.girisIcerik}>
        <View style={styles.girisHero}>
          <View style={styles.logoKutu}>
            <Ionicons name="leaf" size={40} color={renkler.ana_600} />
          </View>
          <Text style={styles.girisBaslik}>{ayar?.site_adi || "Köy Derneği"}</Text>
          <Text style={styles.girisMeta}>
            {ayar?.site_kisa_aciklama || "Dayanışma · Kültür · Gelecek"}
          </Text>
        </View>
        <View style={styles.girisAlt}>
          <Button baslik="Üye Girişi" onPress={() => navigation.navigate("Giris")} butuk ikon="log-in-outline" />
          <Button
            baslik="Üyelik Başvurusu"
            tur="ince"
            onPress={() => navigation.navigate("Kayit")}
            butuk
            ikon="person-add-outline"
          />
        </View>
      </ScrollView>
    );
  }

  const durumEtiketi = {
    onayli: { metin: "Aktif Üye", renk: renkler.basarili },
    beklemede: { metin: "Onay Bekliyor", renk: renkler.vurgu_600 },
    reddedildi: { metin: "Reddedildi", renk: renkler.tehlikeli },
  }[kullanici.durum] || { metin: kullanici.durum, renk: renkler.metin_soluk };

  return (
    <ScrollView style={styles.kap} contentContainerStyle={styles.icerik}>
      <View style={styles.profilKarti}>
        <View style={styles.avatar}>
          <Text style={styles.avatarMetin}>{kisaAd(kullanici.ad, kullanici.soyad)}</Text>
        </View>
        <View style={styles.profilBilgi}>
          <Text style={styles.isim}>
            {kullanici.ad} {kullanici.soyad}
          </Text>
          <Text style={styles.meta}>{kullanici.koy}</Text>
          <View style={styles.rozetSatir}>
            <Badge metin={durumEtiketi.metin} renk={durumEtiketi.renk} />
            {kullanici.rol ? <Badge metin={kullanici.rol.toUpperCase()} renk={renkler.ana_500} /> : null}
          </View>
        </View>
      </View>

      <View style={styles.bilgiListesi}>
        <BilgiSatir ikon="mail-outline" deger={kullanici.email} />
        {kullanici.telefon ? <BilgiSatir ikon="call-outline" deger={kullanici.telefon} /> : null}
      </View>

      <Text style={styles.bolumBaslik}>Birimler</Text>
      <View style={styles.menu}>
        <MenuSatir ikon="card-outline" baslik="Aidat ve Bağış" onPress={() => navigation.navigate("Aidat")} />
        <MenuSatir ikon="storefront-outline" baslik="Köy Rehberi" onPress={() => navigation.navigate("Rehber")} />
        <MenuSatir ikon="megaphone-outline" baslik="İlan Panosu" onPress={() => navigation.navigate("Ilanlar")} />
        <MenuSatir ikon="people-outline" baslik="Toplantılar" onPress={() => navigation.navigate("Toplantilar")} />
        <MenuSatir ikon="headset-outline" baslik="İletişim" onPress={() => navigation.navigate("Iletisim")} />
        <MenuSatir ikon="videocam-outline" baslik="Videolar" onPress={() => navigation.navigate("Videolar")} />
        <MenuSatir ikon="images-outline" baslik="Galeri" onPress={() => navigation.navigate("GaleriTab")} />
        <MenuSatir ikon="notifications-outline" baslik="Duyurular" onPress={() => navigation.navigate("DuyuruTab")} />
        <MenuSatir ikon="calendar-outline" baslik="Etkinlikler" onPress={() => navigation.navigate("EtkinlikTab")} />
        {kullanici.rol === "yonetici" ? <MenuSatir ikon="settings-outline" baslik="Yönetim Paneli" onPress={() => navigation.navigate("Yonetim")} /> : null}
      </View>

      <MenuSatir ikon="lock-closed-outline" baslik="Şifre Değiştir" onPress={() => setSifreKart((v) => !v)} />
        <MenuSatir ikon="notifications-outline" baslik="Bildirim Ayarları" onPress={() => setBildirimKart((v) => !v)} />
        {bildirimKart ? (
          <View style={styles.bildirimKart}>
            <Text style={styles.bildirimBilgi}>
              Bildirimleri istediğiniz konularda açıp kapatabilirsiniz. Değişiklikler hemen kaydedilir.
            </Text>
            {bildirimTercih ? (
              BILDIRIM_TURLERI.map((tur) => (
                <View key={tur.anahtar} style={styles.bildirimSatir}>
                  <View style={styles.bildirimMetin}>
                    <Text style={styles.bildirimEtiket}>{tur.etiket}</Text>
                    <Text style={styles.bildirimAciklama}>{tur.aciklama}</Text>
                  </View>
                  <Switch
                    value={bildirimTercih[tur.anahtar] !== false}
                    onValueChange={(deger) => tercihDegistir(tur.anahtar, deger)}
                    trackColor={{ false: renkler.sinir, true: renkler.ana_500 }}
                    thumbColor={bildirimTercih[tur.anahtar] !== false ? renkler.ana_600 : "#f4f3f4"}
                  />
                </View>
              ))
) : (
              <Text style={styles.bildirimAciklama}>Bildirim tercihleri yükleniyor...</Text>
            )}
          </View>
        ) : null}

        {sifreKart ? (
        <View style={styles.sifreKart}>
          <FormInput
            value={sifreForm.mevcut}
            onChangeText={(v) => setSifreForm((f) => ({ ...f, mevcut: v }))}
            secureTextEntry
            ikon="key-outline"
            placeholder="Mevcut şifre"
          />
          <FormInput
            value={sifreForm.yeni}
            onChangeText={(v) => setSifreForm((f) => ({ ...f, yeni: v }))}
            secureTextEntry
            ikon="key-outline"
            placeholder="Yeni şifre (en az 6 karakter)"
          />
          <Button baslik="Şifreyi Güncelle" onPress={sifreKaydet} yukleniyor={sifreYuKleniyor} ikon="checkmark-circle-outline" />
        </View>
      ) : null}

      <Button baslik="Çıkış Yap" tur="ince" onPress={cikis} ikon="log-out-outline" style={styles.cikisYolu} />
    </ScrollView>
  );
}

function BilgiSatir({ ikon, deger }) {
  return (
    <View style={styles.bilgiSatir}>
      <Ionicons name={ikon} size={18} color={renkler.ana_600} />
      <Text style={styles.bilgiDeger}>{deger}</Text>
    </View>
  );
}

function MenuSatir({ ikon, baslik, onPress }) {
  return (
    <TouchableOpacity style={styles.menuSatir} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={ikon} size={20} color={renkler.ana_600} />
      <Text style={styles.menuBaslik}>{baslik}</Text>
      <Ionicons name="chevron-forward" size={18} color={renkler.metin_soluk} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 16, paddingBottom: 40 },
  girisIcerik: { flexGrow: 1, padding: 20 },
  girisHero: { alignItems: "center", marginTop: 40, marginBottom: 30, gap: 8 },
  logoKutu: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: renkler.kart,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: renkler.sinir,
    marginBottom: 6,
  },
  girisBaslik: { fontSize: 22, fontWeight: "800", color: renkler.metin, textAlign: "center" },
  girisMeta: { fontSize: 14, color: renkler.metin_soluk, textAlign: "center" },
  girisAlt: { gap: 12 },
  profilKarti: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 18,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: renkler.ana_600,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMetin: { color: "#fff", fontSize: 22, fontWeight: "700" },
  profilBilgi: { flex: 1, gap: 3 },
  isim: { fontSize: 18, fontWeight: "800", color: renkler.metin },
  meta: { fontSize: 13, color: renkler.metin_soluk },
  rozetSatir: { flexDirection: "row", gap: 6, marginTop: 4 },
  bilgiListesi: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  bilgiSatir: { flexDirection: "row", alignItems: "center", gap: 10 },
  bilgiDeger: { fontSize: 14, color: renkler.metin, flex: 1 },
  bolumBaslik: { fontSize: 17, fontWeight: "700", color: renkler.metin, marginTop: 20, marginBottom: 10 },
  menu: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  menuSatir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: renkler.sinir,
  },
  menuBaslik: { flex: 1, fontSize: 15, fontWeight: "500", color: renkler.metin },
  sifreKart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  bildirimKart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: renkler.sinir,
    gap: 4,
  },
  bildirimBilgi: { fontSize: 13, color: renkler.metin_soluk, marginBottom: 6 },
  bildirimSatir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: renkler.sinir,
  },
  bildirimMetin: { flex: 1, gap: 1 },
  bildirimEtiket: { fontSize: 15, fontWeight: "600", color: renkler.metin },
  bildirimAciklama: { fontSize: 12, color: renkler.metin_soluk },
  cikisYolu: { marginTop: 24 },
});