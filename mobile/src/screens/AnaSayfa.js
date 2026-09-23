import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { duyurular, etkinlikler, ayarlar } from "../api";
import { tarihFormatla } from "../config";
import ReklamAlani from "../components/ReklamAlani";
import Badge from "../components/Badge";
import LoadingView from "../components/LoadingView";
import { renkler, olcutler } from "../theme";

export default function AnaSayfa({ navigation }) {
  const odakta = useIsFocused();
  const [ayar, setAyar] = useState(null);
  const [duyuruListesi, setDuyuruListesi] = useState([]);
  const [etkinlikListesi, setEtkinlikListesi] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriCek = async () => {
    try {
      const [a, d, e] = await Promise.all([ayarlar(), duyurular(), etkinlikler()]);
      setAyar(a);
      setDuyuruListesi(Array.isArray(d) ? d.slice(0, 3) : []);
      const gelecek = (Array.isArray(e) ? e : [])
        .filter((et) => new Date(et.tarih) >= new Date())
        .slice(0, 3);
      setEtkinlikListesi(gelecek);
    } catch {
      // sessiz
    } finally {
      setYukleniyor(false);
      setYenileniyor(false);
    }
  };

  useEffect(() => {
    if (odakta) {
      setYukleniyor(true);
      veriCek();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odakta]);

  if (yukleniyor) return <LoadingView metin="Ana sayfa yükleniyor..." />;

  const siteAdi = ayar?.site_adi || "Köy Derneği";
  const slogan = ayar?.site_kisa_aciklama || "Dayanışma · Kültür · Gelecek";
  const heroBaslik = ayar?.ana_hero_baslik || "Köyümüze Gönül Verenler";

  return (
    <ScrollView
      style={styles.kap}
      refreshControl={
        <RefreshControl refreshing={yenileniyor} onRefresh={() => { setYenileniyor(true); veriCek(); }} tintColor={renkler.ana_600} />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.heroKusak}>{siteAdi}</Text>
        <Text style={styles.heroBaslik}>{heroBaslik}</Text>
        <Text style={styles.slogan}>{slogan}</Text>
      </View>

      <View style={styles.icerik}>
        <ReklamAlani konum="ana_sayfa" />

        <BolumBaslik
          baslik="Son Duyurular"
          butonMetin="Tümü"
          onPress={() => navigation.navigate("DuyuruTab")}
        />
        {duyuruListesi.length === 0 ? (
          <BosMesaj metin="Henüz duyuru yok." />
        ) : (
          duyuruListesi.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.kart}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("DuyuruDetay", { duyuru: d })}
            >
              <Badge metin={d.kategori || "Genel"} renk={renkler.ana_500} />
              <Text style={styles.kartBaslik}>{d.baslik}</Text>
              <Text style={styles.kartTarih}>
                <Ionicons name="time-outline" size={12} /> {tarihFormatla(d.olusturulma_tarihi)}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <BolumBaslik
          baslik="Yaklaşan Etkinlikler"
          butonMetin="Tümü"
          onPress={() => navigation.navigate("EtkinlikTab")}
        />
        {etkinlikListesi.length === 0 ? (
          <BosMesaj metin="Yaklaşan etkinlik yok." />
        ) : (
          etkinlikListesi.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.kart}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("EtkinlikDetay", { etkinlik: e })}
            >
              <View style={styles.tarihKutusu}>
                <Text style={styles.tarihGun}>{new Date(e.tarih).getDate()}</Text>
                <Text style={styles.tarihAy}>
                  {new Date(e.tarih).toLocaleDateString("tr-TR", { month: "short" })}
                </Text>
              </View>
              <View style={styles.tarihMetinKap}>
                <Text style={styles.kartBaslik}>{e.baslik}</Text>
                <Text style={styles.kartTarih}>
                  <Ionicons name="location-outline" size={12} /> {e.yer}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.hizliErisim}>
          <HizliKutu
            ikon="card-outline"
            baslik="Aidat"
            onPress={() => navigation.navigate("Aidat")}
          />
          <HizliKutu
            ikon="storefront-outline"
            baslik="Rehber"
            onPress={() => navigation.navigate("Rehber")}
          />
          <HizliKutu
            ikon="megaphone-outline"
            baslik="İlanlar"
            onPress={() => navigation.navigate("Ilanlar")}
          />
          <HizliKutu
            ikon="people-outline"
            baslik="Toplantılar"
            onPress={() => navigation.navigate("Toplantilar")}
          />
          <HizliKutu
            ikon="images-outline"
            baslik="Galeri"
            onPress={() => navigation.navigate("GaleriTab")}
          />
          <HizliKutu
            ikon="videocam-outline"
            baslik="Videolar"
            onPress={() => navigation.navigate("Videolar")}
          />
          <HizliKutu
            ikon="headset-outline"
            baslik="İletişim"
            onPress={() => navigation.navigate("Iletisim")}
          />
          <HizliKutu
            ikon="chatbubble-ellipses-outline"
            baslik="Sohbet"
            onPress={() => navigation.navigate("SohbetTab")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function BolumBaslik({ baslik, butonMetin, onPress }) {
  return (
    <View style={styles.bolumBaslik}>
      <Text style={styles.bolumAd}>{baslik}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.bolumButon}>{butonMetin}</Text>
      </TouchableOpacity>
    </View>
  );
}

function BosMesaj({ metin }) {
  return (
    <View style={styles.bosMesaj}>
      <Text style={styles.bosMesajMetin}>{metin}</Text>
    </View>
  );
}

function HizliKutu({ ikon, baslik, onPress }) {
  return (
    <TouchableOpacity style={styles.hizliKutu} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={ikon} size={24} color={renkler.ana_600} />
      <Text style={styles.hizliKutuMetin}>{baslik}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  hero: {
    backgroundColor: renkler.ana_600,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  heroKusak: {
    color: renkler.vurgu_300,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroBaslik: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 34,
  },
  slogan: {
    color: renkler.ana_100,
    fontSize: 15,
    marginTop: 8,
  },
  icerik: { padding: 16, gap: 4 },
  bolumBaslik: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },
  bolumAd: { fontSize: 18, fontWeight: "700", color: renkler.metin },
  bolumButon: { fontSize: 14, fontWeight: "600", color: renkler.vurgu_600 },
  kart: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 14,
    gap: 6,
    marginBottom: 10,
    shadowColor: renkler.ana_950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kartBaslik: { fontSize: 16, fontWeight: "700", color: renkler.metin },
  kartTarih: { fontSize: 12, color: renkler.metin_soluk },
  bosMesaj: {
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    padding: 18,
    alignItems: "center",
  },
  bosMesajMetin: { color: renkler.metin_soluk, fontSize: 14 },
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
  tarihMetinKap: { gap: 3 },
  hizliErisim: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },
  hizliKutu: {
    width: "48%",
    backgroundColor: renkler.kart,
    borderRadius: olcutler.kart_radius,
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: renkler.sinir,
  },
  hizliKutuMetin: { fontSize: 14, fontWeight: "600", color: renkler.metin },
});