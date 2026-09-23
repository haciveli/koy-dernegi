import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { chatSonDurum } from "../api";
import { kisaAd } from "../utils";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

export default function Sohbet({ navigation }) {
  const { token, kullanici } = useAuth();
  const [durum, setDurum] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setYukleniyor(false);
        return;
      }
      let gecerli = true;
      chatSonDurum()
        .then((veri) => {
          if (gecerli) setDurum(veri);
        })
        .catch(() => {})
        .finally(() => gecerli && setYukleniyor(false));
      return () => {
        gecerli = false;
      };
    }, [token])
  );

  if (!token) {
    return (
      <View style={styles.girisGerekli}>
        <Ionicons name="chatbubbles-outline" size={56} color={renkler.ana_300} />
        <Text style={styles.girisGerekliBaslik}>Üye Sohbeti</Text>
        <Text style={styles.girisGerekliMetin}>
          Üyelerle mesajlaşmak için giriş yapmanız gerekiyor.
        </Text>
        <Button baslik="Üye Girişi" onPress={() => navigation.navigate("ProfilTab")} butuk ikon="log-in-outline" style={styles.girisButon} />
      </View>
    );
  }

  if (yukleniyor) return <LoadingView metin="Sohbet yükleniyor..." />;

  const genel = durum?.genel;
  const uyeler = durum?.uyeler || [];

  const kanalDuzenle = (kisiId, ad, soyad, ozet) => ({
    id: kisiId,
    ad,
    soyad,
    ozet,
  });

  const kanallar = [
    kanalDuzenle("genel", "Genel Sohbet", "", genel || {}),
    ...uyeler.map((u) => kanalDuzenle(u.id, u.ad, u.soyad, u)),
  ];

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Üye Sohbeti" altBaslik={`Merhaba ${kullanici?.ad} ${kullanici?.soyad}, üyelerle mesajlaşın`} />
      <FlatList
        data={kanallar}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={renkler.ana_600}
            onRefresh={() => {
              chatSonDurum()
                .then(setDurum)
                .catch(() => {});
            }}
          />
        }
        ListEmptyComponent={<EmptyState ikon="people-outline" metin="Henüz sohbet edilecek üye yok." />}
        renderItem={({ item }) => {
          const okunmamis = item.ozet?.okunmamis || 0;
          const son = item.ozet?.son_mesaj;
          return (
            <TouchableOpacity
              style={styles.satir}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("Kanal", {
                  aliciId: item.id === "genel" ? null : item.id,
                  baslik: item.id === "genel" ? "Genel Sohbet" : `${item.ad} ${item.soyad}`,
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarMetin}>
                  {item.id === "genel" ? "G" : kisaAd(item.ad, item.soyad)}
                </Text>
              </View>
              <View style={styles.satirIcerik}>
                <Text style={styles.isim}>{item.ad} {item.soyad}</Text>
                <Text style={styles.sonMesaj} numberOfLines={1}>
                  {son || "Henüz mesaj yok"}
                </Text>
              </View>
              {okunmamis > 0 ? (
                <View style={styles.rozet}>
                  <Text style={styles.rozetMetin}>{okunmamis}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  liste: { padding: 16, paddingBottom: 32 },
  satir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: renkler.ana_600,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMetin: { color: "#fff", fontSize: 16, fontWeight: "700" },
  satirIcerik: { flex: 1, gap: 2 },
  isim: { fontSize: 15, fontWeight: "600", color: renkler.metin },
  sonMesaj: { fontSize: 13, color: renkler.metin_soluk },
  rozet: {
    backgroundColor: renkler.tehlikeli,
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  rozetMetin: { color: "#fff", fontSize: 12, fontWeight: "700" },
  girisGerekli: {
    flex: 1,
    backgroundColor: renkler.arkaplan,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  girisGerekliBaslik: { fontSize: 20, fontWeight: "800", color: renkler.metin },
  girisGerekliMetin: {
    fontSize: 14,
    color: renkler.metin_soluk,
    textAlign: "center",
  },
  girisButon: { marginTop: 8, alignSelf: "stretch" },
});