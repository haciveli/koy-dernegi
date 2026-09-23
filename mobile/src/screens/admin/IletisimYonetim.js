import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AdminListe, { AdminSatir } from "../../components/admin/AdminListe";
import PageHeader from "../../components/PageHeader";
import { iletisimler, iletisimDurumGuncelle, iletisimSil } from "../../api";
import { renkler } from "../../theme";

const DURUM_RENK = {
  yeni: renkler.vurgu_600 ?? renkler.ana_600,
  okundu: renkler.bilgi,
  yanitlandi: renkler.basarili,
};

const DURUM_ETIKET = {
  yeni: "Yeni",
  okundu: "Okundu",
  yanitlandi: "Yanıtlandı",
};

export default function IletisimYonetim() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState([]);

  const veriCek = useCallback(async () => {
    try {
      const sonuc = await iletisimler();
      setVeriler(Array.isArray(sonuc) ? sonuc : []);
    } catch {
      setVeriler([]);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  const durumDegistir = (mesaj) => {
    Alert.alert(
      "Durum",
      `"${mesaj.konu || mesaj.ad} ${mesaj.soyad || ""}" mesajının durumu nedir?`,
      [
        { text: "Yeni", onPress: () => yeniDurum(mesaj.id, "yeni") },
        { text: "Okundu", onPress: () => yeniDurum(mesaj.id, "okundu") },
        { text: "Yanıtlandı", onPress: () => yeniDurum(mesaj.id, "yanitlandi") },
        { text: "Vazgeç", style: "cancel" },
      ]
    );
  };

  const yeniDurum = async (id, durum) => {
    try {
      await iletisimDurumGuncelle(id, durum);
      await veriCek();
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Güncellenemedi.");
    }
  };

  const sil = (mesaj) => {
    Alert.alert(
      "Sil",
      `"${mesaj.konu || mesaj.mesaj || "Mesaj"}" kalıcı olarak silinsin mi?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await iletisimSil(mesaj.id);
              await veriCek();
            } catch (hata) {
              Alert.alert("Hata", hata?.message || "Silinemedi.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.kap}>
      <PageHeader baslik="İletişim Mesajları" altBaslik="Ziyaretçi mesajlarını yönetin" />
      <AdminListe
        yukleniyor={yukleniyor}
        veriler={veriler}
        bosMetin="Henüz mesaj yok"
        bosIkon="mail-open-outline"
        renderSatir={(mesaj) => (
          <AdminSatir
            birincil={`${mesaj.ad || ""} ${mesaj.soyad || ""}`.trim() || mesaj.email || "Anonim"}
            ikincil={`${mesaj.email || ""} · ${mesaj.konu || ""}`.trim().replace(/^ · /, "")}
            rozet={DURUM_ETIKET[mesaj.durum] ?? mesaj.durum}
            rozetRenk={DURUM_RENK[mesaj.durum] ?? renkler.metin_soluk}
            onDuzenle={() => { Alert.alert(mesaj.konu || "Mesaj", mesaj.mesaj || "İçerik yok."); }}
            onSil={() => sil(mesaj)}
            silAciklama="mesajı"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
});
