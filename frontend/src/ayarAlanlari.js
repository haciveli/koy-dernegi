// Yönetim panelindeki "Site Ayarları" formunun alan tanımları.
import { paletler, govdeFontlari, baslikFontlari } from "./tema"

export const ayarGruplari = [
  {
    baslik: "Tema",
    alanlar: [
      {
        anahtar: "tema_renk",
        etiket: "Site Rengi",
        tip: "secenek",
        secenekler: [
          { deger: "ozel", etiket: "Özel Renk Seçimi" },
          ...Object.entries(paletler).map(([deger, palet]) => ({ deger, etiket: palet.ad })),
        ],
      },
      {
        anahtar: "tema_ana_renk",
        etiket: "Ana Renk (özel seçim için)",
        tip: "renk",
        varsayilan: "#2f6149",
      },
      {
        anahtar: "tema_vurgu_renk",
        etiket: "Vurgu Rengi (özel seçim için)",
        tip: "renk",
        varsayilan: "#c98a24",
      },
      {
        anahtar: "tema_font_baslik",
        etiket: "Başlık Yazı Tipi",
        tip: "secenek",
        secenekler: baslikFontlari.map((f) => ({ deger: f.deger, etiket: f.etiket })),
      },
      {
        anahtar: "tema_font_govde",
        etiket: "Gövde Yazı Tipi",
        tip: "secenek",
        secenekler: govdeFontlari.map((f) => ({ deger: f.deger, etiket: f.etiket })),
      },
    ],
  },
  {
    baslik: "Üst Banner",
    alanlar: [
      {
        anahtar: "banner_aktif",
        etiket: "Banner Durumu",
        tip: "secenek",
        secenekler: [
          { deger: "1", etiket: "Açık" },
          { deger: "0", etiket: "Kapalı" },
        ],
      },
      {
        anahtar: "banner_renk",
        etiket: "Banner Rengi",
        tip: "secenek",
        secenekler: [
          { deger: "koy", etiket: "Koyu Yeşil" },
          { deger: "amber", etiket: "Amber" },
          { deger: "kirmizi", etiket: "Kırmızı" },
          { deger: "yesil", etiket: "Yeşil" },
          { deger: "lacivert", etiket: "Lacivert" },
        ],
      },
      { anahtar: "banner_metin", etiket: "Banner Metni", tip: "uzun" },
      { anahtar: "banner_link", etiket: "Bağlantı (örn. /duyurular)", tip: "metin" },
      { anahtar: "banner_buton", etiket: "Buton Metni (boş bırakılırsa gizlenir)", tip: "metin" },
    ],
  },
  {
    baslik: "Genel",
    alanlar: [
      { anahtar: "site_adi", etiket: "Site Adı", tip: "metin" },
      { anahtar: "site_kisa_aciklama", etiket: "Slogan / Kısa Açıklama", tip: "metin" },
      { anahtar: "footer_metni", etiket: "Footer Açıklaması", tip: "uzun" },
      { anahtar: "telif_metni", etiket: "Telif Metni", tip: "metin" },
    ],
  },
  {
    baslik: "İletişim Bilgileri",
    alanlar: [
      { anahtar: "iletisim_baslik", etiket: "Sayfa Başlığı", tip: "metin" },
      { anahtar: "iletisim_alt_baslik", etiket: "Sayfa Alt Başlığı", tip: "metin" },
      { anahtar: "iletisim_adres", etiket: "Adres", tip: "metin" },
      { anahtar: "iletisim_telefon", etiket: "Telefon", tip: "metin" },
      { anahtar: "iletisim_email", etiket: "E-posta", tip: "metin" },
      { anahtar: "ofis_saatleri", etiket: "Ofis Saatleri (her satır bir satır)", tip: "uzun" },
    ],
  },
  {
    baslik: "Aidat & Bağış",
    alanlar: [
      { anahtar: "aidat_aylik_tutar", etiket: "Aylık Aidat (₺)", tip: "metin" },
      { anahtar: "aidat_yillik_tutar", etiket: "Yıllık Aidat (₺)", tip: "metin" },
      { anahtar: "aidat_banka", etiket: "Aidat - Banka", tip: "metin" },
      { anahtar: "aidat_iban", etiket: "Aidat - IBAN", tip: "metin" },
      { anahtar: "aidat_alici", etiket: "Aidat - Alıcı Adı", tip: "metin" },
      { anahtar: "aidat_aciklama", etiket: "Aidat - Havale Açıklaması", tip: "uzun" },
      { anahtar: "bagis_banka", etiket: "Bağış - Banka", tip: "metin" },
      { anahtar: "bagis_iban", etiket: "Bağış - IBAN", tip: "metin" },
      { anahtar: "bagis_alici", etiket: "Bağış - Alıcı Adı", tip: "metin" },
      { anahtar: "bagis_aciklama", etiket: "Bağış - Açıklama", tip: "uzun" },
    ],
  },
  {
    baslik: "Ana Sayfa",
    alanlar: [
      { anahtar: "ana_hero_baslik", etiket: "Büyük Başlık", tip: "metin" },
      { anahtar: "ana_hero_alt_baslik", etiket: "Açıklama", tip: "uzun" },
      { anahtar: "ana_hero_aciklama", etiket: "Alt Açıklama", tip: "metin" },
    ],
  },
  {
    baslik: "Hakkımızda",
    alanlar: [
      { anahtar: "hakkimizda_baslik", etiket: "Sayfa Başlığı", tip: "metin" },
      { anahtar: "hakkimizda_ust_metin", etiket: "Giriş Metni", tip: "uzun" },
      { anahtar: "hakkimizda_misyon_metin", etiket: "Misyon Giriş Metni", tip: "uzun" },
    ],
  },
  {
    baslik: "Sayfa Başlıkları",
    alanlar: [
      { anahtar: "etkinlikler_baslik", etiket: "Etkinlikler - Başlık", tip: "metin" },
      { anahtar: "etkinlikler_alt_baslik", etiket: "Etkinlikler - Alt Başlık", tip: "metin" },
      { anahtar: "duyurular_baslik", etiket: "Duyurular - Başlık", tip: "metin" },
      { anahtar: "duyurular_alt_baslik", etiket: "Duyurular - Alt Başlık", tip: "metin" },
      { anahtar: "galeri_baslik", etiket: "Galeri - Başlık", tip: "metin" },
      { anahtar: "galeri_alt_baslik", etiket: "Galeri - Alt Başlık", tip: "metin" },
      { anahtar: "videolar_baslik", etiket: "Videolar - Başlık", tip: "metin" },
      { anahtar: "videolar_alt_baslik", etiket: "Videolar - Alt Başlık", tip: "metin" },
      { anahtar: "rehber_baslik", etiket: "Rehber - Başlık", tip: "metin" },
      { anahtar: "rehber_alt_baslik", etiket: "Rehber - Alt Başlık", tip: "metin" },
      { anahtar: "ilanlar_baslik", etiket: "İlan Panosu - Başlık", tip: "metin" },
      { anahtar: "ilanlar_alt_baslik", etiket: "İlan Panosu - Alt Başlık", tip: "metin" },
      { anahtar: "toplantilar_baslik", etiket: "Toplantılar - Başlık", tip: "metin" },
      { anahtar: "toplantilar_alt_baslik", etiket: "Toplantılar - Alt Başlık", tip: "metin" },
      { anahtar: "uyelik_baslik", etiket: "Üyelik - Başlık", tip: "metin" },
      { anahtar: "uyelik_alt_baslik", etiket: "Üyelik - Alt Başlık", tip: "metin" },
    ],
  },
]

export const listeAlanlari = [
  {
    anahtar: "ana_ozellikler",
    etiket: "Ana Sayfa Özellik Kartları",
    aciklama: 'Her öğe: {"baslik": "...", "aciklama": "..."}',
  },
  {
    anahtar: "hakkimizda_degerler",
    etiket: "Hakkımızda Değerleri",
    aciklama: 'Her öğe: {"baslik": "...", "aciklama": "..."}',
  },
  {
    anahtar: "hakkimizda_misyon_maddeleri",
    etiket: "Misyon Maddeleri",
    aciklama: "Her öğe bir metin satırıdır.",
  },
  {
    anahtar: "yonetim_kurulu",
    etiket: "Yönetim Kurulu",
    aciklama: 'Her öğe: {"ad": "...", "gorev": "...", "aciklama": "..."}',
  },
]
