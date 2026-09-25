import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { renkler, olcutler } from "../../theme";

// Yönetim ekranlarının ortak liste iskeleti:
// yükleme durumu, boş durum, satır eylemleri (düzenle/sil) ve sabit "Yeni Ekle" düğmesi
export default function AdminListe({
  yukleniyor = false,
  veriler = [],
  bosMetin = "Henüz kayıt yok",
  bosIkon = "file-tray-outline",
  altMetin,
  ekleBaslik = "Yeni Ekle",
  onEkle,
  ikincilBaslik,
  onIkincil,
  ikincilIkon = "notifications-outline",
  renderSatir,
}) {
  if (yukleniyor) {
    return (
      <View style={styles.kap}>
        <View style={styles.merkez}>
          <ActivityIndicator size="large" color={renkler.ana_600} />
          <Text style={styles.merkezMetin}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.kap}>
      <FlatList
        data={veriler}
        keyExtractor={(madde, i) => String(madde.id ?? i)}
        contentContainerStyle={[styles.listeIcerik, veriler.length === 0 ? styles.listeBos : null]}
        ListEmptyComponent={
          <View style={styles.bosKap}>
            <Ionicons name={bosIkon} size={52} color={renkler.metin_soluk} />
            <Text style={styles.bosMetin}>{bosMetin}</Text>
            {altMetin ? <Text style={styles.bosAltMetin}>{altMetin}</Text> : null}
          </View>
        }
        renderItem={({ item }) => <View style={styles.satirKap}>{renderSatir(item)}</View>}
      />
      {onEkle || onIkincil ? (
        <View style={styles.sabitAlt}>
          {onEkle ? (
            <TouchableOpacity style={[styles.sabitButon, onIkincil ? styles.sabitButonYarim : null]} activeOpacity={0.85} onPress={onEkle}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.sabitButonMetin}>{ekleBaslik}</Text>
            </TouchableOpacity>
          ) : null}
          {onIkincil ? (
            <TouchableOpacity style={[styles.sabitButon, styles.sabitButonIkincil, onEkle ? styles.sabitButonYarim : null]} activeOpacity={0.85} onPress={onIkincil}>
              <Ionicons name={ikincilIkon} size={18} color={renkler.ana_600} />
              <Text style={styles.sabitButonMetinIkincil}>{ikincilBaslik}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// Tek satır: bilgi + rozet + düzenle/sil
export function AdminSatir({
  birincil,
  ikincil,
  rozet,
  rozetRenk = renkler.ana_600,
  durumRenk,
  onDuzenle,
  onRol,
  onSil,
  silAciklama = "Bu kayıt kalıcı olarak silinecek. Emin misiniz?",
}) {
  const silOnay = () =>
    Alert.alert("Sil", silAciklama, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: onSil },
    ]);
  return (
    <View style={[styles.satir, durumRenk ? { borderLeftWidth: 4, borderLeftColor: durumRenk } : null]}>
      {onDuzenle ? (
        <TouchableOpacity style={styles.satirAna} activeOpacity={0.8} onPress={onDuzenle}>
          <Text style={styles.birincil} numberOfLines={2}>{birincil}</Text>
          {ikincil ? <Text style={styles.ikincil} numberOfLines={3}>{ikincil}</Text> : null}
          {rozet ? (
            <View style={[styles.rozet, { backgroundColor: rozetRenk }]}>
              <Text style={styles.rozetMetin}>{rozet}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.satirAna}>
          <Text style={styles.birincil} numberOfLines={2}>{birincil}</Text>
          {ikincil ? <Text style={styles.ikincil} numberOfLines={3}>{ikincil}</Text> : null}
          {rozet ? (
            <View style={[styles.rozet, { backgroundColor: rozetRenk }]}>
              <Text style={styles.rozetMetin}>{rozet}</Text>
            </View>
          ) : null}
        </View>
      )}
      <View style={styles.satirAksiyon}>
        {onRol ? (
          <TouchableOpacity style={[styles.aksiyonButon, styles.aksiyonRol]} activeOpacity={0.7} onPress={onRol}>
            <Ionicons name="swap-horizontal" size={18} color={renkler.ana_600} />
          </TouchableOpacity>
        ) : null}
        {onDuzenle ? (
          <TouchableOpacity style={styles.aksiyonButon} activeOpacity={0.7} onPress={onDuzenle}>
            <Ionicons name="pencil-outline" size={18} color={renkler.ana_600} />
          </TouchableOpacity>
        ) : null}
        {onSil ? (
          <TouchableOpacity style={[styles.aksiyonButon, styles.aksiyonSil]} activeOpacity={0.7} onPress={silOnay}>
            <Ionicons name="trash-outline" size={18} color={renkler.tehlikeli} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  merkez: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  merkezMetin: { color: renkler.metin_soluk, fontSize: 14 },
  listeIcerik: { padding: 16, gap: 10, paddingBottom: 110 },
  listeBos: { flexGrow: 1 },
  satirKap: { marginBottom: 2 },
  satir: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    borderWidth: 1,
    borderColor: renkler.sinir,
    paddingRight: 6,
  },
  satirAna: { flex: 1, padding: 14, gap: 4 },
  birincil: { fontSize: 15, fontWeight: "700", color: renkler.metin },
  ikincil: { fontSize: 13, color: renkler.metin_soluk },
  rozet: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  rozetMetin: { color: "#fff", fontSize: 11, fontWeight: "700" },
  satirAksiyon: { flexDirection: "row", gap: 6, paddingRight: 4 },
  aksiyonButon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: renkler.ana_50,
    alignItems: "center",
    justifyContent: "center",
  },
  aksiyonSil: { backgroundColor: "#fdecec" },
  aksiyonRol: { backgroundColor: renkler.ana_50 },
  sabitAlt: { position: "absolute", left: 16, right: 16, bottom: 28, flexDirection: "row", gap: 10 },
  sabitButon: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: renkler.ana_600,
    paddingVertical: 14,
    borderRadius: olcutler.buton_radius,
  },
  sabitButonIkincil: {
    backgroundColor: renkler.ana_50,
    borderWidth: 1,
    borderColor: renkler.ana_300,
  },
  sabitButonYarim: { flex: 1 },
  sabitButonMetin: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sabitButonMetinIkincil: { color: renkler.ana_700, fontSize: 15, fontWeight: "700" },
});
