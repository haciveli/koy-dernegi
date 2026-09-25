import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const TOKEN_ANAHTARI = "koy_dernegi_token";

async function tokenOku() {
  try {
    return await AsyncStorage.getItem(TOKEN_ANAHTARI);
  } catch {
    return null;
  }
}

async function tokenKaydet(token) {
  try {
    await AsyncStorage.setItem(TOKEN_ANAHTARI, token);
  } catch {
    // sessiz geç
  }
}

async function tokenTemizle() {
  try {
    await AsyncStorage.removeItem(TOKEN_ANAHTARI);
  } catch {
    // sessiz geç
  }
}

async function istekYolla(rota, secenekler = {}) {
  const token = await tokenOku();
  const basliklar = {
    "Content-Type": "application/json",
    ...(secenekler.basliklar || {}),
  };
  if (token) basliklar.Authorization = `Bearer ${token}`;

  const yanit = await fetch(`${API_URL}${rota}`, {
    ...secenekler,
    headers: basliklar,
  });

  let veri = null;
  try {
    veri = await yanit.json();
  } catch {
    veri = null;
  }

  if (!yanit.ok) {
    const hata = new Error(
      (veri && veri.detail) || `Sunucu hatası (${yanit.status})`
    );
    hata.durum = yanit.status;
    throw hata;
  }
  return veri;
}

// ---- Kimlik ----
export const giris = (email, sifre) =>
  istekYolla("/api/giris", { method: "POST", body: JSON.stringify({ email, sifre }) });

export const kayit =
  async (kullanici) => istekYolla("/api/kayit", { method: "POST", body: JSON.stringify(kullanici) });
export const ben = () => istekYolla("/api/ben");

// ---- Icerik ----
export const duyurular = () => istekYolla("/api/duyurular");
export const duyuruDetay = (id) => istekYolla(`/api/duyurular/${id}`);
export const etkinlikler = () => istekYolla("/api/etkinlikler");
export const etkinlikDetay = (id) => istekYolla(`/api/etkinlikler/${id}`);
export const etkinligeKayit = (id) =>
  istekYolla(`/api/etkinlikler/${id}/kayit`, { method: "POST" });
export const galeri = () => istekYolla("/api/galeri");
export const videolar = () => istekYolla("/api/videolar");
export const reklamlar = (konum) =>
  istekYolla(`/api/reklamlar?konum=${encodeURIComponent(konum)}&sadece_aktif=true`);
export const reklamlarTumu = () => istekYolla("/api/reklamlar");
export const ayarlar = () => istekYolla("/api/ayarlar");
export const iletisimGonder = (veri) =>
  istekYolla("/api/iletisim", { method: "POST", body: JSON.stringify(veri) });

// ---- Chat ----
export const chatUyeler = () => istekYolla("/api/chat/uyeler");
export const chatMesajlar = (aliciId) =>
  istekYolla(`/api/chat/mesajlar${aliciId ? `?alici_id=${aliciId}` : ""}`);
export const chatMesajGonder = (icerik, aliciId = null) =>
  istekYolla("/api/chat/mesajlar", {
    method: "POST",
    body: JSON.stringify({ icerik, alici_id: aliciId }),
  });
export const chatSonDurum = () => istekYolla("/api/chat/son_durum");

// ---- Dosya yükleme ----
export const dosyaYukle = async (uri, ad, mimeTur = "image/jpeg") => {
  const token = await tokenOku();
  const bos = new FormData();
  bos.append("dosya", { uri, name: ad, type: mimeTur });
  const yanit = await fetch(`${API_URL}/api/yukle`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: bos,
  });
  let veri = null;
  try {
    veri = await yanit.json();
  } catch {
    veri = null;
  }
  if (!yanit.ok) {
    const hata = new Error((veri && veri.detail) || `Yükleme hatası (${yanit.status})`);
    hata.durum = yanit.status;
    throw hata;
  }
  return veri;
};

// ---- Admin CRUD ----
// Duyurular
export const duyuruEkle = (veri) =>
  istekYolla("/api/duyurular", { method: "POST", body: JSON.stringify(veri) });
