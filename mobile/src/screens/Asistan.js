import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { asistanSor } from "../api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import { renkler, olcutler } from "../theme";

const KARSILAMA =
  "Merhaba, ben derneğinizin bilgi asistanıyım. Üyelik, aidat, bağış, etkinlik ve duyurular hakkında sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?";

export default function Asistan({ navigation }) {
  const { token, kullanici } = useAuth();
  const ic = useSafeAreaInsets();
  const [mesajlar, setMesajlar] = useState([
    { id: "karsilama", rol: "asistan", icerik: KARSILAMA },
  ]);
  const [metin, setMetin] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const listeRef = useRef(null);

  const gonder = async () => {
    const icerik = metin.trim();
    if (!icerik || gonderiyor) return;
    setMesajlar((m) => [...m, { id: `ben-${Date.now()}`, rol: "ben", icerik }]);
    setMetin("");
    setGonderiyor(true);
    try {
      const yanit = await asistanSor(icerik);
      setMesajlar((m) => [
        ...m,
        { id: `asistan-${Date.now()}`, rol: "asistan", icerik: yanit.cevap || "Cevap alınamadı." },
      ]);
    } catch (e) {
      let hata = "Cevap alınamadı. Lütfen tekrar deneyin.";
      if (e && e.durum === 429) hata = "Çok hızlı soruyorsunuz, birkaç saniye bekleyin.";
      else if (e && e.message) hata = e.message;
      setMesajlar((m) => [...m, { id: `hata-${Date.now()}`, rol: "asistan", icerik: hata, hatali: true }]);
    } finally {
      setGonderiyor(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.girisGerekli}>
        <Ionicons name="sparkles" size={56} color={renkler.ana_300} />
        <Text style={styles.girisGerekliBaslik}>Yapay Zeka Asistanı</Text>
        <Text style={styles.girisGerekliMetin}>
          Dernek asistanına soru sormak için giriş yapmanız gerekiyor.
        </Text>
        <Button
          baslik="Üye Girişi"
          onPress={() => navigation.navigate("ProfilTab")}
          ikon="log-in-outline"
          style={styles.girisButon}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.kap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <PageHeader
        baslik="Yapay Zeka Asistanı"
        altBaslik={`Merhaba ${kullanici?.ad || ""}, dernekle ilgili sorularını yanıtlarım`}
      />
      <FlatList
        ref={listeRef}
        style={styles.liste}
        contentContainerStyle={styles.listeIcerik}
        data={mesajlar}
        keyExtractor={(madde) => String(madde.id)}
        onContentSizeChange={() => listeRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const benim = item.rol === "ben";
          return (
            <View style={[styles.balonSatir, benim ? styles.balonSatirBen : null]}>
              <View style={[styles.balon, benim ? styles.balonBen : styles.balonKarsi]}>
                {!benim ? (
                  <View style={styles.ustSatir}>
                    <Ionicons name="sparkles" size={12} color={renkler.ana_600} />
                    <Text style={styles.balonAd}>Dernek Asistanı</Text>
                  </View>
                ) : null}
                <Text style={[styles.balonMetin, benim && styles.balonMetinBen]}>
                  {item.icerik}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          gonderiyor ? (
            <View style={[styles.balonSatir]}>
              <View style={[styles.balon, styles.balonKarsi]}>
                <View style={styles.ustSatir}>
                  <Ionicons name="sparkles" size={12} color={renkler.ana_600} />
                  <Text style={styles.balonAd}>Dernek Asistanı</Text>
                </View>
                <View style={styles.yaziyorSatir}>
                  <ActivityIndicator size="small" color={renkler.ana_600} />
                  <Text style={styles.yaziyor}>yazıyor...</Text>
                </View>
              </View>
            </View>
          ) : null
        }
      />
      <View style={[styles.girdiKusak, { paddingBottom: Math.max(ic.bottom, 12) }]}>
        <TextInput
          style={styles.girdi}
          placeholder="Dernekle ilgili sorunuzu yazın..."
          placeholderTextColor={renkler.metin_soluk}
          value={metin}
          onChangeText={setMetin}
          multiline
        />
        <TouchableOpacity
          style={[styles.gonder, (gonderiyor || !metin.trim()) && styles.gonderPasif]}
          onPress={gonder}
          disabled={gonderiyor || !metin.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  liste: { flex: 1 },
  listeIcerik: { padding: 14, gap: 8, flexGrow: 1 },
  balonSatir: { alignItems: "flex-start" },
  balonSatirBen: { alignItems: "flex-end" },
  balon: {
    maxWidth: "82%",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balonBen: {
    backgroundColor: renkler.ana_600,
    borderBottomRightRadius: 4,
  },
  balonKarsi: {
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
    borderBottomLeftRadius: 4,
  },
  ustSatir: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  balonAd: { fontSize: 11, fontWeight: "700", color: renkler.metin_soluk },
  balonMetin: { fontSize: 15, color: renkler.metin },
  balonMetinBen: { color: "#fff" },
  yaziyor: { fontSize: 14, color: renkler.metin_soluk, marginLeft: 6 },
  yaziyorSatir: { flexDirection: "row", alignItems: "center" },
  girdiKusak: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: renkler.kart,
    borderTopWidth: 1,
    borderTopColor: renkler.sinir,
  },
  girdi: {
    flex: 1,
    backgroundColor: renkler.arkaplan,
    borderRadius: olcutler.buton_radius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 110,
    fontSize: 15,
    color: renkler.metin,
  },
  gonder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: renkler.ana_600,
    alignItems: "center",
    justifyContent: "center",
  },
  gonderPasif: { backgroundColor: renkler.ana_300 },
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