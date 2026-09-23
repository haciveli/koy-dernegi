import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as api from "../api";
import { temaUygula } from "../theme";
import { pushTokenKaydet, bildirimKaldir } from "../services/bildirim";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const expoToken = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const ayar = await api.ayarlar().catch(() => null);
        if (ayar) temaUygula(ayar);
      } catch {
        // Tema ayarlari yuklenemezse varsayilan kullanilir.
      }
      try {
        const kayitliToken = await api.tokenOku();
        if (kayitliToken) {
          setToken(kayitliToken);
          const bilgi = await api.ben();
          setKullanici(bilgi);
          pushTokenKaydet().then((pushToken) => {
            if (pushToken) expoToken.current = pushToken;
          });
        }
      } catch {
        await api.tokenTemizle();
        setToken(null);
        setKullanici(null);
      } finally {
        setYukleniyor(false);
      }
    })();
  }, []);

  const girisYap = useCallback(async (email, sifre) => {
    const yanit = await api.giris(email, sifre);
    await api.tokenKaydet(yanit.access_token);
    setToken(yanit.access_token);
    const bilgi = await api.ben();
    setKullanici(bilgi);
    if (!expoToken.current) {
      pushTokenKaydet().then((pushToken) => {
        if (pushToken) expoToken.current = pushToken;
      });
    }
    return bilgi;
  }, []);

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