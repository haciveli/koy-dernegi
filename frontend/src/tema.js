// Tema paletleri ve yazı tipi seçenekleri.
// Yönetim panelindeki "Tema" grubu buradan beslenir ve seçilen değerler
// çalışma zamanında CSS değişkenleri üzerinden uygulanır.

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

const GOLD = {
  50: "#fdf8ee",
  100: "#f9edcf",
  200: "#f2d99c",
  300: "#e8bf63",
  400: "#dda63c",
  500: "#c98a24",
  600: "#a86a1b",
  700: "#854e19",
  800: "#6e3f1b",
  900: "#5e361a",
}

export const paletler = {
  yesil: {
    ad: "Orman Yeşili",
    koy: {
      50: "#f2f7f4",
      100: "#dcebe1",
      200: "#bcd7c6",
      300: "#91b9a2",
      400: "#63977c",
      500: "#427a5f",
      600: "#2f6149",
      700: "#27503d",
      800: "#214233",
      900: "#1c372b",
      950: "#0f231b",
    },
  },
  lacivert: {
    ad: "Lacivert",
    koy: {
      50: "#eff4fb",
      100: "#dae6f4",
      200: "#b6cee9",
      300: "#87b0de",
      400: "#5189d0",
      500: "#2f6cc2",
      600: "#2158a8",
      700: "#1c4a8c",
      800: "#1b3d70",
      900: "#16305a",
      950: "#0b1d38",
    },
  },
  bordo: {
    ad: "Bordo",
    koy: {
      50: "#fbf1f3",
      100: "#f5dee2",
      200: "#ebbfc8",
      300: "#dc95a3",
      400: "#c76577",
      500: "#a83c52",
      600: "#8b2c41",
      700: "#732537",
      800: "#5f2130",
      900: "#4e1d2a",
      950: "#2c0d16",
    },
  },
  kirmizi: {
    ad: "Kırmızı",
    koy: {
      50: "#fef2f2",
      100: "#fce4e4",
      200: "#fbcece",
      300: "#f6aaaa",
      400: "#ee7a7a",
      500: "#e05252",
      600: "#cc3b3b",
      700: "#ae2c2c",
      800: "#952727",
      900: "#6d1f1f",
      950: "#3f1010",
    },
  },
  turuncu: {
    ad: "Turuncu",
    koy: {
      50: "#fff8ed",
      100: "#ffefd5",
      200: "#ffdda9",
      300: "#ffc276",
      400: "#f89b3d",
      500: "#f07f1c",
      600: "#d7640f",
      700: "#b34b10",
      800: "#8f3c13",
      900: "#703112",
      950: "#3c1807",
    },
  },
  mor: {
    ad: "Mor",
    koy: {
      50: "#f6f2fc",
      100: "#eadcf7",
      200: "#d4b8ee",
      300: "#b489dd",
      400: "#9361c4",
      500: "#7848a6",
      600: "#61378a",
      700: "#4f2d72",
      800: "#43285e",
      900: "#38234c",
      950: "#221230",
    },
  },
}

Object.values(paletler).forEach((palet) => {
  palet.vurgu = GOLD
  palet.golge = hexToRgb(palet.koy[600])
})

const karistir = (hex, oran, hedef) => {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const hr = (hedef >> 16) & 255
  const hg = (hedef >> 8) & 255
  const hb = hedef & 255
  const nr = Math.round(r + (hr - r) * oran)
  const ng = Math.round(g + (hg - g) * oran)
  const nb = Math.round(b + (hb - b) * oran)
  return "#" + ((1 << 24) | (nr << 16) | (ng << 8) | nb).toString(16).slice(1)
}

const anaSkala = (hex) => ({
  50: karistir(hex, 0.85, 0xffffff),
  100: karistir(hex, 0.72, 0xffffff),
  200: karistir(hex, 0.55, 0xffffff),
  300: karistir(hex, 0.38, 0xffffff),
  400: karistir(hex, 0.2, 0xffffff),
  500: karistir(hex, 0.06, 0xffffff),
  600: hex,
  700: karistir(hex, 0.15, 0x000000),
  800: karistir(hex, 0.27, 0x000000),
  900: karistir(hex, 0.42, 0x000000),
  950: karistir(hex, 0.6, 0x000000),
})

