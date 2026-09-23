import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AdminListe, { AdminSatir } from "../../components/admin/AdminListe";
import YonetimForm from "../../components/admin/YonetimForm";
import PageHeader from "../../components/PageHeader";
import { KAYIT_MODULLERI, bosForm, formDoldur, kayitRozetRenk } from "../../config/adminYapilandirma";
import { renkler } from "../../theme";

export default function YonetimModul({ route, tur }) {
  const config = KAYIT_MODULLERI[tur ?? route.params?.tur] ?? KAYIT_MODULLERI.duyuru;

  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yukleniyorForm, setYukleniyorForm] = useState(false);
  const [veriler, setVeriler] = useState([]);
  const [formDeger, setFormDeger] = useState(() => bosForm(config.alanlar));

  const veriCek = useCallback(async () => {
    try {
      const sonuc = await config.listele();
      setVeriler(Array.isArray(sonuc) ? sonuc : []);
    } catch {
      setVeriler([]);
    } finally {
      setYukleniyor(false);
    }
  }, [config]);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  const formAc = (kayit) => {
    if (kayit) {
      setDuzenlenen(kayit);
      setFormDeger(formDoldur(config.alanlar, kayit));
    } else {
      setDuzenlenen(null);
      setFormDeger(bosForm(config.alanlar));
    }
    setFormAcik(true);
  };

  const formDegistir = (anahtar, deger) =>
    setFormDeger((f) => ({ ...f, [anahtar]: deger }));

  const kaydet = async () => {
    const zorunlu = config.alanlar.filter((a) => !a.opsiyonel);
    for (const alan of zorunlu) {
      if (!String(formDeger[alan.anahtar] ?? "").trim()) {
        Alert.alert("Eksik Bilgi", `"${alan.etiket}" alanı zorunludur.`);
        return;
      }
    }
    setYukleniyorForm(true);
    try {
      const veri = {};
      config.alanlar.forEach((a) => {
        const deger = formDeger[a.anahtar];
        veri[a.anahtar] = a.sayisal ? Number(deger || 0) : String(deger ?? "").trim();
      });
      if (duzenlenen?.id) {
        await config.guncelle(duzenlenen.id, veri);
      } else {
        await config.ekle(veri);
      }
      setFormAcik(false);
      setDuzenlenen(null);
      await veriCek();
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Kaydedilemedi.");
    } finally {
      setYukleniyorForm(false);
    }
  };

  const sil = async (kayit) => {
    try {
      await config.sil(kayit.id);
      await veriCek();
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Silinemedi.");
    }
  };

  const rozetRenk = (kayit) =>
    (config.satirRozetRenk ? config.satirRozetRenk(kayit) : kayitRozetRenk(config, kayit)) ?? renkler.ana_600;

  if (formAcik) {
    return (
      <YonetimForm
        baslik={config.baslik}
        altBaslik={config.altBaslik}
        alanlar={config.alanlar}
        formDeger={formDeger}
        formDegistir={formDegistir}
        onKaydet={kaydet}
        yukleniyor={yukleniyorForm}
        onVazgec={() => {
          setFormAcik(false);
          setDuzenlenen(null);
        }}
        kaydetBaslik={duzenlenen ? "Güncelle" : config.ekleBaslik}
      />
    );
  }

  return (
    <View style={styles.kap}>
      <PageHeader baslik={config.baslik} altBaslik={config.altBaslik} />
      <AdminListe
        yukleniyor={yukleniyor}
        veriler={veriler}
        bosMetin={config.bosMetin}
        bosIkon={config.bosIkon}
        ekleBaslik={config.ekleBaslik}
        onEkle={() => formAc(null)}
        renderSatir={(madde) => (
          <AdminSatir
            birincil={config.satirBirincil(madde)}
            ikincil={config.satirIkincil?.(madde)}
            rozet={config.satirRozet?.(madde)}
            rozetRenk={rozetRenk(madde)}
            onDuzenle={() => formAc(madde)}
            onSil={async () => sil(madde)}
            silAciklama={`"${config.satirBirincil(madde)}" silinecek. Emin misiniz?`}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
});