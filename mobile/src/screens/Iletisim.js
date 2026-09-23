import React, { useEffect, useState } from "react";
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
import PageHeader from "../components/PageHeader";
import { ayarlar, iletisimGonder } from "../api";
import { renkler } from "../theme";

export default function Iletisim() {
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [konu, setKonu] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [bilgi, setBilgi] = useState(null);

  useEffect(() => {
    ayarlar()
      .then(setBilgi)
      .catch(() => {});
  }, []);

  const gonder = async () => {
    if (!ad || !email || !konu || !mesaj) {
      Alert.alert("Bilgi", "Tüm alanları doldurun.");
      return;
    }
    setYukleniyor(true);
    try {
      await iletisimGonder({ ad: ad.trim(), email, konu: konu.trim(), mesaj: mesaj.trim() });
      Alert.alert("Gönderildi", "Mesajınız bize ulaştı. Teşekkürler!");
      setAd("");
      setEmail("");
      setKonu("");
      setMesaj("");
    } catch (hata) {
      Alert.alert("Hata", hata.message || "Mesaj gönderilemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageHeader baslik="İletişim" altBaslik="Sorularınız ve önerileriniz için bize ulaşın" />
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
        {bilgi ? (
          <View style={styles.bilgiKap}>
            {bilgi.iletisim_adres ? <BilgiSatir label="Adres" deger={bilgi.iletisim_adres} /> : null}
            {bilgi.iletisim_telefon ? <BilgiSatir label="Telefon" deger={bilgi.iletisim_telefon} /> : null}
            {bilgi.iletisim_email ? <BilgiSatir label="E-posta" deger={bilgi.iletisim_email} /> : null}
            {bilgi.ofis_saatleri ? <BilgiSatir label="Çalışma Saatleri" deger={bilgi.ofis_saatleri} /> : null}
          </View>
        ) : null}

        <FormInput label="Adınız" ikon="person-outline" placeholder="Adınız" value={ad} onChangeText={setAd} />
        <FormInput
          label="E-posta"
          ikon="mail-outline"
          placeholder="ornek@eposta.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <FormInput label="Konu" ikon="pricetag-outline" placeholder="Konu" value={konu} onChangeText={setKonu} />
        <FormInput
          label="Mesajınız"
          ikon="chatbox-outline"
          placeholder="Mesajınızı yazın..."
          multiline
          value={mesaj}
          onChangeText={setMesaj}
        />

        <Button baslik="Mesajı Gönder" onPress={gonder} yukleniyor={yukleniyor} butuk ikon="send-outline" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BilgiSatir({ label, deger }) {
  return (
    <View style={styles.bilgiSatir}>
      <Text style={styles.bilgiLabel}>{label}</Text>
      <Text style={styles.bilgiDeger}>{deger}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, backgroundColor: renkler.arkaplan },
  icerik: { padding: 20, paddingBottom: 40 },
  bilgiKap: {
    backgroundColor: renkler.ana_50,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: renkler.ana_100,
  },
  bilgiSatir: { gap: 2 },
  bilgiLabel: { fontSize: 12, fontWeight: "700", color: renkler.ana_600, textTransform: "uppercase" },
  bilgiDeger: { fontSize: 14, color: renkler.metin, lineHeight: 20 },
});