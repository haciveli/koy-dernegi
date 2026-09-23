import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { renkler, olcutler } from "../theme";

// Yönetim sayfası ana hedefi: modül listesi
const MODULLER = [
  { anahtar: "YonetimDuyuru", baslik: "Duyurular", aciklama: "Duyuru ekle, düzenle, sil", ikon: "megaphone-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimEtkinlik", baslik: "Etkinlikler", aciklama: "Etkinlik ve kayıtları yönet", ikon: "calendar-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimAidat", baslik: "Aidatlar", aciklama: "Aidat ekle, ödemeleri onayla", ikon: "card-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimBagis", baslik: "Bağışlar", aciklama: "Bağış bildirimlerini onayla", ikon: "heart-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimRehber", baslik: "Köy Rehberi", aciklama: "İşletme ve hizmet kayıtlarını yönet", ikon: "storefront-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimIlan", baslik: "İlanlar", aciklama: "İlanları görüntüle, kapat", ikon: "megaphone-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimToplanti", baslik: "Toplantılar", aciklama: "Gündem, oylama ve tutanak yönetimi", ikon: "people-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimGaleri", baslik: "Galeri", aciklama: "Fotoğrafları yönet", ikon: "images-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimVideo", baslik: "Videolar", aciklama: "Video ekle, düzenle, sil", ikon: "videocam-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimReklam", baslik: "Reklamlar", aciklama: "Reklam alanını yönet", ikon: "megaphone-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimKullanici", baslik: "Üyeler", aciklama: "Kayıtları onayla, rolleri düzenle", ikon: "people-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimIletisim", baslik: "İletişim Mesajları", aciklama: "Gelen mesajları yönet", ikon: "mail-outline", tur: renkler.ana_600 },
  { anahtar: "YonetimAyar", baslik: "Ayarlar", aciklama: "Site adı, iletişim, banner ayarları", ikon: "settings-outline", tur: renkler.ana_600 },
];

export default function Yonetim({ navigation }) {
  const { kullanici } = useAuth();
  const yonetici = kullanici?.rol === "yonetici";
  if (!yonetici) {
    return (
      <View style={styles.kap}>
        <PageHeader baslik="Yönetim" />
        <View style={styles.erisimYok}>
          <Ionicons name="lock-closed-outline" size={52} color={renkler.metin_soluk} />
          <Text style={styles.erisimYokMetin}>Bu bölüm yalnızca yöneticilere açıktır.</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.kap}>
      <PageHeader baslik="Yönetim" altBaslik="Tüm içeriği buradan yönetin" />
      <ScrollView contentContainerStyle={styles.icerik}>
        {MODULLER.map((m) => (
          <TouchableOpacity
            key={m.anahtar}
            style={styles.modulKap}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(m.anahtar)}
          >
            <Ionicons name={m.ikon} size={24} color={m.tur} />
            <View style={styles.modulBilgi}>
              <Text style={styles.modulBaslik}>{m.baslik}</Text>
              <Text style={styles.modulAciklama}>{m.aciklama}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={renkler.metin_soluk} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 16, gap: 10 },
  erisimYok: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  erisimYokMetin: { color: renkler.metin_soluk, fontSize: 15, textAlign: "center", paddingHorizontal: 24 },
  modulKap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.sinir,
    padding: 15,
  },
  modulBilgi: { flex: 1 },
  modulBaslik: { fontSize: 16, fontWeight: "700", color: renkler.metin },
  modulAciklama: { fontSize: 13, color: renkler.metin_soluk, marginTop: 2 },
});
