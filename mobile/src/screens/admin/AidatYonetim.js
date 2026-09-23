import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { aidatlar, aidatGuncelle, aidatSil } from "../../api";
import AdminListe, { AdminSatir } from "../../components/admin/AdminListe";
import PageHeader from "../../components/PageHeader";
import { renkler } from "../../theme";

const DURUM_ETIKET = {
  beklemede: { metin: "Bekliyor", renk: "#8a5a2b" },
  odeyenekadar: { metin: "Ödeme Bildirildi", renk: renkler.vurgu_600 },
  odendi: { metin: "Ödendi", renk: renkler.basarili },
  reddedildi: { metin: "Reddedildi", renk: renkler.tehlikeli },
};

export default function AidatYonetim() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState([]);

  const veriCek = useCallback(async () => {
    try {
      const sonuc = await aidatlar();
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

  const durumDegistir = (aidat, durum) => {
    Alert.alert(
      "Durum",
      `${aidat.ad || ""} ${aidat.soyad || ""} · ${aidat.yil} aidatı "${DURUM_ETIKET[durum]?.metin ?? durum}" yapılsın mı?`,
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

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Aidat Yönetimi" altBaslik="Ödeme bildirimlerini onaylayın" />
      <AdminListe
        yukleniyor={yukleniyor}
        veriler={veriler}
        bosMetin="Henüz aidat kaydı yok"
        bosIkon="card-outline"
        renderSatir={(madde) => (
          <View>
            <AdminSatir
              birincil={`${madde.ad ?? ""} ${madde.soyad ?? ""}`.trim() || `Üye #${madde.kullanici_id}`}
              ikincil={`${madde.yil} · ${madde.tutar} ₺${madde.aciklama ? " · " + madde.aciklama : ""}`}
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