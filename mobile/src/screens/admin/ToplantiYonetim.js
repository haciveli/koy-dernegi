import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { toplantilar, toplantiEkle, toplantiGuncelle, toplantiSil, oylamaEkle, oylamaSil } from "../../api";
import AdminListe, { AdminSatir } from "../../components/admin/AdminListe";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import { renkler, olcutler } from "../../theme";

const DURUM_ETIKET = {
  planlandi: "Planlandı",
  duzenlendi: "Yapıldı",
  iptal: "İptal",
};
const DURUM_RENK = {
  planlandi: renkler.ana_600,
  duzenlendi: "#2f8f4f",
  iptal: "#cc3b3b",
};

function GundemDuzenleyici({ gundem, setGundem }) {
  const guncelle = (i, metin) =>
    setGundem((g) => g.map((madde, j) => (j === i ? metin : madde)));
  return (
    <View style={styles.formBolum}>
      <Text style={styles.formBolumBaslik}>Gündem Maddeleri</Text>
      {gundem.map((madde, i) => (
        <View key={i} style={styles.gundemSatir}>
          <View style={styles.gundemSayi}>
            <Text style={styles.gundemSayiMetin}>{i + 1}</Text>
          </View>
          <TextInput
            style={styles.gundemInput}
            value={madde}
            onChangeText={(m) => guncelle(i, m)}
            placeholder="Gündem maddesi..."
            placeholderTextColor={renkler.metin_soluk}
          />
          <TouchableOpacity
            style={styles.gundemSil}
            onPress={() => setGundem((g) => g.filter((_, j) => j !== i))}
          >
            <Ionicons name="close" size={18} color={renkler.tehlikeli} />
          </TouchableOpacity>
        </View>
      ))}
      <Button
        baslik="Gündem Maddesi Ekle"
        tur="ince"
        ikon="add"
        onPress={() => setGundem((g) => [...g, ""])}
      />
    </View>
  );
}

function OylamaBileseni({ toplantiId, oylamalar, onDegisti }) {
  const [konu, setKonu] = useState("");
  const [secenekler, setSecenekler] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const ekle = async () => {
    const liste = secenekler
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!konu.trim() || !liste.length) {
      Alert.alert("Eksik Bilgi", "Oylama konusu ve en az bir seçenek girin.");
      return;
    }
    setYukleniyor(true);
    try {
      await oylamaEkle(toplantiId, { konu: konu.trim(), secenekler: liste });
      setKonu("");
      setSecenekler("");
      onDegisti();
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Oylama eklenemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  const sil = (oylamaId) =>
    Alert.alert("Oylamayı Sil", "Bu oylama ve tüm oylar silinecek. Emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await oylamaSil(toplantiId, oylamaId);
            onDegisti();
          } catch (hata) {
            Alert.alert("Hata", hata?.message || "Silinemedi.");
          }
        },
      },
    ]);

  return (
    <View style={styles.formBolum}>
      <Text style={styles.formBolumBaslik}>Oylamalar</Text>
      {oylamalar?.length ? (
        oylamalar.map((o) => (
          <View key={o.id} style={styles.oylamaKart}>
            <View style={styles.oylamaUst}>
              <Text style={styles.oylamaKonu} numberOfLines={2}>{o.konu}</Text>
              <Text style={[styles.oylamaDurum, !o.aktif ? styles.oylamaKapali : null]}>
                {o.aktif ? "Açık" : "Kapatıldı"}
              </Text>
            </View>
            <Text style={styles.oylamaSecenekler}>
              {(o.secenekler || []).join(" · ")}
            </Text>
            <TouchableOpacity style={styles.oylamaSilButon} onPress={() => sil(o.id)}>
              <Ionicons name="trash-outline" size={15} color={renkler.tehlikeli} />
              <Text style={styles.oylamaSilMetin}>Sil</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.secenekYok}>Henüz oylama açılmamış.</Text>
      )}
      <Text style={styles.formBolumAlBaslik}>Yeni Oylama</Text>
      <FormInput
        label="Oylama Konusu"
        ikon="help-buoy-outline"
        placeholder="Yeni hizmet binası onayı"
        value={konu}
        onChangeText={setKonu}
      />
      <FormInput
        label="Seçenekler (virgülle ayırın)"
        ikon="list-outline"
        placeholder="Onaylıyorum, Katılmıyorum, Çekimser"
        value={secenekler}
        onChangeText={setSecenekler}
      />
      <Button
        baslik="Oylama Aç"
        tur="ince"
        ikon="add-circle-outline"
        onPress={ekle}
        yukleniyor={yukleniyor}
      />
    </View>
  );
}

