import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { chatMesajlar, chatMesajGonder } from "../api";
import { mesajSaati } from "../utils";
import { useAuth } from "../context/AuthContext";
import { renkler, olcutler } from "../theme";

const YENILEME_ARALIGI = 4000;

export default function Kanal({ route }) {
  const { aliciId, baslik } = route.params || {};
  const { kullanici } = useAuth();
  const [mesajlar, setMesajlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [metin, setMetin] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const listeRef = useRef(null);
  const aralikRef = useRef(null);

  const veriCek = useCallback(async () => {
    try {
      const liste = await chatMesajlar(aliciId);
      setMesajlar(Array.isArray(liste) ? liste : []);
    } catch {
      // sessiz
    } finally {
      setYukleniyor(false);
    }
  }, [aliciId]);

  useFocusEffect(
    useCallback(() => {
      veriCek();
      aralikRef.current = setInterval(veriCek, YENILEME_ARALIGI);
      return () => clearInterval(aralikRef.current);
    }, [veriCek])
  );

  useEffect(() => {
    return () => clearInterval(aralikRef.current);
  }, []);

  const gonder = async () => {
    const icerik = metin.trim();
    if (!icerik) return;
    setGonderiyor(true);
    try {
      await chatMesajGonder(icerik, aliciId);
      setMetin("");
      await veriCek();
    } catch {
      // sessiz
    } finally {
      setGonderiyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.ust}>
        <Text style={styles.ustBaslik}>{baslik || "Sohbet"}</Text>
      </View>

      {yukleniyor ? (
        <View style={styles.yukleniyor}>
          <ActivityIndicator size="large" color={renkler.ana_600} />
        </View>
      ) : (
        <FlatList
          ref={listeRef}
          style={styles.liste}
          contentContainerStyle={styles.listeIcerik}
          data={mesajlar}
          keyExtractor={(madde) => String(madde.id)}
          onContentSizeChange={() => listeRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const benim = item.gonderen_id === kullanici?.id;
            return (
              <View style={[styles.balonSatir, benim ? styles.balonSatirBen : null]}>
                <View style={[styles.balon, benim ? styles.balonBen : styles.balonKarsi]}>
                  {!benim ? (
                    <Text style={styles.balonAd}>
                      {item.gonderen_ad} {item.gonderen_soyad}
                    </Text>
                  ) : null}
                  <Text style={[styles.balonMetin, benim && styles.balonMetinBen]}>
                    {item.icerik}
                  </Text>
                  <Text style={[styles.balonSaat, benim && styles.balonSaatBen]}>
                    {mesajSaati(item.olusturulma_tarihi)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={styles.girdiKuşak}>
        <TextInput
          style={styles.girdi}
          placeholder="Mesajınızı yazın..."
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
          {gonderiyor ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="paper-plane" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  ust: {
    backgroundColor: renkler.ana_600,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  ustBaslik: { color: "#fff", fontSize: 18, fontWeight: "700" },
  yukleniyor: { flex: 1, alignItems: "center", justifyContent: "center" },
  liste: { flex: 1 },
  listeIcerik: { padding: 14, gap: 8, flexGrow: 1, justifyContent: "flex-end" },
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
  balonAd: { fontSize: 11, fontWeight: "700", color: renkler.metin_soluk, marginBottom: 2 },
  balonMetin: { fontSize: 15, color: renkler.metin },
  balonMetinBen: { color: "#fff" },
  balonSaat: {
    fontSize: 10,
    color: renkler.metin_soluk,
    marginTop: 2,
    alignSelf: "flex-end",
  },
  balonSaatBen: { color: renkler.ana_100 },
  girdiKuşak: {
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
});