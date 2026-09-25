import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { aidatlar, aidatEkle, aidatGuncelle, aidatSil, kullanicilar } from "../../api";
import AdminListe, { AdminSatir } from "../../components/admin/AdminListe";
import YonetimForm from "../../components/admin/YonetimForm";
import PageHeader from "../../components/PageHeader";
import { renkler } from "../../theme";
import { ayAdi, AY_ADLARI } from "../../utils";

const DURUM_ETIKET = {
  beklemede: { metin: "Bekliyor", renk: "#8a5a2b" },
  odeyenekadar: { metin: "Ödeme Bildirildi", renk: renkler.vurgu_600 },
  odendi: { metin: "Ödendi", renk: renkler.basarili },
  reddedildi: { metin: "Reddedildi", renk: renkler.tehlikeli },
};

const ALANLAR = [
  { anahtar: "kullanici_id", etiket: "Üye", placeholder: "Üye seçin", secim: "uyeler" },
  { anahtar: "yil", etiket: "Yıl", ikon: "calendar-outline", placeholder: "2024", keyboardType: "numeric", sayisal: true },
  { anahtar: "ay", etiket: "Ay", placeholder: "Ay seçin", secim: "aylar" },
  { anahtar: "tutar", etiket: "Tutar (₺)", ikon: "cash-outline", placeholder: "500", keyboardType: "numeric", sayisal: true },
  { anahtar: "aciklama", etiket: "Açıklama (opsiyonel)", ikon: "document-text-outline", placeholder: "Örn. Ekim 2026 aidatı", multiline: true },
];

const CARI_AY = new Date().getMonth() + 1;

export default function AidatYonetim() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yukleniyorForm, setYukleniyorForm] = useState(false);
  const [formAcik, setFormAcik] = useState(false);
  const [veriler, setVeriler] = useState([]);
  const [uyeler, setUyeler] = useState([]);
  const [formDeger, setFormDeger] = useState({ kullanici_id: "", yil: String(new Date().getFullYear()), ay: String(CARI_AY), tutar: "", aciklama: "" });

  const veriCek = useCallback(async () => {
    try {
      const [aidatSonuc, uyeSonuc] = await Promise.all([
        aidatlar().catch(() => []),
        kullanicilar().catch(() => []),
      ]);
      setVeriler(Array.isArray(aidatSonuc) ? aidatSonuc : []);
      setUyeler(Array.isArray(uyeSonuc) ? uyeSonuc : []);
    } catch {
      setVeriler([]);
      setUyeler([]);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  const uyeSecenekler = useMemo(
    () => uyeler.map((u) => ({ deger: u.id, etiket: `${u.ad} ${u.soyad}`.trim() || `Üye #${u.id}` })),
    [uyeler]
  );

  const formDegistir = (anahtar, deger) => setFormDeger((f) => ({ ...f, [anahtar]: deger }));

  const durumDegistir = (aidat, durum) => {
    Alert.alert(
      "Durum",
      `${aidat.ad || ""} ${aidat.soyad || ""} · ${ayAdi(aidat.ay)} ${aidat.yil} aidatı "${DURUM_ETIKET[durum]?.metin ?? durum}" yapılsın mı?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: durum === "odendi" ? "Ödendi" : durum === "reddedildi" ? "Reddet" : "Güncelle",
          onPress: async () => {
            try {
              await aidatGuncelle(aidat.id, { durum });
              await veriCek();
            } catch (hata) {
              Alert.alert("Hata", hata?.message || "Güncellenemedi.");
            }
          },
        },
      ]
    );
  };

  const sil = (aidat) => {
    Alert.alert("Sil", `${aidat.ad || ""} ${aidat.soyad || ""} aidat kaydı silinsin mi?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await aidatSil(aidat.id);
            await veriCek();
          } catch (hata) {
            Alert.alert("Hata", hata?.message || "Silinemedi.");
          }
        },
      },
    ]);
  };

  const kaydet = async () => {
    if (!formDeger.kullanici_id) {
      Alert.alert("Eksik Bilgi", "Üye seçin.");
      return;
    }
    const yil = Number(formDeger.yil);
    const ay = Number(formDeger.ay || CARI_AY);
    const tutar = Number(formDeger.tutar || 0);
    if (!yil || yil < 2000 || yil > 2100) {
      Alert.alert("Eksik Bilgi", "Geçerli bir yıl girin.");
      return;
    }
    if (!ay || ay < 1 || ay > 12) {
      Alert.alert("Eksik Bilgi", "Geçerli bir ay seçin.");
      return;
    }
    if (tutar < 0) {
      Alert.alert("Eksik Bilgi", "Tutar 0'dan küçük olamaz.");
      return;
    }
    setYukleniyorForm(true);
    try {
      await aidatEkle({
        kullanici_id: Number(formDeger.kullanici_id),
        yil,
        ay,
        tutar,
        aciklama: formDeger.aciklama?.trim() || null,
      });
      setFormAcik(false);
      setFormDeger({ kullanici_id: "", yil: String(new Date().getFullYear()), ay: String(CARI_AY), tutar: "", aciklama: "" });
      await veriCek();
      Alert.alert("Kaydedildi", "Aidat kaydı eklendi.");
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Eklenemedi.");
    } finally {
      setYukleniyorForm(false);
    }
  };

  if (formAcik) {
    return (
      <YonetimForm
        baslik="Yeni Aidat"
        altBaslik="Üyeye aidat kaydı ekleyin (geçmiş dönemler dahil)"
        alanlar={ALANLAR}
        formDeger={formDeger}
        formDegistir={formDegistir}
        secimSecenekler={{ uyeler: uyeSecenekler, aylar: AY_ADLARI.map((ad, i) => ({ deger: i + 1, etiket: ad })) }}
        onKaydet={kaydet}
        yukleniyor={yukleniyorForm}
        onVazgec={() => {
          setFormAcik(false);
          setFormDeger({ kullanici_id: "", yil: String(new Date().getFullYear()), ay: String(CARI_AY), tutar: "", aciklama: "" });
        }}
        kaydetBaslik="Kaydet"
      />
    );
  }

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Aidat Yönetimi" altBaslik="Aidat ekleyin, ödemeleri onaylayın" />
      <AdminListe
        yukleniyor={yukleniyor}
        veriler={veriler}
        bosMetin="Henüz aidat kaydı yok"
        bosIkon="card-outline"
        ekleBaslik="Yeni Aidat Ekle"
        onEkle={() => setFormAcik(true)}
        renderSatir={(madde) => (
          <View>
            <AdminSatir
              birincil={`${madde.ad ?? ""} ${madde.soyad ?? ""}`.trim() || `Üye #${madde.kullanici_id}`}
              ikincil={`${ayAdi(madde.ay)} ${madde.yil} · ${madde.tutar} ₺${madde.aciklama ? " · " + madde.aciklama : ""}`}
              rozet={DURUM_ETIKET[madde.durum]?.metin ?? madde.durum}
              rozetRenk={DURUM_ETIKET[madde.durum]?.renk ?? renkler.metin_soluk}
              onDuzenle={() =>
                madde.durum === "odendi"
                  ? durumDegistir(madde, "beklemede")
                  : durumDegistir(madde, "odendi")
              }
              onSil={() => sil(madde)}
            />
            {madde.durum !== "odendi" ? (
              <Text onPress={() => durumDegistir(madde, "reddedildi")} style={styles.hizli}>
                Ödemeyi reddet
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  hizli: {
    position: "absolute",
    top: 12,
    right: 64,
    color: renkler.tehlikeli,
    fontSize: 11,
    fontWeight: "600",
  },
});