export default function ToplantiYonetim({ navigation }) {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tarih, setTarih] = useState("");
  const [yer, setYer] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durum, setDurum] = useState("planlandi");
  const [tutanak, setTutanak] = useState("");
  const [gundem, setGundem] = useState([]);
  const [yukleniyorForm, setYukleniyorForm] = useState(false);

  const veriCek = useCallback(async () => {
    try {
      const sonuc = await toplantilar();
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

  const formAc = (toplanti) => {
    setDuzenlenen(toplanti ?? null);
    setBaslik(toplanti?.baslik ?? "");
    setAciklama(toplanti?.aciklama ?? "");
    setTarih(toplanti?.tarih ?? "");
    setYer(toplanti?.yer ?? "");
    setVideoUrl(toplanti?.video_url ?? "");
    setDurum(toplanti?.durum ?? "planlandi");
    setTutanak(toplanti?.tutanak ?? "");
    setGundem(toplanti?.gundem?.map((g) => g.baslik) ?? []);
    setFormAcik(true);
  };

  const kaydet = async () => {
    if (!baslik.trim() || !tarih.trim()) {
      Alert.alert("Eksik Bilgi", "Başlık ve tarih zorunludur.");
      return;
    }
    const veri = {
      baslik: baslik.trim(),
      aciklama: aciklama.trim(),
      tarih: tarih.trim(),
      yer: yer.trim(),
      video_url: videoUrl.trim(),
      tutanak: tutanak.trim(),
      durum,
      gundem: gundem.map((g, i) => ({ baslik: g, sira: i + 1 })).filter((g) => g.baslik.trim()),
    };
    setYukleniyorForm(true);
    try {
      if (duzenlenen?.id) {
        await toplantiGuncelle(duzenlenen.id, veri);
      } else {
        await toplantiEkle(veri);
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

  const sil = (toplanti) =>
    Alert.alert("Toplantıyı Sil", `"${toplanti.baslik}" ve tüm bağlı kayıtları silinecek. Emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await toplantiSil(toplanti.id);
            await veriCek();
          } catch (hata) {
            Alert.alert("Hata", hata?.message || "Silinemedi.");
          }
        },
      },
    ]);

  if (formAcik) {
    return (
      <ScrollView style={styles.kap} contentContainerStyle={styles.icerik}>
        <PageHeader
          baslik={duzenlenen ? "Toplantıyı Düzenle" : "Yeni Toplantı"}
          altBaslik="Gündem ve oylamaları da buradan yönetin"
        />
        <FormInput label="Başlık" ikon="megaphone-outline" placeholder="2026 Genel Kurul Toplantısı" value={baslik} onChangeText={setBaslik} />
        <FormInput label="Açıklama" ikon="document-text-outline" placeholder="Toplantı açıklaması..." multiline numberOfLines={3} value={aciklama} onChangeText={setAciklama} />
        <FormInput label="Tarih ve Saat" ikon="calendar-outline" placeholder="2026-12-01T10:00" value={tarih} onChangeText={setTarih} />
        <FormInput label="Yer" ikon="location-outline" placeholder="Köy Konağı" value={yer} onChangeText={setYer} />
        <FormInput label="Video URL" ikon="videocam-outline" placeholder="https://..." keyboardType="url" value={videoUrl} onChangeText={setVideoUrl} />
        <FormInput label="Tutanak" ikon="document-text-outline" placeholder="Toplantı sonrası tutanak metni..." multiline numberOfLines={4} value={tutanak} onChangeText={setTutanak} />
        <View style={styles.formBolum}>
          <Text style={styles.formBolumBaslik}>Durum</Text>
          <View style={styles.durumSecim}>
            {Object.entries(DURUM_ETIKET).map(([anahtar, etiket]) => (
              <TouchableOpacity
                key={anahtar}
                style={[styles.durumButon, durum === anahtar ? styles.durumButonSecili : null]}
                onPress={() => setDurum(anahtar)}
              >
                <Text style={[styles.durumButonMetin, durum === anahtar ? styles.durumButonMetinSecili : null]}>
                  {etiket}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <GundemDuzenleyici gundem={gundem} setGundem={setGundem} />
        {duzenlenen ? (
          <OylamaBileseni
            toplantiId={duzenlenen.id}
            oylamalar={duzenlenen.oylamalar}
            onDegisti={veriCek}
          />
        ) : null}
        <View style={styles.formAlt}>
          <View style={styles.formAltInce}>
            <Button
              baslik="Vazgeç"
              tur="ince"
              ikon="close-outline"
              onPress={() => {
                setFormAcik(false);
                setDuzenlenen(null);
              }}
            />
          </View>
          <View style={styles.formAltEsas}>
            <Button
              baslik={duzenlenen ? "Güncelle" : "Kaydet"}
              onPress={kaydet}
              yukleniyor={yukleniyorForm}
              butuk
              ikon="checkmark-circle-outline"
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Toplantı Yönetimi" altBaslik="Genel kurul ve yönetim kurulu toplantıları" />
      <AdminListe
        yukleniyor={yukleniyor}
        veriler={veriler}
        bosMetin="Henüz toplantı eklenmemiş"
        bosIkon="people-outline"
        ekleBaslik="Yeni Toplantı"
        onEkle={() => formAc(null)}
        renderSatir={(t) => (
          <AdminSatir
            birincil={t.baslik}
            ikincil={`${t.tarih ? new Date(t.tarih).toLocaleString("tr-TR") : ""}${t.yer ? " · " + t.yer : ""}`}
            rozet={DURUM_ETIKET[t.durum] || t.durum}
            rozetRenk={DURUM_RENK[t.durum] || renkler.ana_600}
            onDuzenle={() => formAc(t)}
            onSil={() => sil(t)}
            silAciklama={`"${t.baslik}" ve tüm bağlı kayıtları silinecek. Emin misiniz?`}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 16, paddingBottom: 40, gap: 12 },
  formBolum: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  formBolumBaslik: { fontSize: 15, fontWeight: "700", color: renkler.metin },
  formBolumAlBaslik: { fontSize: 13, fontWeight: "600", color: renkler.metin_soluk, marginTop: 4 },
  gundemSatir: { flexDirection: "row", alignItems: "center", gap: 8 },
  gundemSayi: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: renkler.ana_100,
    alignItems: "center",
    justifyContent: "center",
  },
  gundemSayiMetin: { fontSize: 12, fontWeight: "700", color: renkler.ana_700 },
  gundemInput: {
    flex: 1,
    backgroundColor: renkler.arkaplan,
    borderWidth: 1,
    borderColor: renkler.sinir,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: renkler.metin,
  },
  gundemSil: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  durumSecim: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  durumButon: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: renkler.sinir,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  durumButonSecili: { backgroundColor: renkler.ana_600, borderColor: renkler.ana_600 },
  durumButonMetin: { fontSize: 14, fontWeight: "600", color: renkler.metin_soluk },
  durumButonMetinSecili: { color: "#fff" },
  oylamaKart: {
    backgroundColor: renkler.arkaplan,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: renkler.sinir,
    padding: 12,
    gap: 6,
  },
  oylamaUst: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  oylamaKonu: { fontSize: 14, fontWeight: "700", color: renkler.metin, flex: 1 },
  oylamaDurum: { fontSize: 12, fontWeight: "700", color: "#2f8f4f" },
  oylamaKapali: { color: renkler.metin_soluk },
  oylamaSecenekler: { fontSize: 13, color: renkler.metin_soluk },
  oylamaSilButon: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" },
  oylamaSilMetin: { fontSize: 13, color: renkler.tehlikeli, fontWeight: "600" },
  secenekYok: { fontSize: 13, color: renkler.metin_soluk },
  formAlt: { flexDirection: "row", gap: 10, marginTop: 6 },
  formAltInce: { flex: 1 },
  formAltEsas: { flex: 2 },
});