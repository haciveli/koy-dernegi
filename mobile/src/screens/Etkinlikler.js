import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { etkinlikler } from "../api";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { renkler, olcutler } from "../theme";

const SEKMELER = [
  { deger: "tum", etiket: "Tümü" },
  { deger: "gelecek", etiket: "Yaklaşan" },
  { deger: "gecmis", etiket: "Geçmiş" },
];

export default function Etkinlikler({ navigation }) {
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sekme, setSekme] = useState("gelecek");

  useFocusEffect(
    useCallback(() => {
      let gecerli = true;
      etkinlikler()
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

  const simdi = new Date();
  let goruntulenenler = veriler;
  if (sekme === "gelecek") goruntulenenler = veriler.filter((e) => new Date(e.tarih) >= simdi);
  if (sekme === "gecmis") goruntulenenler = veriler.filter((e) => new Date(e.tarih) < simdi);

  if (yukleniyor) return <LoadingView metin="Etkinlikler yükleniyor..." />;

  return (
    <View style={styles.kap}>
      <PageHeader baslik="Etkinlikler" altBaslik="Köyümüzün panayırları, festivalleri ve buluşmaları" />
      <View style={styles.sekmeler}>
        {SEKMELER.map((s) => {
          const aktif = s.deger === sekme;
          return (
            <TouchableOpacity
              key={s.deger}
              style={[styles.sekme, aktif && styles.sekmeAktif]}
              onPress={() => setSekme(s.deger)}
            >
              <Text style={[styles.sekmeMetin, aktif && styles.sekmeMetinAktif]}>{s.etiket}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FlatList
        data={goruntulenenler}
        keyExtractor={(madde) => String(madde.id)}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={renkler.ana_600}
            onRefresh={() => {
              etkinlikler()
                .then((list) => setVeriler(Array.isArray(list) ? list : []))
                .catch(() => {});
            }}
          />
        }
        ListEmptyComponent={<EmptyState ikon="calendar-outline" metin="Bu bölümde etkinlik bulunamadı." />}
        renderItem={({ item }) => (
          <EtkinlikKart etkinlik={item} onPress={() => navigation.navigate("EtkinlikDetay", { etkinlik: item })} />
        )}
      />
    </View>
  );
}

export function EtkinlikKart({ etkinlik, onPress }) {
  const tarih = new Date(etkinlik.tarih);
  const dolu = etkinlik.kayitli >= etkinlik.kontenjan;
  const simdi = new Date();
  const gecti = tarih < simdi;

  return (
    <TouchableOpacity style={styles.kart} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.tarihKutusu}>
        <Text style={styles.tarihGun}>{tarih.getDate()}</Text>
        <Text style={styles.tarihAy}>{tarih.toLocaleDateString("tr-TR", { month: "short" })}</Text>
        <Text style={styles.tarihYil}>{tarih.getFullYear()}</Text>
      </View>
      <View style={styles.kartIcerik}>
        <View style={styles.kartUst}>
          <Text style={styles.baslik} numberOfLines={2}>
            {etkinlik.baslik}
          </Text>
          {gecti ? <Badge metin="Geçti" renk={renkler.metin_soluk} /> : null}
        </View>
        <Text style={styles.satir}>Yer: {etkinlik.yer}</Text>
        <View style={styles.kontenjanSatir}>
          <View style={styles.kontenjanCubugu}>
            <View
              style={[
                styles.kontenjanDort,
                {
                  width: `${Math.min(100, (etkinlik.kayitli / etkinlik.kontenjan) * 100)}%`,
                  backgroundColor: dolu ? renkler.tehlikeli : renkler.ana_500,
                },
              ]}
            />
          </View>
          <Text style={styles.kontenjanMetin}>
            {etkinlik.kayitli}/{etkinlik.kontenjan} {dolu ? "· DOLDU" : "kişi kayıtlı"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  sekmeler: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sekme: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: renkler.kart,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  sekmeAktif: { backgroundColor: renkler.ana_600, borderColor: renkler.ana_600 },
  sekmeMetin: { fontSize: 14, fontWeight: "600", color: renkler.metin_soluk },
  sekmeMetinAktif: { color: "#fff" },
  liste: { padding: 16, paddingBottom: 32 },
  kart: {
    flexDirection: "row",
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 14,
    marginBottom: 12,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tarihKutusu: {
    width: 60,
    borderRadius: 12,
    backgroundColor: renkler.ana_100,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  tarihGun: { fontSize: 22, fontWeight: "800", color: renkler.ana_700 },
  tarihAy: { fontSize: 12, fontWeight: "600", color: renkler.ana_500, textTransform: "uppercase" },
  tarihYil: { fontSize: 10, color: renkler.metin_soluk },
  kartIcerik: { flex: 1, gap: 6 },
  kartUst: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 6 },
  baslik: { fontSize: 16, fontWeight: "700", color: renkler.metin, flex: 1 },
  satir: { fontSize: 13, color: renkler.metin_soluk },
  kontenjanSatir: { gap: 4, marginTop: 2 },
  kontenjanCubugu: {
    height: 6,
    borderRadius: 999,
    backgroundColor: renkler.ana_100,
    overflow: "hidden",
  },
  kontenjanDort: { height: 6, borderRadius: 999 },
  kontenjanMetin: { fontSize: 11, color: renkler.metin_soluk },
});