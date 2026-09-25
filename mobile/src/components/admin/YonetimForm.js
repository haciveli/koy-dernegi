import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import FormInput from "../FormInput";
import Button from "../Button";
import PageHeader from "../PageHeader";
import { dosyaYukle } from "../../api";
import { renkler, olcutler } from "../../theme";

function MedyaSec({ alan, deger, formDegistir }) {
  const [yukleniyor, setYukleniyor] = useState(false);

  const secVeYukle = async () => {
    try {
      const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!izin.granted) {
        Alert.alert("İzin Gerekli", "Medya kütüphanesine erişim izni gerekiyor.");
        return;
      }
      const sonuc = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: alan.dosya === "video" ? ["videos"] : ["images"],
        allowsEditing: false,
        quality: 0.8,
      });
      if (sonuc.canceled || !sonuc.assets?.length) return;
      const varlik = sonuc.assets[0];
      setYukleniyor(true);
      const ad = alan.dosya === "video" ? "video" : "resim";
      const uzanti = (varlik.fileName?.split(".").pop() || (alan.dosya === "video" ? "mp4" : "jpg")).toLowerCase();
      const mime = alan.dosya === "video" ? `video/${uzanti}` : `image/${uzanti === "jpeg" ? "jpeg" : uzanti}`;
      const sonucYukle = await dosyaYukle(varlik.uri, `${ad}_${Date.now()}.${uzanti}`, mime);
      formDegistir(alan.anahtar, sonucYukle.url);
    } catch (hata) {
      Alert.alert("Hata", hata?.message || "Dosya yüklenemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <View style={styles.medyaKap}>
      <TouchableOpacity style={styles.medyaButon} activeOpacity={0.8} onPress={secVeYukle} disabled={yukleniyor}>
        {yukleniyor ? (
          <ActivityIndicator color={renkler.ana_600} />
        ) : (
          <>
            <Ionicons name={alan.dosya === "video" ? "videocam-outline" : "cloud-upload-outline"} size={18} color={renkler.ana_600} />
            <Text style={styles.medyaButonMetin}>
              {deger ? "Başka dosya seç (güncelle)" : `${alan.etiket} Seç & Yükle`}
            </Text>
          </>
        )}
      </TouchableOpacity>
      {deger ? <Text style={styles.medyaYuklendi}>Yüklendi: {deger}</Text> : null}
    </View>
  );
}

