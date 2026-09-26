import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ilanlar, ilanEkle } from "../api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import { renkler, olcutler } from "../theme";

const KATEGORILER = ["Tümü", "Satılık", "Alınık", "Bulundu", "Kayıp", "Diğer"];

const KATEGORI_IKON = {
  "Satılık": "pricetag-outline",
  "Alınık": "cart-outline",
  "Bulundu": "checkmark-circle-outline",
  "Kayıp": "help-circle-outline",
  "Diğer": "grid-outline",
};

export default function Ilanlar() {
  const { token } = useAuth();
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliKategori, setSeciliKategori] = useState("Tümü");
  const [formAcik, setFormAcik] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [form, setForm] = useState({
    baslik: "",
    kategori: "Satılık",
    fiyat: "",
    aciklama: "",
    telefon: "",
  });

  const veriCek = useCallback(() => {
    ilanlar()
      .then((list) => setVeriler(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  if (yukleniyor) return <LoadingView metin="İlan panosu yükleniyor..." />;

  const goruntulenen =
    seciliKategori === "Tümü"
      ? veriler
      : veriler.filter((i) => i.kategori === seciliKategori);

  const ara = (telefon) => {
    if (telefon) Linking.openURL(`tel:${telefon.replace(/[^0-9+]/g, "")}`).catch(() => {});
  };

  const gonder = () => {
    if (!form.baslik.trim()) {
      Alert.alert("Uyarı", "Lütfen ilan başlığını yazın.");
      return;
    }
    if (!form.aciklama.trim()) {
      Alert.alert("Uyarı", "Lütfen ilan açıklamasını yazın.");
      return;
    }
    setGonderiliyor(true);
    ilanEkle({
      baslik: form.baslik.trim(),
      kategori: form.kategori,
      fiyat: parseInt(form.fiyat || "0", 10),
      aciklama: form.aciklama.trim(),
      telefon: form.telefon.trim() || null,
    })
      .then(() => {
        Alert.alert("Başarılı", "İlanınız yayınlandı.");
        setFormAcik(false);
        setForm({ baslik: "", kategori: "Satılık", fiyat: "", aciklama: "", telefon: "" });
        veriCek();
      })
      .catch(() => Alert.alert("Hata", "İlan eklenirken bir sorun oluştu."))
      .finally(() => setGonderiliyor(false));
  };

  return (
    <View style={styles.kap}>
      <PageHeader baslik="İlan Panosu" altBaslik="Köy içi alım satım, bulundu ve kayıp ilanları" />
      {token ? (
        <TouchableOpacity style={styles.ekleButon} onPress={() => setFormAcik(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.ekleButonMetin}>İlan Ver</Text>
        </TouchableOpacity>
      ) : null}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kategoriBar}
        contentContainerStyle={styles.kategoriKap}
        data={KATEGORILER}
        keyExtractor={(k) => k}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.kategoriChip, seciliKategori === item ? styles.kategoriChipAktif : null]}
            onPress={() => setSeciliKategori(item)}
          >
            <Text
              style={[styles.kategoriMetin, seciliKategori === item ? styles.kategoriMetinAktif : null]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={goruntulenen}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={<EmptyState ikon="megaphone-outline" metin="Henüz ilan yok." />}
        renderItem={({ item }) => (
          <View style={styles.kart}>
            <View style={styles.kartUst}>
              <Ionicons
                name={KATEGORI_IKON[item.kategori] || "grid-outline"}
                size={20}
                color={renkler.ana_600}
              />
              <View style={styles.kartBaslikKap}>
                <Text style={styles.baslik}>{item.baslik}</Text>
                {item.kullanici_ad ? (
                  <Text style={styles.sahip}>
                    {item.kullanici_ad} {item.kullanici_soyad || ""}
                  </Text>
                ) : null}
              </View>
              <View style={styles.kategoriRozet}>
                <Text style={styles.kategoriRozetMetin}>{item.kategori}</Text>
              </View>
              {item.fiyat > 0 ? <Text style={styles.fiyat}>{item.fiyat.toLocaleString("tr-TR")} ₺</Text> : null}
            </View>
            <Text style={styles.aciklama}>{item.aciklama}</Text>
            {item.telefon ? (
              <TouchableOpacity style={styles.arama} onPress={() => ara(item.telefon)}>
                <Ionicons name="call-outline" size={15} color={renkler.ana_100} />
                <Text style={styles.aramaMetin}>{item.telefon}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />

      <Modal visible={formAcik} transparent animationType="slide">
        <View style={styles.modalKap}>
          <View style={styles.modal}>
            <View style={styles.modalUst}>
              <Text style={styles.modalBaslik}>İlan Ver</Text>
              <TouchableOpacity onPress={() => setFormAcik(false)}>
                <Ionicons name="close" size={24} color={renkler.metin} />
              </TouchableOpacity>
            </View>
            <FormInput label="Başlık" ikon="pricetag-outline" value={form.baslik} onChangeText={(v) => setForm({ ...form, baslik: v })} placeholder="Ne satıyorsunuz?" />
            <View style={styles.kategoriSecim}>
              {["Satılık", "Alınık", "Bulundu", "Kayıp", "Diğer"].map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.secimChip, form.kategori === k ? styles.secimChipAktif : null]}
                  onPress={() => setForm({ ...form, kategori: k })}
                >
                  <Text style={[styles.secimMetin, form.kategori === k ? styles.secimMetinAktif : null]}>
                    {k}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FormInput label="Fiyat (₺)" ikon="cash-outline" keyboardType="numeric" value={form.fiyat} onChangeText={(v) => setForm({ ...form, fiyat: v })} placeholder="0" />
            <FormInput label="Açıklama" ikon="document-text-outline" multiline value={form.aciklama} onChangeText={(v) => setForm({ ...form, aciklama: v })} placeholder="Açıklama yazın..." />
            <FormInput label="Telefon (opsiyonel)" ikon="call-outline" keyboardType="phone-pad" value={form.telefon} onChangeText={(v) => setForm({ ...form, telefon: v })} placeholder="0532 111 22 33" />
            <Button baslik="İlanı Yayınla" onPress={gonder} yukleniyor={gonderiliyor} ikon="megaphone-outline" butuk />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  ekleButon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-end",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: renkler.ana_600,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ekleButonMetin: { color: "#fff", fontWeight: "700", fontSize: 13 },
  kategoriBar: { flexGrow: 0 },
  kategoriKap: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  kategoriChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  kategoriChipAktif: { backgroundColor: renkler.ana_600, borderColor: renkler.ana_600 },
  kategoriMetin: { fontSize: 13, fontWeight: "600", color: renkler.metin_soluk },
  kategoriMetinAktif: { color: "#fff" },
  liste: { padding: 16, paddingBottom: 32, gap: 10 },
  kart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 8,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kartUst: { flexDirection: "row", alignItems: "center", gap: 10 },
  kartBaslikKap: { flex: 1, gap: 2 },
  baslik: { fontSize: 16, fontWeight: "700", color: renkler.metin },
  sahip: { fontSize: 12, color: renkler.metin_soluk },
  kategoriRozet: {
    backgroundColor: renkler.ana_100,
    borderColor: renkler.ana_300,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  kategoriRozetMetin: { fontSize: 12, fontWeight: "700", color: renkler.ana_700 },
  fiyat: { fontSize: 16, fontWeight: "800", color: renkler.ana_700 },
  aciklama: { fontSize: 14, color: renkler.metin_soluk, lineHeight: 20 },
  arama: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: renkler.ana_600,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aramaMetin: { fontSize: 13, fontWeight: "600", color: "#fff" },
  modalKap: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: renkler.arkaplan,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalUst: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalBaslik: { fontSize: 18, fontWeight: "700", color: renkler.metin },
  kategoriSecim: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  secimChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  secimChipAktif: { backgroundColor: renkler.ana_600, borderColor: renkler.ana_600 },
  secimMetin: { fontSize: 13, fontWeight: "600", color: renkler.metin_soluk },
  secimMetinAktif: { color: "#fff" },
});