const vurguSkala = (hex) => ({
  50: karistir(hex, 0.85, 0xffffff),
  100: karistir(hex, 0.72, 0xffffff),
  200: karistir(hex, 0.55, 0xffffff),
  300: karistir(hex, 0.4, 0xffffff),
  400: karistir(hex, 0.22, 0xffffff),
  500: hex,
  600: karistir(hex, 0.15, 0x000000),
  700: karistir(hex, 0.28, 0x000000),
  800: karistir(hex, 0.42, 0x000000),
  900: karistir(hex, 0.55, 0x000000),
})

export const govdeFontlari = [
  { deger: "Inter", etiket: "Inter", kalinliklar: [400, 500, 600, 700] },
  { deger: "Poppins", etiket: "Poppins", kalinliklar: [400, 500, 600, 700] },
  { deger: "Roboto", etiket: "Roboto", kalinliklar: [400, 500, 700] },
  { deger: "Open Sans", etiket: "Open Sans", kalinliklar: [400, 500, 600, 700, 800] },
  { deger: "Lato", etiket: "Lato", kalinliklar: [400, 700] },
  { deger: "Nunito Sans", etiket: "Nunito Sans", kalinliklar: [400, 600, 700, 800] },
]

export const baslikFontlari = [
  { deger: "Plus Jakarta Sans", etiket: "Plus Jakarta Sans", kalinliklar: [600, 700, 800] },
  { deger: "Montserrat", etiket: "Montserrat", kalinliklar: [400, 500, 600, 700, 800] },
  { deger: "Playfair Display", etiket: "Playfair Display", kalinliklar: [400, 600, 700, 800, 900] },
  { deger: "Merriweather", etiket: "Merriweather", kalinliklar: [400, 700, 900] },
  { deger: "DM Sans", etiket: "DM Sans", kalinliklar: [400, 500, 700] },
  { deger: "Outfit", etiket: "Outfit", kalinliklar: [400, 500, 600, 700, 800] },
]

const tumFontlar = [...govdeFontlari, ...baslikFontlari]
const yuklenenFontlar = new Set()

function fontlariYukle(fontAdlari) {
  const aileler = [...new Set(fontAdlari)].filter((ad) => ad && !yuklenenFontlar.has(ad))
  if (!aileler.length) return
  const sorgu = aileler.map((ad) => {
    const f = tumFontlar.find((x) => x.deger === ad)
    return `family=${ad.replace(/ /g, "+")}:wght@${((f && f.kalinliklar) || [400, 700]).join(";")}`
  })
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?${sorgu.join("&")}&display=swap`
  aileler.forEach((ad) => yuklenenFontlar.add(ad))
  document.head.appendChild(link)
}

export function temaUygula(ayarlar = {}) {
  let palet = paletler[ayarlar.tema_renk]
  if (ayarlar.tema_renk === "ozel") {
    const ana = anaSkala(ayarlar.tema_ana_renk || "#2f6149")
    const vurgu = vurguSkala(ayarlar.tema_vurgu_renk || "#c98a24")
    palet = { koy: ana, vurgu: vurgu, golge: hexToRgb(ana[600]) }
  }
  if (!palet) palet = paletler.yesil
  const govde = ayarlar.tema_font_govde || "Inter"
  const baslik = ayarlar.tema_font_baslik || "Plus Jakarta Sans"
  const st = document.documentElement.style
  Object.entries(palet.koy).forEach(([ton, deger]) => st.setProperty(`--koy-${ton}`, deger))
  Object.entries(palet.vurgu).forEach(([ton, deger]) => st.setProperty(`--vurgu-${ton}`, deger))
  st.setProperty("--golge-renk", palet.golge)
  st.setProperty("--font-govde", `'${govde}', system-ui, sans-serif`)
  st.setProperty("--font-baslik", `'${baslik}', system-ui, sans-serif`)
  fontlariYukle([govde, baslik])
}