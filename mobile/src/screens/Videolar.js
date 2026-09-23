import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { videolar } from "../api";
import { resimUrl } from "../config";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

export default function Videolar() {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let gecerli = true;
      videolar()
        .then((list) => {
          if (gecerli) setVeriler(Array.isArray(list) ? list : []);
        })
        .catch(() => {})
        .finally(() => gecerli && setYukleniyor(false));
      return () => {
        gecerli = false;
      };
    }, [])
  );

  const oynat = (video) => {
    if (video.video_url) {
      Linking.openURL(video.video_url).catch(() => {});
    }
  };

  if (yukleniyor) return <LoadingView metin="Videolar yükleniyor..." />;

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Videolar" altBaslik="Köyümüzden görüntüler ve etkinlik kayıtları" />
      <FlatList
        data={veriler}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={renkler.ana_600}
            onRefresh={() => {
              videolar()
                .then((list) => setVeriler(Array.isArray(list) ? list : []))
                .catch(() => {});
            }}
          />
        }
        ListEmptyComponent={<EmptyState ikon="videocam-outline" metin="Henüz video yüklenmemiş." />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.kart} activeOpacity={0.9} onPress={() => oynat(item)}>
            <View style={styles.kapakKap}>
              {item.kapak_url ? (
                <Image source={{ uri: resimUrl(item.kapak_url) }} style={styles.kapak} resizeMode="cover" />
              ) : (
                <View style={[styles.kapak, styles.kapakYedek]}>
                  <Ionicons name="film-outline" size={40} color={renkler.ana_300} />
                </View>
              )}
              <View style={styles.oynat}>
                <Ionicons name="play" size={28} color="#fff" />
              </View>
            </View>
            <View style={styles.kartAlt}>
              <Text style={styles.baslik}>{item.baslik}</Text>
              {item.aciklama ? (
                <Text style={styles.aciklama} numberOfLines={2}>
                  {item.aciklama}
                </Text>
              ) : null}
              {item.kategori ? <Badge metin={item.kategori} renk={renkler.vurgu_600} /> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  liste: { padding: 16, paddingBottom: 32 },
  kart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  kapakKap: { position: "relative" },
  kapak: { width: "100%", height: 170, backgroundColor: renkler.ana_100 },
  kapakYedek: {
    alignItems: "center",
    justifyContent: "center",
  },
  oynat: {
    position: "absolute",
    alignSelf: "center",
    top: "38%",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    padding: 14,
  },
  kartAlt: { padding: 14, gap: 6 },
  baslik: { fontSize: 16, fontWeight: "700", color: renkler.metin },
  aciklama: { fontSize: 13, color: renkler.metin_soluk, lineHeight: 19 },
});