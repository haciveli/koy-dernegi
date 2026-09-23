import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { renkler } from "../theme";

export default function Giris({ navigation }) {
  const { girisYap } = useAuth();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async () => {
    if (!email || !sifre) {
      Alert.alert("Bilgi", "E-posta ve şifre zorunludur.");
      return;
    }
    setYukleniyor(true);
    try {
      await girisYap(email.trim().toLowerCase(), sifre);
      Alert.alert("Başarılı", "Hoş geldiniz!", [
        { text: "Tamam", onPress: () => navigation.navigate("Tabs", { screen: "ProfilTab" }) },
      ]);
    } catch (hata) {
      Alert.alert("Giriş başarısız", hata.message || "Bilgilerinizi kontrol edin.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        <View style={styles.baslikKap}>
          <Text style={styles.baslik}>Üye Girişi</Text>
          <Text style={styles.altBaslik}>Hesabınızla devam edin</Text>
        </View>

        <FormInput
          label="E-posta"
          ikon="mail-outline"
          placeholder="ornek@eposta.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <FormInput
          label="Şifre"
          ikon="lock-closed-outline"
          placeholder="••••••••"
          secureTextEntry
          value={sifre}
          onChangeText={setSifre}
        />

        <Button baslik="Giriş Yap" onPress={gonder} yukleniyor={yukleniyor} butuk ikon="log-in-outline" />

        <View style={styles.alt}>
          <Text style={styles.altMetin}>Hesabınız yok mu?</Text>
          <Button
            baslik="Üye Ol"
            tur="ince"
            onPress={() => navigation.navigate("Kayit")}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 20, paddingTop: 40 },
  baslikKap: { marginBottom: 28, gap: 4 },
  baslik: { fontSize: 26, fontWeight: "800", color: renkler.metin },
  altBaslik: { fontSize: 14, color: renkler.metin_soluk },
  alt: { marginTop: 24, alignItems: "center", gap: 10 },
  altMetin: { color: renkler.metin_soluk, fontSize: 14 },
});