import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import LoadingView from "./src/components/LoadingView";
import { bildirimYanitiniDinle } from "./src/services/bildirim";

export const navigasyonRef = React.createRef();

function BekleyenBildirimYonlendirici() {
  const ilk = useRef(true);
  useEffect(() => {
    if (ilk.current) {
      ilk.current = false;
      const abonelik = bildirimYanitiniDinle((veri) => {
        const navigator = navigasyonRef.current;
        if (!navigator) return;
        const ekran = veri.ekran;
        const id = veri.id;
        if (ekran === "ToplantiDetay" && veri.toplanti_id) {
          navigator.navigate("ToplantiDetay", { id: veri.toplanti_id });
        } else if (ekran === "Duyurular" || ekran === "DuyuruDetay") {
          if (id) navigator.navigate("DuyuruDetay", { id });
          else navigator.navigate("Tabs", { screen: "DuyuruTab" });
        } else if (ekran === "Etkinlikler" || ekran === "EtkinlikDetay") {
          if (id) navigator.navigate("EtkinlikDetay", { id });
          else navigator.navigate("Tabs", { screen: "EtkinlikTab" });
        } else if (ekran === "Aidatlar" || ekran === "Bagislar") {
          navigator.navigate("Aidat");
        } else if (ekran === "Sohbet") {
          navigator.navigate("Tabs", { screen: "SohbetTab" });
        } else {
          navigator.navigate("Tabs", { screen: "AnaSayfaTab" });
        }
      });
      return () => abonelik.remove();
    }
  }, []);
  return null;
}

function KapasiteliUygulama() {
  const { yukleniyor } = useAuth();
  if (yukleniyor) {
    return <LoadingView metin="Oturum kontrol ediliyor..." />;
  }
  return (
    <>
      <BekleyenBildirimYonlendirici />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <NavigationContainer ref={navigasyonRef}>
          <KapasiteliUygulama />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}