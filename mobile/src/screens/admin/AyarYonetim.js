import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import YonetimForm from "../../components/admin/YonetimForm";
import PageHeader from "../../components/PageHeader";
import { ayarlar, ayarlarGuncelle } from "../../api";
import { renkler } from "../../theme";

const AYAR_ALANLARI = [
  { anahtar: "site_adi", etiket: "Site Adı", ikon: "home-outline", placeholder: "Köy sitesi adı" },
  { anahtar: "site_kisa_aciklama", etiket: "Kısa Açıklama", ikon: "document-text-outline", placeholder: "Site tanıtım metni" },
  { anahtar: "footer_metni", etiket: "Alt Bilgi Metni", ikon: "text-outline", placeholder: "Footer metni", multiline: true },
  { anahtar: "telif_metni", etiket: "Telif Metni", ikon: "copyright-outline", placeholder: "© ..." },
  { anahtar: "tema_ana_renk", etiket: "Ana Renk", ikon: "color-palette-outline", placeholder: "#2f6149", yazim: "none" },
  { anahtar: "tema_vurgu_renk", etiket: "Vurgu Renk", ikon: "color-wand-outline", placeholder: "#d97706", yazim: "none" },
  { anahtar: "banner_metin", etiket: "Banner Metni", ikon: "megaphone-outline", placeholder: "Banner mesajı" },
  { anahtar: "banner_link", etiket: "Banner Link", ikon: "link-outline", placeholder: "https://...", keyboardType: "url", yazim: "none" },
  { anahtar: "banner_buton", etiket: "Banner Butonu", ikon: "arrow-forward-circle-outline", placeholder: "Detay" },
  { anahtar: "iletisim_adres", etiket: "Adres", ikon: "map-outline", placeholder: "Adres" },
  { anahtar: "iletisim_telefon", etiket: "Telefon", ikon: "call-outline", placeholder: "0 (___) ___ __ __", keyboardType: "phone-pad" },
  { anahtar: "iletisim_email", etiket: "E-posta", ikon: "mail-outline", placeholder: "info@koy.com", keyboardType: "email-address", yazim: "none" },
  { anahtar: "aidat_aylik_tutar", etiket: "Aylık Aidat (₺)", ikon: "cash-outline", placeholder: "500", keyboardType: "numeric", yazim: "none" },
  { anahtar: "aidat_banka", etiket: "Aidat Bankası", ikon: "business-outline", placeholder: "Bankanız" },
  { anahtar: "aidat_iban", etiket: "Aidat IBAN", ikon: "card-outline", placeholder: "TR00 0000 ...", yazim: "none" },
  { anahtar: "aidat_alici", etiket: "Aidat Alıcı", ikon: "person-outline", placeholder: "Dernek adı" },
  { anahtar: "aidat_aciklama", etiket: "Aidat Havale Notu", ikon: "document-text-outline", placeholder: "Açıklamaya adınızı yazınız", multiline: true },
  { anahtar: "bagis_banka", etiket: "Bağış Bankası", ikon: "business-outline", placeholder: "Bankanız" },
  { anahtar: "bagis_iban", etiket: "Bağış IBAN", ikon: "card-outline", placeholder: "TR00 0000 ...", yazim: "none" },
  { anahtar: "bagis_alici", etiket: "Bağış Alıcı", ikon: "person-outline", placeholder: "Dernek adı" },
  { anahtar: "bagis_aciklama", etiket: "Bağış Açıklaması", ikon: "document-text-outline", placeholder: "Bağış notu", multiline: true },
];

export default function AyarYonetim() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [formDeger, setFormDeger] = useState({});

  const veriCek = useCallback(async () => {
    try {
      const sonuc = await ayarlar();
      const a = sonuc ?? {};
      const bos = {};
      AYAR_ALANLARI.forEach((alan) => {
        bos[alan.anahtar] = String(a[alan.anahtar] ?? "");
      });
      setFormDeger(bos);
    } catch {
      setFormDeger({});
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  const kaydet = async () => {
    const veri = {};
    AYAR_ALANLARI.forEach((alan) => {
      veri[alan.anahtar] = String(formDeger[alan.anahtar] ?? "").trim();
    });
    setKaydediliyor(true);
    try {
      await ayarlarGuncelle(veri);
      Alert.alert("Başarılı", "Ayarlar kaydedildi.");
      await veriCek();
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Ayarlar" altBaslik="Site görünümünü ve iletişim bilgilerini düzenleyin" />
      <YonetimForm
        baslik="Genel Ayarlar"
        altBaslik="Değişiklikler kaydedildiğinde hemen geçerli olur"
        alanlar={AYAR_ALANLARI}
        formDeger={formDeger}
        formDegistir={(anahtar, deger) => setFormDeger((f) => ({ ...f, [anahtar]: deger }))}
        onKaydet={kaydet}
        yukleniyor={yukleniyor || kaydediliyor}
        kaydetBaslik="Ayarları Kaydet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
});
