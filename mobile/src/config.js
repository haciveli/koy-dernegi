import Constants from "expo-constants";
import { Platform } from "react-native";

// Backend adresi: app.json -> extra.apiUrl içinden okunur.
// Fiziksel cihazda test ederken burayı bilgisayarınızın LAN adresiyle değiştirin,
// örneğin: http://192.168.1.10:8000
const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://192.168.1.104:8000";

export { API_URL };

// Yardımcılar - null/undefined güvenli tarih göstergesi
export function tarihFormatla(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function tarihSaatFormatla(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function resimUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_URL.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}

// Sadece yerel platformlarda çalışıyoruz (web değil). Expo Go'da LAN için
// yine de localhost dışında bir adres gerekebilir.
export const CALISMA_PLATFORMU = Platform.OS;