export const duyuruGuncelle = (id, veri) =>
  istekYolla(`/api/duyurular/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const duyuruSil = (id) =>
  istekYolla(`/api/duyurular/${id}`, { method: "DELETE" });

// Etkinlikler
export const etkinlikEkle = (veri) =>
  istekYolla("/api/etkinlikler", { method: "POST", body: JSON.stringify(veri) });
export const etkinlikGuncelle = (id, veri) =>
  istekYolla(`/api/etkinlikler/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const etkinlikSil = (id) =>
  istekYolla(`/api/etkinlikler/${id}`, { method: "DELETE" });

// Galeri
export const galeriEkle = (veri) =>
  istekYolla("/api/galeri", { method: "POST", body: JSON.stringify(veri) });
export const galeriGuncelle = (id, veri) =>
  istekYolla(`/api/galeri/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const galeriSil = (id) =>
  istekYolla(`/api/galeri/${id}`, { method: "DELETE" });

// Videolar
export const videoEkle = (veri) =>
  istekYolla("/api/videolar", { method: "POST", body: JSON.stringify(veri) });
export const videoGuncelle = (id, veri) =>
  istekYolla(`/api/videolar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const videoSil = (id) =>
  istekYolla(`/api/videolar/${id}`, { method: "DELETE" });

// Reklamlar
export const reklamEkle = (veri) =>
  istekYolla("/api/reklamlar", { method: "POST", body: JSON.stringify(veri) });
export const reklamGuncelle = (id, veri) =>
  istekYolla(`/api/reklamlar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const reklamSil = (id) =>
  istekYolla(`/api/reklamlar/${id}`, { method: "DELETE" });

// Kullanıcılar (admin)
export const kullanicilar = () => istekYolla("/api/kullanicilar");
export const kullaniciGuncelle = (id, veri) =>
  istekYolla(`/api/kullanicilar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const kullaniciSil = (id) =>
  istekYolla(`/api/kullanicilar/${id}`, { method: "DELETE" });

// İletişim mesajları (admin)
export const iletisimler = () => istekYolla("/api/iletisim");
export const iletisimDurumGuncelle = (id, durum) =>
  istekYolla(`/api/iletisim/${id}`, { method: "PUT", body: JSON.stringify({ durum }) });
export const iletisimSil = (id) =>
  istekYolla(`/api/iletisim/${id}`, { method: "DELETE" });

// Ayarlar
export const ayarlarGuncelle = (veri) =>
  istekYolla("/api/ayarlar", { method: "PUT", body: JSON.stringify(veri) });

// Aidatlar
export const aidatlar = () => istekYolla("/api/aidatlar");
export const aidatlarBenim = () => istekYolla("/api/aidatlar/benim");
export const aidatEkle = (veri) =>
  istekYolla("/api/aidatlar", { method: "POST", body: JSON.stringify(veri) });
export const aidatGuncelle = (id, veri) =>
  istekYolla(`/api/aidatlar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const aidatSil = (id) =>
  istekYolla(`/api/aidatlar/${id}`, { method: "DELETE" });
export const aidatOde = (id) =>
  istekYolla(`/api/aidatlar/${id}/ode`, { method: "POST" });
export const aidatBenimOde = () =>
  istekYolla("/api/aidatlar/benim/ode", { method: "POST" });
export const aidatHatirlat = (veri) =>
  istekYolla("/api/aidatlar/hatirlat", { method: "POST", body: JSON.stringify(veri || {}) });

// Bağışlar
export const bagislar = () => istekYolla("/api/bagislar");
export const bagislarBenim = () => istekYolla("/api/bagislar/benim");
export const bagisEkle = (veri) =>
  istekYolla("/api/bagislar", { method: "POST", body: JSON.stringify(veri) });
export const bagisGuncelle = (id, veri) =>
  istekYolla(`/api/bagislar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const bagisSil = (id) =>
  istekYolla(`/api/bagislar/${id}`, { method: "DELETE" });

// Rehber
export const rehber = () => istekYolla("/api/rehber");
export const rehberEkle = (veri) =>
  istekYolla("/api/rehber", { method: "POST", body: JSON.stringify(veri) });
export const rehberGuncelle = (id, veri) =>
  istekYolla(`/api/rehber/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const rehberSil = (id) =>
  istekYolla(`/api/rehber/${id}`, { method: "DELETE" });

// İlanlar
export const ilanlar = (kategori, sadeceAktif = true) => {
  const params = [];
  if (kategori) params.push(`kategori=${encodeURIComponent(kategori)}`);
  if (!sadeceAktif) params.push("sadece_aktif=false");
  return istekYolla(`/api/ilanlar${params.length ? "?" + params.join("&") : ""}`);
};
export const ilanEkle = (veri) =>
  istekYolla("/api/ilanlar", { method: "POST", body: JSON.stringify(veri) });
export const ilanGuncelle = (id, veri) =>
  istekYolla(`/api/ilanlar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const ilanSil = (id) =>
  istekYolla(`/api/ilanlar/${id}`, { method: "DELETE" });

// Toplantılar
export const toplantilar = () => istekYolla("/api/toplantilar");
export const toplantiDetay = (id) => istekYolla(`/api/toplantilar/${id}`);
export const toplantiEkle = (veri) =>
  istekYolla("/api/toplantilar", { method: "POST", body: JSON.stringify(veri) });
export const toplantiGuncelle = (id, veri) =>
  istekYolla(`/api/toplantilar/${id}`, { method: "PUT", body: JSON.stringify(veri) });
export const toplantiSil = (id) =>
  istekYolla(`/api/toplantilar/${id}`, { method: "DELETE" });
export const oylamaEkle = (toplantiId, veri) =>
  istekYolla(`/api/toplantilar/${toplantiId}/oylamalar`, { method: "POST", body: JSON.stringify(veri) });
export const oylamaSil = (toplantiId, oylamaId) =>
  istekYolla(`/api/toplantilar/${toplantiId}/oylamalar/${oylamaId}`, { method: "DELETE" });
export const oyKullan = (toplantiId, oylamaId, secim) =>
  istekYolla(`/api/toplantilar/${toplantiId}/oylamalar/${oylamaId}/oy?secim=${encodeURIComponent(secim)}`, { method: "POST" });

// ---- Bildirim cihazları ----
export const cihazKaydet = (veri) =>
  istekYolla("/api/cihaz", { method: "POST", body: JSON.stringify(veri) });
export const cihazKaldir = (veri) => {
  const token = tokenOku;
  return istekYolla("/api/cihaz", { method: "DELETE", body: JSON.stringify(veri) });
};

// ---- Bildirim tercihleri ----
export const bildirimTercihleri = () => istekYolla("/api/bildirim-tercihleri");
export const bildirimTercihleriGuncelle = (veri) =>
  istekYolla("/api/bildirim-tercihleri", { method: "PUT", body: JSON.stringify(veri) });

// ---- Şifre ----
export const sifreDegistir = (veri) =>
  istekYolla("/api/kullanici/sifre", { method: "PUT", body: JSON.stringify(veri) });

export { tokenTemizle, tokenKaydet, tokenOku };