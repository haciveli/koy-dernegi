import {
  duyurular, duyuruEkle, duyuruGuncelle, duyuruSil,
  etkinlikler, etkinlikEkle, etkinlikGuncelle, etkinlikSil,
  galeri, galeriEkle, galeriGuncelle, galeriSil,
  videolar, videoEkle, videoGuncelle, videoSil,
  reklamlar, reklamlarTumu, reklamEkle, reklamGuncelle, reklamSil,
  kullanicilar, kullaniciGuncelle, kullaniciSil,
  iletisimler, iletisimDurumGuncelle, iletisimSil,
  ayarlar, ayarlarGuncelle,
  aidatlar, aidatEkle, aidatGuncelle, aidatSil,
  bagislar, bagisGuncelle, bagisSil,
  rehber, rehberEkle, rehberGuncelle, rehberSil,
  ilanlar, ilanEkle, ilanGuncelle, ilanSil,
} from "../api";
import { AY_ADLARI } from "../utils";

// Yönetim modüllerinin tek kaynak config'i.
// Buradaki HER varlık, RootNavigator'da screen adı = <ekranAdi> olacak şekilde
// YonetimModul bileşenine tur="duyuru" gibi gönderilerek kullanılır.
// alanlar: [{ anahtar, etiket, ikon, placeholder, multiline, keyboardType, sayisal, yazim }]
//  -> YonetimForm'un "alanlar" prop'uyla birebir uyumlu.

const DUYURU_ALANLARI = [
  { anahtar: "baslik", etiket: "Başlık", ikon: "megaphone-outline", placeholder: "Duyuru başlığı" },
  { anahtar: "kategori", etiket: "Kategori", ikon: "pricetag-outline", placeholder: "Genel / Kültür / Tarım", yazim: "words" },
  { anahtar: "icerik", etiket: "İçerik", ikon: "document-text-outline", placeholder: "Duyuru içeriği...", multiline: true },
];

const ETKINLIK_ALANLARI = [
  { anahtar: "baslik", etiket: "Başlık", ikon: "calendar-outline", placeholder: "Etkinlik adı" },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Etkinlik açıklaması...", multiline: true },
  { anahtar: "tarih", etiket: "Tarih", ikon: "time-outline", placeholder: "2025-06-21T10:00", keyboardType: "default" },
  { anahtar: "yer", etiket: "Yer", ikon: "location-outline", placeholder: "Etkinlik yeri" },
  { anahtar: "kontenjan", etiket: "Kontenjan", ikon: "people-outline", placeholder: "50", keyboardType: "numeric", sayisal: true },
];

const GALERI_ALANLARI = [
  { anahtar: "baslik", etiket: "Başlık", ikon: "image-outline", placeholder: "Fotoğraf başlığı" },
  { anahtar: "resim_url", etiket: "Resim", ikon: "image-outline", placeholder: "Telefondan yükleyin veya URL girin", dosya: "resim" },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Açıklama...", multiline: true },
];

const VIDEO_ALANLARI = [
  { anahtar: "baslik", etiket: "Başlık", ikon: "videocam-outline", placeholder: "Video başlığı" },
  { anahtar: "kategori", etiket: "Kategori", ikon: "pricetag-outline", placeholder: "Genel / Tanıtım", yazim: "words" },
  { anahtar: "video_url", etiket: "Video", ikon: "videocam-outline", placeholder: "Telefondan yükleyin veya URL girin", dosya: "video" },
  { anahtar: "kapak_url", etiket: "Kapak Görseli", ikon: "image-outline", placeholder: "Telefondan yükleyin veya URL girin", dosya: "resim", opsiyonel: true },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Video açıklaması...", multiline: true },
];

const REKLAM_ALANLARI = [
  { anahtar: "baslik", etiket: "Başlık", ikon: "megaphone-outline", placeholder: "Reklam başlığı" },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Reklam açıklaması...", multiline: true },
  { anahtar: "resim_url", etiket: "Resim", ikon: "image-outline", placeholder: "Telefondan yükleyin veya URL girin", dosya: "resim", opsiyonel: true },
  { anahtar: "link_url", etiket: "Link URL", ikon: "link-outline", placeholder: "https://...", keyboardType: "url", yazim: "none", opsiyonel: true },
  { anahtar: "konum", etiket: "Konum", ikon: "location-outline", placeholder: "ana_sayfa / duyurular", yazim: "none" },
  { anahtar: "sira", etiket: "Sıra", ikon: "reorder-three-outline", placeholder: "0", keyboardType: "numeric", sayisal: true },
];

