import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as api from "../api";
import { temaUygula } from "../theme";
import { pushTokenKaydet, bildirimKaldir } from "../services/bildirim";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const expoToken = useRef(null);

  const tokenKaydet = useCallback(async () => {
    const pushToken = await pushTokenKaydet();
    if (pushToken) expoToken.current = pushToken;
    return pushToken;
  }, []);

  const baslangic = useCallback(async () => {
    try {
      const ayar = await api.ayarlar().catch(() => null);
      if (ayar) temaUygula(ayar);
    } catch {
      // Tema ayarlari yuklenemezse varsayilan kullanilir.
    }
    let basarili = false;
    try {
      const kayitliToken = await api.tokenOku();
      if (kayitliToken) {
        setToken(kayitliToken);
        const bilgi = await api.ben();
        setKullanici(bilgi);
        basarili = true;
      }
    } catch {
      await api.tokenTemizle();
      setToken(null);
      setKullanici(null);
    } finally {
      setYukleniyor(false);
    }
    if (basarili) tokenKaydet();
  }, [tokenKaydet]);

  useEffect(() => {
    baslangic();
  }, [baslangic]);

  // Sunucu (Render) yeniden basladiginda cihaz kaydi silinir;
  // uygulama her on plana geldiginde tokeni yeniden kaydeder.
  useEffect(() => {
    const abonelik = AppState.addEventListener("change", (yeniDurum) => {
      if (yeniDurum === "active" && expoToken.current) {
        tokenKaydet();
      }
    });
    return () => {
      abonelik.remove();
    };
  }, [tokenKaydet]);

  const girisYap = useCallback(
    async (email, sifre) => {
      const yanit = await api.giris(email, sifre);
      await api.tokenKaydet(yanit.access_token);
      setToken(yanit.access_token);
      const bilgi = await api.ben();
      setKullanici(bilgi);
      tokenKaydet();
      return bilgi;
    },
    [tokenKaydet]
  );

  const kayitOl = useCallback((veri) => api.kayit(veri), []);

  const cikisYap = useCallback(async () => {
    if (expoToken.current) {
      await bildirimKaldir(expoToken.current);
      expoToken.current = null;
    }
    await api.tokenTemizle();
    setToken(null);
    setKullanici(null);
  }, []);

  const tazele = useCallback(async () => {
    const bilgi = await api.ben();
    setKullanici(bilgi);
    return bilgi;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        kullanici,
        yukleniyor,
        girisYap,
        kayitOl,
        cikisYap,
        tazele,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const baglam = useContext(AuthContext);
  if (!baglam) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır");
  return baglam;
}