// Hazir tema paletleri. Eklenecek tema -> renk takimi.
// "yapilandir" uyumlu kalan anahtar adlari: ana*, vurgu*, arkaplan, kart, metin, metin_soluk, sinir,
// tehlikeli, bilgi, basarili.
export const TEMALAR = {
  yesil: {
    ana: "#2f6149",
    ana_koyu: "#27503d",
    ana_acik: "#63977c",
    ana_50: "#f2f7f4",
    ana_100: "#dcebe1",
    ana_200: "#bcd7c6",
    ana_300: "#91b9a2",
    ana_400: "#63977c",
    ana_500: "#427a5f",
    ana_600: "#2f6149",
    ana_700: "#27503d",
    ana_800: "#214233",
    ana_900: "#1c372b",
    ana_950: "#0f231b",

    vurgu: "#c98a24",
    vurgu_300: "#e8bf63",
    vurgu_500: "#c98a24",
    vurgu_600: "#a86a1b",
    vurgu_700: "#854e19",
    vurgu_100: "#f9edcf",

    arkaplan: "#f6f8f7",
    kart: "#ffffff",
    metin: "#1c372b",
    metin_soluk: "#64756d",
    sinir: "#e2e8e5",

    tehlikeli: "#cc3b3b",
    bilgi: "#2158a8",
    basarili: "#427a5f",
  },

  mavi: {
    ana: "#1d4e8f",
    ana_koyu: "#173f73",
    ana_acik: "#5b8ac4",
    ana_50: "#eff5fc",
    ana_100: "#dbe6f5",
    ana_200: "#b9cde8",
    ana_300: "#8fadd6",
    ana_400: "#5b8ac4",
    ana_500: "#376ba8",
    ana_600: "#1d4e8f",
    ana_700: "#173f73",
    ana_800: "#14345c",
    ana_900: "#122b4c",
    ana_950: "#0a1b31",

    vurgu: "#e08e0b",
    vurgu_300: "#f2c266",
    vurgu_500: "#e08e0b",
    vurgu_600: "#b56e08",
    vurgu_700: "#8f5506",
    vurgu_100: "#fcf0d5",

    arkaplan: "#f4f7fb",
    kart: "#ffffff",
    metin: "#122b4c",
    metin_soluk: "#5d728c",
    sinir: "#e0e6ee",

    tehlikeli: "#cc3b3b",
    bilgi: "#2158a8",
    basarili: "#376ba8",
  },

  bordo: {
    ana: "#7a2334",
    ana_koyu: "#631c2a",
    ana_acik: "#a85b6b",
    ana_50: "#faf1f3",
    ana_100: "#f0dce1",
    ana_200: "#ddb7c0",
    ana_300: "#c68d9a",
    ana_400: "#a85b6b",
    ana_500: "#8e3a4c",
    ana_600: "#7a2334",
    ana_700: "#631c2a",
    ana_800: "#521a26",
    ana_900: "#441821",
    ana_950: "#2b0d13",

    vurgu: "#c9871e",
    vurgu_300: "#e8bd62",
    vurgu_500: "#c9871e",
    vurgu_600: "#a86b17",
    vurgu_700: "#855114",
    vurgu_100: "#f9edcf",

    arkaplan: "#faf6f6",
    kart: "#ffffff",
    metin: "#441821",
    metin_soluk: "#7c6a6e",
    sinir: "#eee2e4",

    tehlikeli: "#cc3b3b",
    bilgi: "#2158a8",
    basarili: "#7a2334",
  },

  koyu: {
    ana: "#3d4a44",
    ana_koyu: "#303a35",
    ana_acik: "#73837b",
    ana_50: "#f2f4f3",
    ana_100: "#e0e5e2",
    ana_200: "#c2cbc5",
    ana_300: "#9caba2",
    ana_400: "#73837b",
    ana_500: "#56675f",
    ana_600: "#3d4a44",
    ana_700: "#303a35",
    ana_800: "#282f2c",
    ana_900: "#222725",
    ana_950: "#131615",

    vurgu: "#d08d2e",
    vurgu_300: "#ecbe6b",
    vurgu_500: "#d08d2e",
    vurgu_600: "#ad7022",
    vurgu_700: "#88571d",
    vurgu_100: "#faeed7",

    arkaplan: "#eef1ef",
    kart: "#ffffff",
    metin: "#222725",
    metin_soluk: "#6a766f",
    sinir: "#dde2df",

    tehlikeli: "#cc3b3b",
    bilgi: "#2158a8",
    basarili: "#56675f",
  },
};