const AIDAT_ALANLARI = [
  { anahtar: "kullanici_id", etiket: "Üye ID", ikon: "person-outline", placeholder: "Üye numarası", keyboardType: "numeric", sayisal: true },
  { anahtar: "yil", etiket: "Yıl", ikon: "calendar-outline", placeholder: "2025", keyboardType: "numeric", sayisal: true },
  { anahtar: "ay", etiket: "Ay", placeholder: "Seçin", secim: "aylar" },
  { anahtar: "tutar", etiket: "Tutar (₺)", ikon: "cash-outline", placeholder: "500", keyboardType: "numeric", sayisal: true },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Not (opsiyonel)", multiline: true, opsiyonel: true },
];

const BAGIS_ALANLARI = [
  { anahtar: "tutar", etiket: "Tutar (₺)", ikon: "cash-outline", placeholder: "250", keyboardType: "numeric", sayisal: true },
  { anahtar: "durum", etiket: "Durum", placeholder: "Seçin", secim: "bagisDurum" },
  { anahtar: "ad", etiket: "Ad Soyad", ikon: "person-outline", placeholder: "Bağışçı adı" },
  { anahtar: "email", etiket: "E-posta", ikon: "mail-outline", placeholder: "bagis@ornek.com", keyboardType: "email-address", yazim: "none" },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Bağış amacı (opsiyonel)", multiline: true, opsiyonel: true },
];

const REHBER_ALANLARI = [
  { anahtar: "ad", etiket: "Ad", ikon: "storefront-outline", placeholder: "Kahvehane / Fırın adı" },
  { anahtar: "kategori", etiket: "Kategori", ikon: "pricetag-outline", placeholder: "Kafe / Fırın / Bakkal / Tarım", yazim: "words" },
  { anahtar: "telefon", etiket: "Telefon", ikon: "call-outline", placeholder: "0532 111 22 33", keyboardType: "phone-pad", yazim: "none", opsiyonel: true },
  { anahtar: "adres", etiket: "Adres", ikon: "location-outline", placeholder: "Mahalle, Sokak", opsiyonel: true },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "Kısa tanıtım (opsiyonel)", multiline: true, opsiyonel: true },
  { anahtar: "fotograf_url", etiket: "Fotoğraf", ikon: "image-outline", placeholder: "Görsel URL (opsiyonel)", keyboardType: "url", yazim: "none", opsiyonel: true },
];

const ILAN_ALANLARI = [
  { anahtar: "baslik", etiket: "Başlık", ikon: "pricetag-outline", placeholder: "İlan başlığı" },
  { anahtar: "kategori", etiket: "Kategori", ikon: "grid-outline", placeholder: "Satılık / Alınık / Bulundu / Kayıp", yazim: "words" },
  { anahtar: "fiyat", etiket: "Fiyat (₺)", ikon: "cash-outline", placeholder: "0", keyboardType: "numeric", sayisal: true, opsiyonel: true },
  { anahtar: "aciklama", etiket: "Açıklama", ikon: "document-text-outline", placeholder: "İlan açıklaması...", multiline: true },
  { anahtar: "telefon", etiket: "Telefon", ikon: "call-outline", placeholder: "0532 111 22 33", keyboardType: "phone-pad", yazim: "none", opsiyonel: true },
  { anahtar: "fotograf_url", etiket: "Fotoğraf", ikon: "image-outline", placeholder: "Görsel URL (opsiyonel)", keyboardType: "url", yazim: "none", opsiyonel: true },
];

// Cub tcognitive: ortak başlangıç form değerleri
const BOS_FORM = {};

