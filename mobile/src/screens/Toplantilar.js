import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { toplantilar } from "../api";
import PageHeader from "../components/PageHeader";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

const DURUM_ETIKET = {
  planlandi: "Planlandı",
  duzenlendi: "Yapıldı",
  iptal: "İptal Edildi",
};

export default function Toplantilar({ navigation }) {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const veriCek = useCallback(() => {
    toplantilar()
      .then((list) => setVeriler(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      veriCek();
    }, [veriCek])
  );

  if (yukleniyor) return <LoadingView metin="Toplantılar yükleniyor..." />;

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Toplantılar" altBaslik="Genel kurul ve yönetim kurulu toplantıları" />
      <FlatList
        data={veriler}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={<EmptyState ikon="people-outline" metin="Henüz toplantı planlanmamış." />}
        renderItem={({ item }) => {
          const gecmis = new Date(item.tarih) < new Date();
          return (
            <TouchableOpacity
              style={styles.kart}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ToplantiDetay", { toplanti: item })}
            >
              <View style={styles.kartUst}>
                <View style={styles.tarihKutusu}>
                  <Text style={styles.tarihGun}>{new Date(item.tarih).getDate()}</Text>
                  <Text style={styles.tarihAy}>
                    {new Date(item.tarih).toLocaleDateString("tr-TR", { month: "short" })}
                  </Text>
                </View>
                <View style={styles.kartBilgi}>
                  <Text style={styles.baslik} numberOfLines={2}>{item.baslik}</Text>
                  <Text style={styles.kartMeta}>
                    <Ionicons name="time-outline" size={12} />{" "}
                    {new Date(item.tarih).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    {item.yer ? ` · ${item.yer}` : ""}
                  </Text>
                </View>
                <View style={styles.kartSag}>
                  <Ionicons name="chevron-forward" size={18} color={renkler.metin_soluk} />
                </View>
              </View>
              <View style={styles.kartAlt}>
                <View style={styles.rozet}>
                  <Text style={styles.rozetMetin}>
                    {DURUM_ETIKET[item.durum] || item.durum}
                  </Text>
                </View>
                {item.oylamalar?.length > 0 ? (
                  <Text style={styles.oySayisi}>
                    {item.oylamalar.filter((o) => o.aktif).length} aktif oylama
                  </Text>
                ) : null}
                {gecmis && item.tutanak ? (
                  <Text style={styles.tutanakVar}>
                    <Ionicons name="document-text-outline" size={12} /> Tutanak mevcut
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  liste: { padding: 16, paddingBottom: 32, gap: 10 },
  kart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 10,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kartUst: { flexDirection: "row", alignItems: "center", gap: 12 },
  tarihKutusu: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: renkler.ana_100,
    alignItems: "center",
    justifyContent: "center",
  },
  tarihGun: { fontSize: 16, fontWeight: "800", color: renkler.ana_700 },
  tarihAy: { fontSize: 11, color: renkler.ana_500, textTransform: "uppercase" },
  kartBilgi: { flex: 1, gap: 4 },
  baslik: { fontSize: 16, fontWeight: "700", color: renkler.metin },
  kartMeta: { fontSize: 12, color: renkler.metin_soluk },
  kartSag: {},
  kartAlt: { flexDirection: "row", alignItems: "center", gap: 10 },
  rozet: {
    backgroundColor: renkler.ana_100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rozetMetin: { fontSize: 12, fontWeight: "600", color: renkler.ana_700 },
  oySayisi: { fontSize: 12, color: renkler.metin_soluk },
  tutanakVar: { fontSize: 12, color: renkler.metin_soluk },
});