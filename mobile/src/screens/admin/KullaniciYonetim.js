import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { kullanicilar, kullaniciGuncelle, kullaniciSil } from "../../api";
import AdminListe, { AdminSatir } from "../../components/admin/AdminListe";
import PageHeader from "../../components/PageHeader";
import { renkler } from "../../theme";

const DURUM_ETIKET = {
  onayli: { metin: "Onaylı", renk: renkler.basarili },
  beklemede: { metin: "Beklemede", renk: renkler.vurgu_600 },
  reddedildi: { metin: "Reddedildi", renk: renkler.tehlikeli },
};

const ROL_ETIKET = {
  yonetici: { metin: "Yönetici", renk: renkler.ana_600 },
  uye: { metin: "Üye", renk: renkler.metin_soluk },
};

export default function KullaniciYonetim() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState([]);

  const veriCek = useCallback(async () => {
    try {
      const sonuc = await kullanicilar();
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

  const durumDegistir = (kullanici, durum) => {
    Alert.alert(
      "Durum",
      `${kullanici.ad} ${kullanici.soyad} için durum "${DURUM_ETIKET[durum]?.metin}" yapılsın mı?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Güncelle",
          onPress: async () => {
            try {
              await kullaniciGuncelle(kullanici.id, { durum });
              await veriCek();
            } catch (hata) {
              Alert.alert("Hata", hata?.message || "Güncellenemedi.");
            }
          },
        },
      ]
    );
  };

  const rolDegistir = (kullanici) => {
    Alert.alert(
      "Rol",
      `${kullanici.ad} ${kullanici.soyad} için rol atayın`,
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Yönetici", onPress: async () => { try { await kullaniciGuncelle(kullanici.id, { rol: "yonetici" }); await veriCek(); } catch (hata) { Alert.alert("Hata", hata?.message || "Güncellenemedi."); } } },
        { text: "Üye", onPress: async () => { try { await kullaniciGuncelle(kullanici.id, { rol: "uye" }); await veriCek(); } catch (hata) { Alert.alert("Hata", hata?.message || "Güncellenemedi."); } } },
      ]
    );
  };

  const sil = (kullanici) => {
    Alert.alert(
      "Sil",
      `${kullanici.ad} ${kullanici.soyad} silinsin mi?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await kullaniciSil(kullanici.id);
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
      <PageHeader baslik="Üye Yönetimi" altBaslik="Kayıtları onaylayın, rolleri yönetin" />
      <AdminListe
        yukleniyor={yukleniyor}
        veriler={veriler}
        bosMetin="Henüz üye kaydı yok"
        bosIkon="people-outline"
        renderSatir={(madde) => (
          <AdminSatir
            birincil={`${madde.ad} ${madde.soyad}`}
            ikincil={`${madde.email ?? ""}${madde.telefon ? " · " + madde.telefon : ""}`}
            rozet={`${ROL_ETIKET[madde.rol]?.metin ?? madde.rol ?? "-"}`}
            rozetRenk={ROL_ETIKET[madde.rol]?.renk ?? renkler.metin_soluk}
            onDuzenle={() => durumDegistir(madde, madde.durum === "onayli" ? "beklemede" : "onayli")}
            onRol={() => rolDegistir(madde)}
            onSil={() => sil(madde)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
});