// Kayıt yönetimi (CRUD) modülleri
export const KAYIT_MODULLERI = {
  duyuru: {
    ekranAdi: "YonetimDuyuru",
    baslik: "Duyuru Yönetimi",
    altBaslik: "Yeni duyuru ekleyin veya mevcutları düzenleyin",
    ekleBaslik: "Yeni Duyuru",
    alanlar: DUYURU_ALANLARI,
    listele: duyurular,
    ekle: duyuruEkle,
    guncelle: duyuruGuncelle,
    sil: duyuruSil,
    bosMetin: "Henüz duyuru eklenmemiş",
    bosIkon: "megaphone-outline",
    satirBirincil: (d) => d.baslik,
    satirIkincil: (d) => d.icerik,
    satirRozet: (d) => d.kategori,
  },
  etkinlik: {
    ekranAdi: "YonetimEtkinlik",
    baslik: "Etkinlik Yönetimi",
    altBaslik: "Etkinlik ekleyin, düzenleyin veya silin",
    ekleBaslik: "Yeni Etkinlik",
    alanlar: ETKINLIK_ALANLARI,
    listele: etkinlikler,
    ekle: etkinlikEkle,
    guncelle: etkinlikGuncelle,
    sil: etkinlikSil,
    bosMetin: "Henüz etkinlik eklenmemiş",
    bosIkon: "calendar-outline",
    satirBirincil: (e) => e.baslik,
    satirIkincil: (e) => `${e.tarih ? new Date(e.tarih).toLocaleString("tr-TR") : ""} · ${e.yer || ""}`.trim(),
    satirRozet: (e) => `${e.kayitli ?? 0}/${e.kontenjan ?? 0}`,
  },
  galeri: {
    ekranAdi: "YonetimGaleri",
    baslik: "Galeri Yönetimi",
    altBaslik: "Fotoğraf ekleyin, düzenleyin veya silin",
    ekleBaslik: "Yeni Fotoğraf",
    alanlar: GALERI_ALANLARI,
    listele: galeri,
    ekle: galeriEkle,
    guncelle: galeriGuncelle,
    sil: galeriSil,
    bosMetin: "Galeride henüz fotoğraf yok",
    bosIkon: "images-outline",
    satirBirincil: (g) => g.baslik,
    satirIkincil: (g) => g.aciklama,
    satirRozet: () => "Fotoğraf",
  },
  video: {
    ekranAdi: "YonetimVideo",
    baslik: "Video Yönetimi",
    altBaslik: "Video ekleyin, düzenleyin veya silin",
    ekleBaslik: "Yeni Video",
    alanlar: VIDEO_ALANLARI,
    listele: videolar,
    ekle: videoEkle,
    guncelle: videoGuncelle,
    sil: videoSil,
    bosMetin: "Henüz video eklenmemiş",
    bosIkon: "videocam-outline",
    satirBirincil: (v) => v.baslik,
    satirIkincil: (v) => v.aciklama,
    satirRozet: (v) => v.kategori,
  },
  reklam: {
    ekranAdi: "YonetimReklam",
    baslik: "Reklam Yönetimi",
    altBaslik: "Reklam alanlarını yönetin",
    ekleBaslik: "Yeni Reklam",
    alanlar: REKLAM_ALANLARI,
    listele: reklamlarTumu,
    ekle: reklamEkle,
    guncelle: reklamGuncelle,
    sil: reklamSil,
    bosMetin: "Henüz reklam eklenmemiş",
    bosIkon: "megaphone-outline",
    satirBirincil: (r) => r.baslik,
    satirIkincil: (r) => r.aciklama,
    satirRozet: (r) => (r.aktif ? "Aktif" : "Pasif"),
    satirRozetRenk: (r) => (r.aktif ? "#2f8f4f" : "#cc3b3b"),
  },
  aidat: {
    ekranAdi: "YonetimAidat",
    baslik: "Aidat Yönetimi",
    altBaslik: "Aidat kaydı ekleyin, ödemeleri onaylayın",
    ekleBaslik: "Yeni Aidat",
    alanlar: AIDAT_ALANLARI,
    listele: aidatlar,
    ekle: aidatEkle,
    guncelle: aidatGuncelle,
    sil: aidatSil,
    bosMetin: "Henüz aidat kaydı yok",
    bosIkon: "card-outline",
    secimSecenekler: {
      aylar: AY_ADLARI.map((ad, i) => ({ deger: i + 1, etiket: ad })),
    },
    satirBirincil: (a) => `${a.ad || "?"} ${a.soyad || ""}`.trim(),
    satirIkincil: (a) => `${AY_ADLARI[Number(a.ay) - 1] ?? a.ay} ${a.yil} · ${a.tutar} ₺${a.aciklama ? " · " + a.aciklama : ""}`,
    satirRozet: (a) => ({ beklemede: "Bekliyor", odeyenekadar: "Ödendi bildirildi", odendi: "Ödendi", reddedildi: "Reddedildi" }[a.durum] || a.durum),
    satirRozetRenk: (a) =>
      a.durum === "odendi" ? "#2f8f4f" : a.durum === "odeyenekadar" ? "#b8860b" : a.durum === "reddedildi" ? "#cc3b3b" : "#8a5a2b",
  },
  bagis: {
    ekranAdi: "YonetimBagis",
    baslik: "Bağış Yönetimi",
    altBaslik: "Bağış bildirimlerini onaylayın",
    ekleBaslik: "Yeni Bağış",
    alanlar: BAGIS_ALANLARI,
    listele: bagislar,
    ekle: null,
    guncelle: bagisGuncelle,
    sil: bagisSil,
    bosMetin: "Henüz bağış kaydı yok",
    bosIkon: "heart-outline",
    secimSecenekler: {
      bagisDurum: [
        { deger: "beklemede", etiket: "Bekliyor" },
        { deger: "onaylandi", etiket: "Onaylandı" },
        { deger: "reddedildi", etiket: "Reddedildi" },
      ],
    },
    satirBirincil: (b) => b.ad || "Anonim",
    satirIkincil: (b) => `${b.tutar} ₺${b.aciklama ? " · " + b.aciklama : ""}`,
    satirRozet: (b) => ({ beklemede: "Bekliyor", onaylandi: "Onaylandı", reddedildi: "Reddedildi" }[b.durum] || b.durum),
    satirRozetRenk: (b) =>
      b.durum === "onaylandi" ? "#2f8f4f" : b.durum === "reddedildi" ? "#cc3b3b" : "#8a5a2b",
  },
  rehber: {
    ekranAdi: "YonetimRehber",
    baslik: "Rehber Yönetimi",
    altBaslik: "Köy rehberi kayıtlarını yönetin",
    ekleBaslik: "Yeni Kayıt",
    alanlar: REHBER_ALANLARI,
    listele: rehber,
    ekle: rehberEkle,
    guncelle: rehberGuncelle,
    sil: rehberSil,
    bosMetin: "Rehberde henüz kayıt yok",
    bosIkon: "storefront-outline",
    satirBirincil: (r) => r.ad,
    satirIkincil: (r) => [r.kategori, r.telefon, r.adres].filter(Boolean).join(" · "),
    satirRozet: (r) => r.kategori || "Genel",
  },
  ilan: {
    ekranAdi: "YonetimIlan",
    baslik: "İlan Yönetimi",
    altBaslik: "İlanları görüntüleyin, onaylayın veya kapatın",
    ekleBaslik: "Yeni İlan",
    alanlar: ILAN_ALANLARI,
    listele: () => ilanlar(null, false),
    ekle: ilanEkle,
    guncelle: ilanGuncelle,
    sil: ilanSil,
    bosMetin: "Henüz ilan eklenmemiş",
    bosIkon: "megaphone-outline",
    satirBirincil: (i) => i.baslik,
    satirIkincil: (i) =>
      `${[i.kategori, i.fiyat ? i.fiyat + " ₺" : ""].filter(Boolean).join(" · ")}${i.kullanici_ad ? " · " + i.kullanici_ad + " " + (i.kullanici_soyad || "") : ""}`,
    satirRozet: (i) => ({ aktif: "Aktif", beklemede: "Beklemede", kapatildi: "Kapatıldı" }[i.durum] || i.durum),
    satirRozetRenk: (i) =>
      i.durum === "aktif" ? "#2f8f4f" : i.durum === "kapatildi" ? "#cc3b3b" : "#8a5a2b",
  },
};

export function bosForm(alanlar) {
  const bos = {};
  alanlar.forEach((a) => {
    bos[a.anahtar] = "";
  });
  return bos;
}

export function formDoldur(alanlar, kayit) {
  const bos = bosForm(alanlar);
  alanlar.forEach((a) => {
    const deger = kayit?.[a.anahtar];
    if (deger !== undefined && deger !== null) {
      bos[a.anahtar] = String(deger);
    }
  });
  return bos;
}

export function kayitRozetRenk(varlik, madde) {
  if (!varlik.satirRozetRenk) return "#2f6149";
  return varlik.satirRozetRenk(madde);
}