// Yönetim kayıt formlarının ortak iskeleti:
// başlık + alan listesi + Kaydet/Vazgeç
// alanlar: [{ anahtar, etiket, ikon, placeholder, multiline, keyboardType, sayisal, yan, dosya, secim }]
export default function YonetimForm({
  baslik,
  altBaslik,
  alanlar = [],
  formDeger,
  formDegistir,
  onKaydet,
  yukleniyor = false,
  onVazgec,
  kaydetBaslik = "Kaydet",
  secimSecenekler = {},
}) {
  const [secimAcik, setSecimAcik] = useState(null);

  const aktifSecim = alanlar.find((a) => a.secim && a.anahtar === secimAcik);
  const aktifSecenekler = aktifSecim ? (secimSecenekler[aktifSecim.secim] ?? []) : [];

  return (
    <KeyboardAvoidingView
      style={styles.kap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.kap}
        contentContainerStyle={styles.icerik}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader baslik={baslik} altBaslik={altBaslik} />
        {alanlar.map((alan) => {
          const deger = formDeger?.[alan.anahtar] ?? "";
          if (alan.dosya) {
            return <MedyaSec key={alan.anahtar} alan={alan} deger={deger} formDegistir={formDegistir} />;
          }
          if (alan.secim) {
            const seceneklerBu = secimSecenekler[alan.secim] ?? [];
            const secili = seceneklerBu.find((s) => String(s.deger) === String(formDeger?.[alan.anahtar] ?? ""));
            return (
              <View key={alan.anahtar} style={styles.secimKap}>
                <Text style={styles.secimEtiket}>{alan.etiket}</Text>
                <TouchableOpacity
                  style={styles.secimButon}
                  activeOpacity={0.8}
                  onPress={() => setSecimAcik(alan.anahtar)}
                >
                  {secili ? (
                    <Text style={styles.secimMetin}>{secili.etiket}</Text>
                  ) : (
                    <Text style={styles.secimYerTutucu}>{alan.placeholder ?? "Seçin..."}</Text>
                  )}
                  <Ionicons name="chevron-down" size={18} color={renkler.metin_soluk} />
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <FormInput
              key={alan.anahtar}
              label={alan.etiket}
              ikon={alan.ikon}
              placeholder={alan.placeholder ?? alan.etiket}
              multiline={alan.multiline}
              numberOfLines={alan.multiline ? 5 : undefined}
              keyboardType={alan.keyboardType}
              autoCapitalize={alan.yazim ?? "sentences"}
              value={String(deger ?? "")}
              onChangeText={(yeni) => {
                let sonuc = yeni;
                if (alan.sayisal) sonuc = yeni.replace(/[^0-9]/g, "");
                formDegistir(alan.anahtar, sonuc);
              }}
            />
          );
        })}
        <View style={styles.alt}>
          <View style={styles.altInce}>
            {onVazgec ? <Button baslik="Vazgeç" tur="ince" onPress={onVazgec} ikon="close-outline" /> : null}
          </View>
          <View style={styles.altEsas}>
            <Button
              baslik={kaydetBaslik}
              onPress={onKaydet}
              yukleniyor={yukleniyor}
              butuk
              ikon="checkmark-circle-outline"
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={!!secimAcik} transparent animationType="slide" onRequestClose={() => setSecimAcik(null)}>
        <TouchableOpacity style={styles.modalSise} activeOpacity={1} onPress={() => setSecimAcik(null)}>
          <View style={styles.modalKutu}>
            <Text style={styles.modalBaslik}>{aktifSecim?.etiket ?? "Seçim"}</Text>
            <FlatList
              data={aktifSecenekler}
              keyExtractor={(s, i) => String(s.deger ?? i)}
              renderItem={({ item }) => {
                const seciliMi = String(item.deger) === String(formDeger?.[aktifSecim?.anahtar] ?? "");
                return (
                  <TouchableOpacity
                    style={[styles.modalSatir, seciliMi && styles.modalSatirAktif]}
                    activeOpacity={0.7}
                    onPress={() => {
                      formDegistir(aktifSecim.anahtar, String(item.deger));
                      setSecimAcik(null);
                    }}
                  >
                    <Text style={[styles.modalSatirMetin, seciliMi && styles.modalSatirMetinAktif]}>{item.etiket}</Text>
                    {seciliMi ? <Ionicons name="checkmark" size={18} color={renkler.ana_600} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.modalKapat} onPress={() => setSecimAcik(null)}>
              <Text style={styles.modalKapatMetin}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 20, paddingBottom: 40 },
  alt: { flexDirection: "row", gap: 10, marginTop: 10 },
  altInce: { flex: 1 },
  altEsas: { flex: 2 },
  medyaKap: { gap: 6, marginBottom: 14 },
  medyaButon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: olcutler.buton_radius,
    borderWidth: 1,
    borderColor: renkler.ana_400,
    borderStyle: "dashed",
    backgroundColor: renkler.ana_50,
  },
  medyaButonMetin: { color: renkler.ana_600, fontSize: 15, fontWeight: "600" },
  medyaYuklendi: { color: renkler.basarili, fontSize: 12 },
  secimKap: { gap: 6, marginBottom: 14 },
  secimEtiket: { fontSize: 13, fontWeight: "600", color: renkler.metin_soluk },
  secimButon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
    borderRadius: olcutler.buton_radius,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  secimMetin: { fontSize: 15, color: renkler.metin },
  secimYerTutucu: { fontSize: 15, color: renkler.metin_soluk },
  modalSise: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalKutu: {
    backgroundColor: renkler.arkaplan,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: "70%",
  },
  modalBaslik: { fontSize: 17, fontWeight: "700", color: renkler.metin, paddingHorizontal: 20, marginBottom: 8 },
  modalSatir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: renkler.sinir,
  },
  modalSatirAktif: { backgroundColor: renkler.ana_50 },
  modalSatirMetin: { fontSize: 15, color: renkler.metin },
  modalSatirMetinAktif: { color: renkler.ana_600, fontWeight: "700" },
  modalKapat: { marginTop: 6, alignItems: "center", paddingVertical: 14 },
  modalKapatMetin: { color: renkler.tehlikeli, fontSize: 15, fontWeight: "700" },
});
