import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { renkler } from "../theme";

import AnaSayfa from "../screens/AnaSayfa";
import Duyurular from "../screens/Duyurular";
import DuyuruDetay from "../screens/DuyuruDetay";
import Etkinlikler from "../screens/Etkinlikler";
import EtkinlikDetay from "../screens/EtkinlikDetay";
import Galeri from "../screens/Galeri";
import Videolar from "../screens/Videolar";
import Sohbet from "../screens/Sohbet";
import Kanal from "../screens/Kanal";
import Iletisim from "../screens/Iletisim";
import Profil from "../screens/Profil";
import Giris from "../screens/Giris";
import Kayit from "../screens/Kayit";
import Yonetim from "../screens/Yonetim";
import YonetimModul from "../screens/admin/YonetimModul";
import AidatYonetim from "../screens/admin/AidatYonetim";
import KullaniciYonetim from "../screens/admin/KullaniciYonetim";
import IletisimYonetim from "../screens/admin/IletisimYonetim";
import AyarYonetim from "../screens/admin/AyarYonetim";
import Aidat from "../screens/Aidat";
import Rehber from "../screens/Rehber";
import Ilanlar from "../screens/Ilanlar";
import Toplantilar from "../screens/Toplantilar";
import ToplantiDetay from "../screens/ToplantiDetay";
import ToplantiYonetim from "../screens/admin/ToplantiYonetim";

const DuyuruModul = (props) => <YonetimModul {...props} tur="duyuru" />;
const EtkinlikModul = (props) => <YonetimModul {...props} tur="etkinlik" />;
const GaleriModul = (props) => <YonetimModul {...props} tur="galeri" />;
const VideoModul = (props) => <YonetimModul {...props} tur="video" />;
const ReklamModul = (props) => <YonetimModul {...props} tur="reklam" />;
const BagisModul = (props) => <YonetimModul {...props} tur="bagis" />;
const RehberModul = (props) => <YonetimModul {...props} tur="rehber" />;
const IlanModul = (props) => <YonetimModul {...props} tur="ilan" />;

const Sekmeler = createBottomTabNavigator();
const Yigin = createNativeStackNavigator();

function SekmeYonlendirici() {
  return (
    <Sekmeler.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: renkler.ana_600,
        tabBarInactiveTintColor: renkler.metin_soluk,
        tabBarStyle: { backgroundColor: renkler.kart },
        tabBarIcon: ({ color, size, focused }) => {
          const ikonlar = {
            AnaSayfaTab: focused ? "home" : "home-outline",
            DuyuruTab: focused ? "megaphone" : "megaphone-outline",
            EtkinlikTab: focused ? "calendar" : "calendar-outline",
            GaleriTab: focused ? "images" : "images-outline",
            SohbetTab: focused ? "chatbubbles" : "chatbubbles-outline",
            ProfilTab: focused ? "person" : "person-outline",
          };
          return <Ionicons name={ikonlar[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Sekmeler.Screen name="AnaSayfaTab" component={AnaSayfa} options={{ title: "Ana Sayfa" }} />
      <Sekmeler.Screen name="DuyuruTab" component={Duyurular} options={{ title: "Duyurular" }} />
      <Sekmeler.Screen name="EtkinlikTab" component={Etkinlikler} options={{ title: "Etkinlikler" }} />
      <Sekmeler.Screen name="GaleriTab" component={Galeri} options={{ title: "Galeri" }} />
      <Sekmeler.Screen name="SohbetTab" component={Sohbet} options={{ title: "Sohbet" }} />
      <Sekmeler.Screen name="ProfilTab" component={Profil} options={{ title: "Profil" }} />
    </Sekmeler.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Yigin.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: renkler.ana_600 },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: renkler.arkaplan },
      }}
    >
      <Yigin.Screen name="Tabs" component={SekmeYonlendirici} options={{ headerShown: false }} />
      <Yigin.Screen name="DuyuruDetay" component={DuyuruDetay} options={{ title: "Duyuru" }} />
      <Yigin.Screen name="EtkinlikDetay" component={EtkinlikDetay} options={{ title: "Etkinlik" }} />
      <Yigin.Screen name="Kanal" component={Kanal} options={{ title: "Sohbet" }} />
      <Yigin.Screen name="Iletisim" component={Iletisim} options={{ title: "İletişim" }} />
      <Yigin.Screen name="Videolar" component={Videolar} options={{ title: "Videolar" }} />
      <Yigin.Screen name="Aidat" component={Aidat} options={{ title: "Aidat ve Bağış" }} />
      <Yigin.Screen name="Rehber" component={Rehber} options={{ title: "Köy Rehberi" }} />
      <Yigin.Screen name="Ilanlar" component={Ilanlar} options={{ title: "İlan Panosu" }} />
      <Yigin.Screen name="Toplantilar" component={Toplantilar} options={{ title: "Toplantılar" }} />
      <Yigin.Screen name="ToplantiDetay" component={ToplantiDetay} options={{ title: "Toplantı" }} />
      <Yigin.Screen name="Giris" component={Giris} options={{ title: "Üye Girişi" }} />
      <Yigin.Screen name="Kayit" component={Kayit} options={{ title: "Üyelik Başvurusu" }} />
      <Yigin.Screen name="Yonetim" component={Yonetim} options={{ title: "Yönetim" }} />
      <Yigin.Screen name="YonetimDuyuru" component={DuyuruModul} options={{ title: "Duyurular" }} />
      <Yigin.Screen name="YonetimEtkinlik" component={EtkinlikModul} options={{ title: "Etkinlikler" }} />
      <Yigin.Screen name="YonetimGaleri" component={GaleriModul} options={{ title: "Galeri" }} />
      <Yigin.Screen name="YonetimVideo" component={VideoModul} options={{ title: "Videolar" }} />
      <Yigin.Screen name="YonetimReklam" component={ReklamModul} options={{ title: "Reklamlar" }} />
      <Yigin.Screen name="YonetimAidat" component={AidatYonetim} options={{ title: "Aidatlar" }} />
      <Yigin.Screen name="YonetimBagis" component={BagisModul} options={{ title: "Bağışlar" }} />
      <Yigin.Screen name="YonetimRehber" component={RehberModul} options={{ title: "Köy Rehberi" }} />
      <Yigin.Screen name="YonetimIlan" component={IlanModul} options={{ title: "İlanlar" }} />
      <Yigin.Screen name="YonetimToplanti" component={ToplantiYonetim} options={{ title: "Toplantılar" }} />
      <Yigin.Screen name="YonetimKullanici" component={KullaniciYonetim} options={{ title: "Üyeler" }} />
      <Yigin.Screen name="YonetimIletisim" component={IletisimYonetim} options={{ title: "İletişim Mesajları" }} />
      <Yigin.Screen name="YonetimAyar" component={AyarYonetim} options={{ title: "Ayarlar" }} />
    </Yigin.Navigator>
  );
}