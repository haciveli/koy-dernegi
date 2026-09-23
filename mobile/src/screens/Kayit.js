import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { renkler } from "../theme";

export default function Kayit({ navigation }) {
  const { kayitOl } = useAuth();
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [koy, setKoy] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async () => {
    if (!ad || !soyad || !email || !telefon || !koy || !sifre) {
      Alert.alert("Bilgi", "Tüm alanları doldurun.");
      return;
    }
    if (sifre.length < 6) {
      Alert.alert("Bilgi", "Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setYukleniyor(true);
    try {
      await kayitOl({
        ad: ad.trim(),
        soyad: soyad.trim(),
        email: email.trim().toLowerCase(),
        telefon: telefon.trim(),
        koy: koy.trim(),
        sifre,
      });
      Alert.alert(
        "Başvuru alındı",
        "Üyelik başvurunuz alındı. Hesabınız yönetici onayı sonrası aktifleşecektir.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    } catch (hata) {
      Alert.alert("Kayıt başarısız", hata.message || "Bir hata oluştu.");
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
          <Text style={styles.baslik}>Üyelik Başvurusu</Text>
          <Text style={styles.altBaslik}>Köyümüzün ailesine katılın</Text>
        </View>

        <FormInput label="Ad" ikon="person-outline" placeholder="Adınız" value={ad} onChangeText={setAd} />
        <FormInput label="Soyad" ikon="people-outline" placeholder="Soyadınız" value={soyad} onChangeText={setSoyad} />
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
          label="Telefon"
          ikon="call-outline"
          placeholder="05xx xxx xx xx"
          keyboardType="phone-pad"
          value={telefon}
          onChangeText={setTelefon}
        />
        <FormInput label="Köyünüz" ikon="home-outline" placeholder="Köy adı" value={koy} onChangeText={setKoy} />
        <FormInput
          label="Şifre"
          ikon="lock-closed-outline"
          placeholder="En az 6 karakter"
          secureTextEntry
          value={sifre}
          onChangeText={setSifre}
        />

        <Button baslik="Başvuruyu Gönder" onPress={gonder} yukleniyor={yukleniyor} butuk ikon="checkmark-circle-outline" />

        <View style={styles.alt}>
          <Text style={styles.altMetin}>Zaten üye misiniz?</Text>
          <Button baslik="Giriş Yap" tur="ince" onPress={() => navigation.navigate("Giris")} />
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