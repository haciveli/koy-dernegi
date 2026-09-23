import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { galeri } from "../api";
import { resimUrl } from "../config";
import PageHeader from "../components/PageHeader";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

const NUMARALAR = 2;

export default function Galeri() {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secili, setSecili] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let gecerli = true;
      galeri()
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

  if (yukleniyor) return <LoadingView metin="Galeri yükleniyor..." />;

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Fotoğraf Galerisi" altBaslik="Köyümüzün ve derneğimizin anıları" />
      <FlatList
        data={veriler}
        keyExtractor={(madde) => String(madde.id)}
        numColumns={NUMARALAR}
        columnWrapperStyle={styles.sutun}
        contentContainerStyle={styles.liste}
        refreshControl={
          <RefreshControl
            tintColor={renkler.ana_600}
            onRefresh={() => {
              galeri()
                .then((list) => setVeriler(Array.isArray(list) ? list : []))
                .catch(() => {});
            }}
          />
        }
        ListEmptyComponent={<EmptyState ikon="images-outline" metin="Henüz fotoğraf yüklenmemiş." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.kart}
            activeOpacity={0.9}
            onPress={() => setSecili(item)}
          >
            <Image source={{ uri: resimUrl(item.resim_url) }} style={styles.gorsel} resizeMode="cover" />
            <View style={styles.kartUst}>
              <Text style={styles.baslik} numberOfLines={1}>
                {item.baslik}
              </Text>
              {item.aciklama ? (
                <Text style={styles.aciklama} numberOfLines={2}>
                  {item.aciklama}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!secili} transparent animationType="fade">
        <View style={styles.modal}>
          <Pressable style={styles.modalKapatma} onPress={() => setSecili(null)} />
          {secili ? (
            <>
              <Image source={{ uri: resimUrl(secili.resim_url) }} style={styles.modalGorsel} resizeMode="contain" />
              <View style={styles.modalAlt}>
                <Text style={styles.modalBaslik}>{secili.baslik}</Text>
                {secili.aciklama ? <Text style={styles.modalAciklama}>{secili.aciklama}</Text> : null}
              </View>
              <TouchableOpacity style={styles.kapat} onPress={() => setSecili(null)}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  liste: { padding: 16, paddingBottom: 32 },
  sutun: { gap: 10 },
  kart: {
    flex: 1,
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    overflow: "hidden",
    marginBottom: 10,
  },
  gorsel: { width: "100%", height: 120, backgroundColor: renkler.ana_100 },
  kartUst: { padding: 10, gap: 2 },
  baslik: { fontSize: 14, fontWeight: "600", color: renkler.metin },
  aciklama: { fontSize: 12, color: renkler.metin_soluk },
  modal: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
  modalKapatma: { flex: 1 },
  modalGorsel: { width: "100%", height: "60%", marginTop: 60 },
  modalAlt: { padding: 20, gap: 6 },
  modalBaslik: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalAciklama: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
  kapat: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    padding: 8,
  },
});