// Yonetim panelindeki "Tema" ayarlariyla ayni paletleri karsilar.
// Web'de secilen tema_renk degeri bu anahtarlarla eslestirilir.
const WEB_TEMALAR = {
  lacivert: {
    ana_50: "#eff4fb",
    ana_100: "#dae6f4",
    ana_200: "#b6cee9",
    ana_300: "#87b0de",
    ana_400: "#5189d0",
    ana_500: "#2f6cc2",
    ana_600: "#2158a8",
    ana_700: "#1c4a8c",
    ana_800: "#1b3d70",
    ana_900: "#16305a",
    ana_950: "#0b1d38",
  },
  kirmizi: {
    ana_50: "#fef2f2",
    ana_100: "#fce4e4",
    ana_200: "#fbcece",
    ana_300: "#f6aaaa",
    ana_400: "#ee7a7a",
    ana_500: "#e05252",
    ana_600: "#cc3b3b",
    ana_700: "#ae2c2c",
    ana_800: "#952727",
    ana_900: "#6d1f1f",
    ana_950: "#3f1010",
  },
  bordo: {
    ana_50: "#fbf1f3",
    ana_100: "#f5dee2",
    ana_200: "#ebbfc8",
    ana_300: "#dc95a3",
    ana_400: "#c76577",
    ana_500: "#a83c52",
    ana_600: "#8b2c41",
    ana_700: "#732537",
    ana_800: "#5f2130",
    ana_900: "#4e1d2a",
    ana_950: "#2c0d16",
  },
  turuncu: {
    ana_50: "#fff8ed",
    ana_100: "#ffefd5",
    ana_200: "#ffdda9",
    ana_300: "#ffc276",
    ana_400: "#f89b3d",
    ana_500: "#f07f1c",
    ana_600: "#d7640f",
    ana_700: "#b34b10",
    ana_800: "#8f3c13",
    ana_900: "#703112",
    ana_950: "#3c1807",
  },
  mor: {
    ana_50: "#f6f2fc",
    ana_100: "#eadcf7",
    ana_200: "#d4b8ee",
    ana_300: "#b489dd",
    ana_400: "#9361c4",
    ana_500: "#7848a6",
    ana_600: "#61378a",
    ana_700: "#4f2d72",
    ana_800: "#43285e",
    ana_900: "#38234c",
    ana_950: "#221230",
  },
};

const karistir = (hex, oran, hedef) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const hr = (hedef >> 16) & 255;
  const hg = (hedef >> 8) & 255;
  const hb = hedef & 255;
  const nr = Math.round(r + (hr - r) * oran);
  const ng = Math.round(g + (hg - g) * oran);
  const nb = Math.round(b + (hb - b) * oran);
  return "#" + ((1 << 24) | (nr << 16) | (ng << 8) | nb).toString(16).slice(1);
};

const skalaUret = (hex) => ({
  ana_50: karistir(hex, 0.85, 0xffffff),
  ana_100: karistir(hex, 0.72, 0xffffff),
  ana_200: karistir(hex, 0.55, 0xffffff),
  ana_300: karistir(hex, 0.38, 0xffffff),
  ana_400: karistir(hex, 0.2, 0xffffff),
  ana_500: karistir(hex, 0.06, 0xffffff),
  ana_600: hex,
  ana_700: karistir(hex, 0.15, 0x000000),
  ana_800: karistir(hex, 0.27, 0x000000),
  ana_900: karistir(hex, 0.42, 0x000000),
  ana_950: karistir(hex, 0.6, 0x000000),
});

const vurguUret = (hex) => ({
  vurgu: hex,
  vurgu_100: karistir(hex, 0.72, 0xffffff),
  vurgu_300: karistir(hex, 0.4, 0xffffff),
  vurgu_500: hex,
  vurgu_600: karistir(hex, 0.15, 0x000000),
  vurgu_700: karistir(hex, 0.28, 0x000000),
});

// Tum temalar icin ortak vurgu (altın) rengi, web GOLD paletiyle uyumlu.
const ALTIN = {
  vurgu: "#c98a24",
  vurgu_100: "#f9edcf",
  vurgu_300: "#e8bf63",
  vurgu_500: "#c98a24",
  vurgu_600: "#a86a1b",
  vurgu_700: "#854e19",
};

// Basit tema paleti: secilen ana renge gore tamamen uretilir.
const hedefTamamla = (palet, vurgu = ALTIN) => {
  return {
    ...palet,
    ...vurgu,
    arkaplan: palet.ana_50,
    kart: "#ffffff",
    metin: palet.ana_950,
    metin_soluk: palet.ana_400,
    sinir: palet.ana_100,
    tehlikeli: "#cc3b3b",
    bilgi: "#2158a8",
    basarili: palet.ana_600,
  };
};

// Uygulamaya gomulecek varsayilan tema.
export const AKTIF_TEMA = "yesil";

export const renkler = { ...TEMALAR[AKTIF_TEMA] };

// Yonetim paneli ayarlarindaki tema bilgisine gore renk paletini gunceller.
// "ayarlar.tema_renk": yesil | mavi | lacivert | bordo | koyu | kirmizi | turuncu | mor | ozel
export function temaUygula(ayarlar = {}) {
  if (!renkler) return;
  const secim = ayarlar.tema_renk;
  let palet;
  if (secim === "ozel") {
    const ana = skalaUret(ayarlar.tema_ana_renk || "#2f6149");
    palet = hedefTamamla(ana, vurguUret(ayarlar.tema_vurgu_renk || "#c98a24"));
  } else if (secim && WEB_TEMALAR[secim]) {
    palet = hedefTamamla(WEB_TEMALAR[secim]);
  } else {
    palet = TEMALAR[secim] || TEMALAR[AKTIF_TEMA];
  }
  Object.assign(renkler, palet);
}

export const olcutler = {
  yatay_padding: 16,
  kart_radius: 14,
  buton_radius: 10,
};