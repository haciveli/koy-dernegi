import { useState, useEffect } from "react"
import { LayoutDashboard, Plus, Trash2, Pencil, Users, CalendarDays, Megaphone, Mail, ImagePlus, CheckCheck, Undo2, Settings, Save, Check, X, Clock, Presentation, Video, LogIn, LogOut, CreditCard, Store, ScrollText, ClipboardList, KeyRound } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import { ayarGruplari, listeAlanlari } from "../ayarAlanlari"

const girdi = "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 focus:ring-koy-500/15 focus:border-koy-500"

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
]
const ayAdi = (ay) => {
  const n = Number(ay)
  if (!n || n < 1 || n > 12) return ""
  return AY_ADLARI[n - 1]
}
const donemMetni = (a) => (Number(a.ay) === 0 ? `Tüm Yıl ${a.yil}` : `${ayAdi(a.ay)} ${a.yil}`)
const DURUM_ETIKET = {
  beklemede: { metin: "Bekliyor" },
  odeyenekadar: { metin: "Ödeme Bildirildi" },
  odendi: { metin: "Ödendi" },
  reddedildi: { metin: "Reddedildi" },
}

const TOKEN_ANAHTARI = "koy_dernegi_admin_token"

const tokenOku = () => localStorage.getItem(TOKEN_ANAHTARI)
const tokenKaydet = (t) => localStorage.setItem(TOKEN_ANAHTARI, t)
const tokenTemizle = () => localStorage.removeItem(TOKEN_ANAHTARI)

const api = async (url, opts = {}) => {
  const token = tokenOku()
  const r = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  })
  if (r.status === 401 || r.status === 403) {
    const veri = await r.json().catch(() => ({}))
    const hata = new Error(veri.detail || "Oturum geçersiz, tekrar giriş yapın")
    hata.yetkiHatasi = true
    throw hata
  }
  if (!r.ok) {
    const veri = await r.json().catch(() => ({}))
    throw new Error(veri.detail || "İşlem başarısız oldu")
  }
  return r.status === 204 ? null : r.json()
}

const toDateTimeLocal = (iso) => {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function YonetimPaneli() {
  const [oturum, setOturum] = useState(null)
  const [girisYukleniyor, setGirisYukleniyor] = useState(false)
  const [girisHata, setGirisHata] = useState("")
  const [girisEmail, setGirisEmail] = useState("")
  const [girisSifre, setGirisSifre] = useState("")
  const [sekme, setSekme] = useState("duyurular")
  const [kullanicilar, setKullanicilar] = useState([])
  const [duyurular, setDuyurular] = useState([])
  const [etkinlikler, setEtkinlikler] = useState([])
  const [iletisimler, setIletisimler] = useState([])
  const [galeri, setGaleri] = useState([])
  const [videolar, setVideolar] = useState([])
  const [videoForm, setVideoForm] = useState({ baslik: "", video_url: "", kapak_url: "", aciklama: "", kategori: "Genel" })
  const [videoDuzenleme, setVideoDuzenleme] = useState(null)
  const [reklamlar, setReklamlar] = useState([])
  const [reklamForm, setReklamForm] = useState({ baslik: "", aciklama: "", resim_url: "", link_url: "", konum: "ana_sayfa", aktif: true, sira: 0 })
  const [reklamDuzenleme, setReklamDuzenleme] = useState(null)
  const [ayarlar, setAyarlar] = useState({})
  const [ayarKaydediliyor, setAyarKaydediliyor] = useState(false)
  const [bildirim, setBildirim] = useState(null)
  const [aidatlar, setAidatlar] = useState([])
  const [bagislar, setBagislar] = useState([])
  const [rehber, setRehber] = useState([])
  const [rehberForm, setRehberForm] = useState({ ad: "", kategori: "Genel", telefon: "", adres: "", aciklama: "", fotograf_url: "" })
  const [rehberDuzenleme, setRehberDuzenleme] = useState(null)
  const [rehberKaydediliyor, setRehberKaydediliyor] = useState(false)
  const [ilanlar, setIlanlar] = useState([])
  const [ilanForm, setIlanForm] = useState({ baslik: "", kategori: "Satılık", fiyat: "", aciklama: "", telefon: "" })
  const [ilanDuzenleme, setIlanDuzenleme] = useState(null)
  const [ilanKaydediliyor, setIlanKaydediliyor] = useState(false)
  const [toplantilar, setToplantilar] = useState([])
  const [toplantiForm, setToplantiForm] = useState({ baslik: "", aciklama: "", tarih: "", yer: "", video_url: "", durum: "planlandi", gundem: "", tutanak: "" })
  const [toplantiDuzenleme, setToplantiDuzenleme] = useState(null)
  const [toplantiKaydediliyor, setToplantiKaydediliyor] = useState(false)
  const [oylemeSecenek, setOylamaSecenek] = useState({ konu: "", secenekler: "" })
  const [aidatForm, setAidatForm] = useState({ kullanici_id: "", yil: String(new Date().getFullYear()), ay: String(new Date().getMonth() + 1), tutar: "", aciklama: "" })
  const [aidatEklemeYukleniyor, setAidatEklemeYukleniyor] = useState(false)
  const [hatirlatmaAcik, setHatirlatmaAcik] = useState(false)
  const [hatirlatmaForm, setHatirlatmaForm] = useState({ yil: String(new Date().getFullYear()), ay: "0" })
  const [hatirlatmaYukleniyor, setHatirlatmaYukleniyor] = useState(false)
  const { yenile: ayarlariYenile } = useAyarlar()
  const [sifreForm, setSifreForm] = useState({ mevcut: "", yeni: "" })
  const [sifreDegistiriliyor, setSifreDegistiriliyor] = useState(false)

  const [duzenleme, setDuzenleme] = useState({ duyuru: null, etkinlik: null, galeri: null })
  const [form, setForm] = useState({
    duyuru: { baslik: "", icerik: "", kategori: "Genel" },
    etkinlik: { baslik: "", aciklama: "", tarih: "", yer: "", kontenjan: 50 },
    galeri: { baslik: "", resim_url: "", aciklama: "" },
  })

  useEffect(() => {
    const token = tokenOku()
    if (token) {
      api("/api/ben")
        .then((bilgi) => {
          if (bilgi.rol !== "yonetici") throw new Error("yetki yok")
          setOturum(bilgi)
          verileriYukle()
        })
        .catch(() => tokenTemizle())
    }
  }, [])

  const girisYap = async (e) => {
    e.preventDefault()
    setGirisYukleniyor(true)
    setGirisHata("")
    try {
      const yanit = await api("/api/giris", {
        method: "POST",
        body: JSON.stringify({ email: girisEmail.trim().toLowerCase(), sifre: girisSifre }),
      })
      tokenKaydet(yanit.access_token)
      const bilgi = await api("/api/ben")
      if (bilgi.rol !== "yonetici") {
        tokenTemizle()
        throw new Error("Yönetici yetkisi olmayan bir hesapla giriş yapılamaz")
      }
      setOturum(bilgi)
      await verileriYukle()
    } catch (hata) {
      setGirisHata(hata.message || "Giriş başarısız")
      tokenTemizle()
    } finally {
      setGirisYukleniyor(false)
    }
  }

  const cikisYap = () => {
    tokenTemizle()
    setOturum(null)
    setGirisEmail("")
    setGirisSifre("")
  }

  const verileriYukle = async () => {
    const [k, d, e, i, g, ay, r, ad, b, rb, il, tp] = await Promise.all([
      api("/api/kullanicilar").catch(() => []),
      api("/api/duyurular").catch(() => []),
      api("/api/etkinlikler").catch(() => []),
      api("/api/iletisim").catch(() => []),
      api("/api/galeri").catch(() => []),
      api("/api/ayarlar").catch(() => ({})),
      api("/api/reklamlar").catch(() => []),
      api("/api/aidatlar").catch(() => []),
      api("/api/bagislar").catch(() => []),
      api("/api/rehber").catch(() => []),
      api("/api/ilanlar?sadece_aktif=false").catch(() => []),
      api("/api/toplantilar").catch(() => []),
    ])
    setKullanicilar(k); setDuyurular(d); setEtkinlikler(e); setIletisimler(i); setGaleri(g); setAyarlar(ay); setReklamlar(r); setAidatlar(ad); setBagislar(b); setRehber(rb); setIlanlar(il); setToplantilar(tp)
    api("/api/videolar").then((v) => { if (Array.isArray(v)) setVideolar(v) }).catch(() => {})
  }

  const mesajVer = (metin, tip = "basarili") => {
    setBildirim({ metin, tip })
    setTimeout(() => setBildirim(null), 4000)
  }

  const yetkiHatasi = (hata) => {
    if (hata?.yetkiHatasi) {
      cikisYap()
      return true
    }
    return false
  }

  const hatirlatGonder = async (e) => {
    e.preventDefault()
    const yil = Number(hatirlatmaForm.yil)
    const ay = Number(hatirlatmaForm.ay ?? 0)
    if (!yil || yil < 2000 || yil > 2100) {
      mesajVer("Geçerli bir yıl girin", "hata")
      return
    }
    if (ay < 0 || ay > 12) {
      mesajVer("Dönem seçin", "hata")
      return
    }
    setHatirlatmaYukleniyor(true)
    try {
      const sonuc = await api("/api/aidatlar/hatirlat", {
        method: "POST",
        body: JSON.stringify({ yil, ay }),
      })
      setHatirlatmaAcik(false)
      mesajVer(
        sonuc?.gonderilen > 0
          ? `${sonuc.hedef_sayi} üye hedeflendi, ${sonuc.gonderilen} cihaza bildirim iletildi.`
          : sonuc?.mesaj || "Bildirim gönderilecek üye bulunamadı."
      )
    } catch (err) {
      if (yetkiHatasi(err)) return
      mesajVer(err.message, "hata")
    } finally {
      setHatirlatmaYukleniyor(false)
    }
  }

  const rehberKaydet = async (e) => {
    e.preventDefault()
    try {
      await api(rehberDuzenleme ? `/api/rehber/${rehberDuzenleme}` : "/api/rehber", {
        method: rehberDuzenleme ? "PUT" : "POST",
        body: JSON.stringify(rehberForm),
      })
      mesajVer(rehberDuzenleme ? "Rehber kaydı güncellendi!" : "Rehber kaydı eklendi!")
      rehberIptal()
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const rehberDuzenleBasla = (r) => {
    setRehberDuzenleme(r.id)
    setRehberForm({ ad: r.ad || "", kategori: r.kategori || "Genel", telefon: r.telefon || "", adres: r.adres || "", aciklama: r.aciklama || "", fotograf_url: r.fotograf_url || "" })
  }

  const rehberIptal = () => {
    setRehberDuzenleme(null)
    setRehberForm({ ad: "", kategori: "Genel", telefon: "", adres: "", aciklama: "", fotograf_url: "" })
  }

  const rehberSil = async (id) => {
    if (!window.confirm("Bu rehber kaydını silmek istediğinize emin misiniz?")) return
    try {
      await api(`/api/rehber/${id}`, { method: "DELETE" })
      mesajVer("Rehber kaydı silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const ilanKaydet = async (e) => {
    e.preventDefault()
    try {
      await api(ilanDuzenleme ? `/api/ilanlar/${ilanDuzenleme}` : "/api/ilanlar", {
        method: ilanDuzenleme ? "PUT" : "POST",
        body: JSON.stringify(ilanForm),
      })
      mesajVer(ilanDuzenleme ? "İlan güncellendi!" : "İlan eklendi!")
      ilanIptal()
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const ilanDuzenleBasla = (il) => {
    setIlanDuzenleme(il.id)
    setIlanForm({ baslik: il.baslik || "", kategori: il.kategori || "Satılık", fiyat: il.fiyat || "", aciklama: il.aciklama || "", telefon: il.telefon || "" })
  }

  const ilanIptal = () => {
    setIlanDuzenleme(null)
    setIlanForm({ baslik: "", kategori: "Satılık", fiyat: "", aciklama: "", telefon: "" })
  }

  const ilanSil = async (id) => {
    if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return
    try {
      await api(`/api/ilanlar/${id}`, { method: "DELETE" })
      mesajVer("İlan silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const ilanDurum = async (il, durum) => {
    try {
      await api(`/api/ilanlar/${il.id}`, { method: "PUT", body: JSON.stringify({ durum }) })
      mesajVer("İlan durumu güncellendi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const toplantiKaydet = async (e) => {
    e.preventDefault()
    const gundem = toplantiForm.gundem
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean)
      .map((baslik, sira) => ({ baslik, sira: sira + 1 }))
    try {
      await api(toplantiDuzenleme ? `/api/toplantilar/${toplantiDuzenleme}` : "/api/toplantilar", {
        method: toplantiDuzenleme ? "PUT" : "POST",
        body: JSON.stringify({ ...toplantiForm, gundem, tarih: toplantiForm.tarih ? new Date(toplantiForm.tarih).toISOString() : null }),
      })
      mesajVer(toplantiDuzenleme ? "Toplantı güncellendi!" : "Toplantı eklendi!")
      toplantiIptal()
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const toplantiDuzenleBasla = (t) => {
    setToplantiDuzenleme(t.id)
    setToplantiForm({
      baslik: t.baslik || "",
      aciklama: t.aciklama || "",
      tarih: t.tarih ? toDateTimeLocal(t.tarih) : "",
      yer: t.yer || "",
      video_url: t.video_url || "",
      durum: t.durum || "planlandi",
      gundem: (t.gundem || []).map((g) => g.baslik).join("\n"),
      tutanak: t.tutanak || "",
    })
  }

  const toplantiIptal = () => {
    setToplantiDuzenleme(null)
    setToplantiForm({ baslik: "", aciklama: "", tarih: "", yer: "", video_url: "", durum: "planlandi", gundem: "", tutanak: "" })
  }

  const toplantiSil = async (id) => {
    if (!window.confirm("Bu toplantıyı silmek istediğinize emin misiniz?")) return
    try {
      await api(`/api/toplantilar/${id}`, { method: "DELETE" })
      mesajVer("Toplantı silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const oylamaEkle = async (toplantiId, e) => {
    e.preventDefault()
    const secenekler = oylemeSecenek.secenekler.split(",").map((s) => s.trim()).filter(Boolean)
    if (!oylemeSecenek.konu.trim() || !secenekler.length) {
      mesajVer("Oylama konusu ve seçenek zorunludur.", "hata")
      return
    }
    try {
      await api(`/api/toplantilar/${toplantiId}/oylamalar`, {
        method: "POST",
        body: JSON.stringify({ konu: oylemeSecenek.konu.trim(), secenekler }),
      })
      mesajVer("Oylama açıldı!")
      setOylamaSecenek({ konu: "", secenekler: "" })
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const oylamaSil = async (toplantiId, oylamaId) => {
    if (!window.confirm("Bu oylamayı silmek istediğinize emin misiniz?")) return
    try {
      await api(`/api/toplantilar/${toplantiId}/oylamalar/${oylamaId}`, { method: "DELETE" })
      mesajVer("Oylama silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const videoKaydet = async (e) => {
    e.preventDefault()
    try {
      await api(videoDuzenleme ? `/api/videolar/${videoDuzenleme}` : "/api/videolar", {
        method: videoDuzenleme ? "PUT" : "POST",
        body: JSON.stringify(videoForm),
      })
      mesajVer(videoDuzenleme ? "Video güncellendi!" : "Video eklendi!")
      videoIptal()
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const videoDuzenleBasla = (v) => {
    setVideoDuzenleme(v.id)
    setVideoForm({
      baslik: v.baslik || "", video_url: v.video_url || "", kapak_url: v.kapak_url || "",
      aciklama: v.aciklama || "", kategori: v.kategori || "Genel",
    })
  }

  const videoIptal = () => {
    setVideoDuzenleme(null)
    setVideoForm({ baslik: "", video_url: "", kapak_url: "", aciklama: "", kategori: "Genel" })
  }

  const videoSil = async (id) => {
    if (!window.confirm("Bu videoyu silmek istediğinize emin misiniz?")) return
    try {
      await api(`/api/videolar/${id}`, { method: "DELETE" })
      mesajVer("Video silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const reklamKaydet = async (e) => {
    e.preventDefault()
    try {
      await api(reklamDuzenleme ? `/api/reklamlar/${reklamDuzenleme}` : "/api/reklamlar", {
        method: reklamDuzenleme ? "PUT" : "POST",
        body: JSON.stringify(reklamForm),
      })
      mesajVer(reklamDuzenleme ? "Reklam güncellendi!" : "Reklam eklendi!")
      reklamIptal()
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const reklamDuzenleBasla = (r) => {
    setReklamDuzenleme(r.id)
    setReklamForm({
      baslik: r.baslik || "", aciklama: r.aciklama || "", resim_url: r.resim_url || "",
      link_url: r.link_url || "", konum: r.konum || "ana_sayfa", aktif: r.aktif, sira: r.sira || 0,
    })
  }

  const reklamIptal = () => {
    setReklamDuzenleme(null)
    setReklamForm({ baslik: "", aciklama: "", resim_url: "", link_url: "", konum: "ana_sayfa", aktif: true, sira: 0 })
  }

  const reklamSil = async (id) => {
    if (!window.confirm("Bu reklamı silmek istediğinize emin misiniz?")) return
    try {
      await api(`/api/reklamlar/${id}`, { method: "DELETE" })
      mesajVer("Reklam silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const ayarDegistir = (anahtar, deger) => setAyarlar((a) => ({ ...a, [anahtar]: deger }))

  const ayarlariKaydet = async (e) => {
    e.preventDefault()
    for (const alan of listeAlanlari) {
      const metin = ayarlar[alan.anahtar]
      if (metin && metin.trim()) {
        try {
          JSON.parse(metin)
        } catch {
          mesajVer(`${alan.etiket}: geçersiz JSON biçimi`, "hata")
          return
        }
      }
    }
    setAyarKaydediliyor(true)
    try {
      await api("/api/ayarlar", { method: "PUT", body: JSON.stringify(ayarlar) })
      mesajVer("Site ayarları kaydedildi!")
      ayarlariYenile()
    } catch (err) {
      mesajVer(err.message, "hata")
    } finally {
      setAyarKaydediliyor(false)
    }
  }

  const duzenlemeyeBasla = (tip, kayit) => {
    setDuzenleme((d) => ({ ...d, [tip]: kayit.id }))
    if (tip === "etkinlik") {
      setForm((f) => ({
        ...f,
        etkinlik: { ...kayit, tarih: toDateTimeLocal(kayit.tarih), kontenjan: kayit.kontenjan || 50 },
      }))
    } else {
      setForm((f) => ({ ...f, [tip]: { ...kayit } }))
    }
  }

  const iptalEt = (tip) => {
    setDuzenleme((d) => ({ ...d, [tip]: null }))
    setForm((f) => ({
      ...f,
      [tip]: tip === "duyuru" ? { baslik: "", icerik: "", kategori: "Genel" }
        : tip === "etkinlik" ? { baslik: "", aciklama: "", tarih: "", yer: "", kontenjan: 50 }
        : { baslik: "", resim_url: "", aciklama: "" },
    }))
  }

  const kaydet = async (tip, veri, e) => {
    e.preventDefault()
    const id = duzenleme[tip]
    try {
      await api(id ? `/api/${tip === "duyuru" ? "duyurular" : tip === "etkinlik" ? "etkinlikler" : "galeri"}/${id}` : `/api/${tip === "duyuru" ? "duyurular" : tip === "etkinlik" ? "etkinlikler" : "galeri"}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(veri),
      })
      mesajVer(id ? "Güncellendi!" : "Eklendi!")
      iptalEt(tip)
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const sil = async (tip, id) => {
    if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return
    const yol = tip === "duyuru" ? "duyurular" : tip === "etkinlik" ? "etkinlikler" : tip === "galeri" ? "galeri" : tip === "iletisim" ? "iletisim" : "kullanicilar"
    try {
      await api(`/api/${yol}/${id}`, { method: "DELETE" })
      mesajVer("Silindi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const rolDegistir = async (u, rol) => {
    try {
      await api(`/api/kullanicilar/${u.id}`, { method: "PUT", body: JSON.stringify({ rol }) })
      mesajVer("Rol güncellendi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const uyeDurumDegistir = async (u, durum) => {
    try {
      await api(`/api/kullanicilar/${u.id}`, { method: "PUT", body: JSON.stringify({ durum }) })
      mesajVer(durum === "onayli" ? "Üye onaylandı!" : durum === "reddedildi" ? "Üyelik reddedildi" : "Durum güncellendi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const durumDegistir = async (m, durum) => {
    try {
      await api(`/api/iletisim/${m.id}`, { method: "PUT", body: JSON.stringify({ durum }) })
      mesajVer("Durum güncellendi!")
      verileriYukle()
    } catch (err) {
      mesajVer(err.message, "hata")
    }
  }

  const sekmeler = [
    { id: "duyurular", label: "Duyurular", ikon: Megaphone },
    { id: "etkinlikler", label: "Etkinlikler", ikon: CalendarDays },
    { id: "kullanicilar", label: "Üyeler", ikon: Users },
    { id: "iletisim", label: "Mesajlar", ikon: Mail },
    { id: "aidat", label: "Aidat & Bağış", ikon: CreditCard },
    { id: "rehber", label: "Köy Rehberi", ikon: Store },
    { id: "ilanlar", label: "İlanlar", ikon: ScrollText },
    { id: "toplantilar", label: "Toplantılar", ikon: ClipboardList },
    { id: "galeri", label: "Galeri", ikon: ImagePlus },
    { id: "videolar", label: "Videolar", ikon: Video },
    { id: "reklamlar", label: "Reklamlar", ikon: Presentation },
    { id: "guvenlik", label: "Güvenlik", ikon: KeyRound },
    { id: "ayarlar", label: "Site Ayarları", ikon: Settings },
  ]

  const listGirdi = (tip, alan) => form[tip][alan]

  if (!oturum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-koy-900 via-koy-800 to-koy-950 flex items-center justify-center p-4">
        <form onSubmit={girisYap} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-koy-600 flex items-center justify-center">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900">Yönetim Paneli</h1>
              <p className="text-sm text-stone-500">Yönetici hesabınızla giriş yapın</p>
            </div>
          </div>
          {girisHata && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {girisHata}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">E-posta</label>
              <input
                type="email"
                required
                value={girisEmail}
                onChange={(e) => setGirisEmail(e.target.value)}
                className={girdi}
                placeholder="yonetici@koyumegonul.org"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Şifre</label>
              <input
                type="password"
                required
                value={girisSifre}
                onChange={(e) => setGirisSifre(e.target.value)}
                className={girdi}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={girisYukleniyor} className="btn-primary w-full">
              <LogIn size={18} className="mr-2" />
              {girisYukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-stone-100 min-h-screen">
      <section className="relative overflow-hidden bg-koy-900 text-white py-12">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-koy-500/25 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 flex items-center gap-4">
          <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center">
            <LayoutDashboard size={24} className="text-koy-200" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Yönetim Paneli</h1>
            <p className="text-koy-200/70 text-sm">Dernek içerikleri ve üye yönetimi · {oturum.ad} {oturum.soyad}</p>
          </div>
          <button onClick={cikisYap} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors">
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {bildirim && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm flex items-center justify-between ${bildirim.tip === "hata" ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
            {bildirim.metin}
            <button onClick={() => setBildirim(null)} className="opacity-60 hover:opacity-100">X</button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {sekmeler.map((s) => (
            <button
              key={s.id}
              onClick={() => setSekme(s.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sekme === s.id ? "bg-koy-600 text-white" : "bg-white text-koy-700 hover:bg-koy-50 border border-koy-200"
              }`}
            >
              <s.ikon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        {sekme === "duyurular" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-koy-600" /> {duzenleme.duyuru ? "Duyuru Düzenle" : "Yeni Duyuru Ekle"}
              </h2>
              <form onSubmit={(e) => kaydet("duyuru", form.duyuru, e)}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input type="text" required value={listGirdi("duyuru", "baslik")} onChange={(e) => setForm((f) => ({ ...f, duyuru: { ...f.duyuru, baslik: e.target.value } }))} className={girdi} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <select value={listGirdi("duyuru", "kategori")} onChange={(e) => setForm((f) => ({ ...f, duyuru: { ...f.duyuru, kategori: e.target.value } }))} className={girdi}>
                    {["Genel", "Gençlik", "Eğitim", "Kültür", "Yardımlaşma", "Hayır"].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">İçerik</label>
                  <textarea required rows="4" value={listGirdi("duyuru", "icerik")} onChange={(e) => setForm((f) => ({ ...f, duyuru: { ...f.duyuru, icerik: e.target.value } }))} className={girdi} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">{duzenleme.duyuru ? "Güncelle" : "Duyuruyu Yayınla"}</button>
                  {duzenleme.duyuru && (
                    <button type="button" onClick={() => iptalEt("duyuru")} className="btn-outline">İptal</button>
                  )}
                </div>
              </form>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Mevcut Duyurular ({duyurular.length})</h2>
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {duyurular.map((d) => (
                  <div key={d.id} className={`border rounded-lg p-3 ${duzenleme.duyuru === d.id ? "border-koy-500 bg-koy-50" : "border-stone-100"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 bg-koy-100 text-koy-700 rounded-full">{d.kategori}</span>
                      <span className="flex gap-1">
                        <button onClick={() => duzenlemeyeBasla("duyuru", d)} className="p-1.5 text-koy-600 hover:text-koy-800 hover:bg-koy-50 rounded-md" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => sil("duyuru", d.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </span>
                    </div>
                    <h3 className="font-medium mt-2">{d.baslik}</h3>
                    <p className="text-sm text-stone-600 mt-1 line-clamp-2">{d.icerik}</p>
                    <p className="text-xs text-stone-400 mt-2">{new Date(d.olusturulma_tarihi).toLocaleDateString("tr-TR")}</p>
                  </div>
                ))}
                {duyurular.length === 0 && <p className="text-center text-stone-500 py-8">Henüz duyuru yok.</p>}
              </div>
            </div>
          </div>
        )}

        {sekme === "etkinlikler" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-koy-600" /> {duzenleme.etkinlik ? "Etkinlik Düzenle" : "Yeni Etkinlik Ekle"}
              </h2>
              <form onSubmit={(e) => kaydet("etkinlik", { ...form.etkinlik, tarih: new Date(form.etkinlik.tarih).toISOString() }, e)}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input type="text" required value={listGirdi("etkinlik", "baslik")} onChange={(e) => setForm((f) => ({ ...f, etkinlik: { ...f.etkinlik, baslik: e.target.value } }))} className={girdi} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama</label>
                  <textarea required rows="3" value={listGirdi("etkinlik", "aciklama")} onChange={(e) => setForm((f) => ({ ...f, etkinlik: { ...f.etkinlik, aciklama: e.target.value } }))} className={girdi} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tarih</label>
                    <input type="datetime-local" required value={listGirdi("etkinlik", "tarih")} onChange={(e) => setForm((f) => ({ ...f, etkinlik: { ...f.etkinlik, tarih: e.target.value } }))} className={girdi} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Yer</label>
                    <input type="text" required value={listGirdi("etkinlik", "yer")} onChange={(e) => setForm((f) => ({ ...f, etkinlik: { ...f.etkinlik, yer: e.target.value } }))} className={girdi} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kontenjan</label>
                  <input type="number" min="1" value={listGirdi("etkinlik", "kontenjan")} onChange={(e) => setForm((f) => ({ ...f, etkinlik: { ...f.etkinlik, kontenjan: Number(e.target.value) } }))} className={girdi} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">{duzenleme.etkinlik ? "Güncelle" : "Etkinliği Ekle"}</button>
                  {duzenleme.etkinlik && (
                    <button type="button" onClick={() => iptalEt("etkinlik")} className="btn-outline">İptal</button>
                  )}
                </div>
              </form>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Mevcut Etkinlikler ({etkinlikler.length})</h2>
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {etkinlikler.map((e) => (
                  <div key={e.id} className={`border rounded-lg p-3 ${duzenleme.etkinlik === e.id ? "border-koy-500 bg-koy-50" : "border-stone-100"}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{e.baslik}</h3>
                      <span className="flex gap-1">
                        <button onClick={() => duzenlemeyeBasla("etkinlik", e)} className="p-1.5 text-koy-600 hover:text-koy-800 hover:bg-koy-50 rounded-md" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => sil("etkinlik", e.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1 line-clamp-2">{e.aciklama}</p>
                    <div className="text-xs text-stone-500 mt-2 flex flex-wrap gap-3">
                      <span>{e.yer}</span>
                      <span>{new Date(e.tarih).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>{e.kayitli}/{e.kontenjan} kayıtlı</span>
                    </div>
                  </div>
                ))}
                {etkinlikler.length === 0 && <p className="text-center text-stone-500 py-8">Henüz etkinlik yok.</p>}
              </div>
            </div>
          </div>
        )}

        {sekme === "kullanicilar" && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Users size={18} className="text-koy-600" /> Kayıtlı Üyeler ({kullanicilar.length})
              </h2>
              {kullanicilar.filter((u) => u.durum === "beklemede").length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  <Clock size={14} /> {kullanicilar.filter((u) => u.durum === "beklemede").length} onay bekliyor
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-left text-stone-500">
                    <th className="px-6 py-3 font-medium">Ad</th>
                    <th className="px-6 py-3 font-medium">E-posta</th>
                    <th className="px-6 py-3 font-medium">Telefon</th>
                    <th className="px-6 py-3 font-medium">Köy</th>
                    <th className="px-6 py-3 font-medium">Rol</th>
                    <th className="px-6 py-3 font-medium">Durum</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {kullanicilar.map((u) => (
                    <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50">
                      <td className="px-6 py-3 font-medium">{u.ad} {u.soyad}</td>
                      <td className="px-6 py-3 text-stone-600">{u.email}</td>
                      <td className="px-6 py-3 text-stone-600">{u.telefon || "-"}</td>
                      <td className="px-6 py-3 text-stone-600">{u.koy || "-"}</td>
                      <td className="px-6 py-3">
                        <select
                          value={u.rol}
                          onChange={(e) => rolDegistir(u, e.target.value)}
                          disabled={u.id === 1}
                          className="px-2 py-1 rounded-md border border-stone-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-koy-500 disabled:opacity-50"
                        >
                          <option value="uye">üye</option>
                          <option value="yonetici">yönetici</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        {u.durum === "onayli" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            <Check size={12} /> Onaylı
                          </span>
                        )}
                        {u.durum === "beklemede" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                            <Clock size={12} /> Beklemede
                          </span>
                        )}
                        {u.durum === "reddedildi" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            <X size={12} /> Reddedildi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {u.durum !== "onayli" && (
                            <button
                              onClick={() => uyeDurumDegistir(u, "onayli")}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                              title="Onayla"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {u.durum !== "reddedildi" && u.id !== 1 && (
                            <button
                              onClick={() => uyeDurumDegistir(u, "reddedildi")}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md"
                              title="Reddet"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => sil("kullanici", u.id)}
                            disabled={u.id === 1}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                            title={u.id === 1 ? "Ana yönetici silinemez" : "Sil"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sekme === "iletisim" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {iletisimler.map((m) => (
              <div key={m.id} className={`card p-6 ${m.durum === "okundu" ? "opacity-70" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{m.ad}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.durum === "okundu" ? "bg-stone-100 text-stone-500" : "bg-amber-100 text-amber-700"}`}>
                    {m.durum}
                  </span>
                </div>
                <p className="text-sm text-koy-700 font-medium mb-1">{m.konu}</p>
                <p className="text-xs text-stone-500 mb-3">{m.email}</p>
                <p className="text-sm text-stone-600 leading-relaxed">{m.mesaj}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => durumDegistir(m, m.durum === "okundu" ? "yeni" : "okundu")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-medium transition-colors"
                  >
                    {m.durum === "okundu" ? <><Undo2 size={14} /> Yeni işaretle</> : <><CheckCheck size={14} /> Okundu işaretle</>}
                  </button>
                  <button onClick={() => sil("iletisim", m.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" title="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {iletisimler.length === 0 && (
              <div className="col-span-full text-center py-16 text-stone-500">Henüz mesaj yok.</div>
            )}
          </div>
        )}

        {sekme === "galeri" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-koy-600" /> {duzenleme.galeri ? "Görsel Düzenle" : "Görsel Ekle"}
              </h2>
              <form onSubmit={(e) => kaydet("galeri", form.galeri, e)}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input type="text" required value={listGirdi("galeri", "baslik")} onChange={(e) => setForm((f) => ({ ...f, galeri: { ...f.galeri, baslik: e.target.value } }))} className={girdi} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Görsel URL</label>
                  <input type="url" required value={listGirdi("galeri", "resim_url")} onChange={(e) => setForm((f) => ({ ...f, galeri: { ...f.galeri, resim_url: e.target.value } }))} className={girdi} placeholder="https://..." />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama (opsiyonel)</label>
                  <textarea rows="2" value={listGirdi("galeri", "aciklama")} onChange={(e) => setForm((f) => ({ ...f, galeri: { ...f.galeri, aciklama: e.target.value } }))} className={girdi} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">{duzenleme.galeri ? "Güncelle" : "Galeriye Ekle"}</button>
                  {duzenleme.galeri && (
                    <button type="button" onClick={() => iptalEt("galeri")} className="btn-outline">İptal</button>
                  )}
                </div>
              </form>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Galeri Görselleri ({galeri.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galeri.map((g) => (
                  <div
                    key={g.id}
                    className={`group relative rounded-lg overflow-hidden border ${duzenleme.galeri === g.id ? "border-koy-500 ring-2 ring-koy-500" : "border-stone-100"}`}
                  >
                    <img src={g.resim_url} alt={g.baslik} className="aspect-square object-cover w-full" onError={(e) => (e.target.style.opacity = "0.1")} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                      <button onClick={() => duzenlemeyeBasla("galeri", g)} className="p-2 bg-white text-koy-700 rounded-full hover:bg-koy-50" title="Düzenle">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => sil("galeri", g.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-2 py-1.5 truncate">{g.baslik}</p>
                  </div>
                ))}
                {galeri.length === 0 && <p className="col-span-full text-center text-stone-500 py-8">Henüz görsel yok.</p>}
              </div>
            </div>
          </div>
        )}

        {sekme === "videolar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-koy-600" /> {videoDuzenleme ? "Video Düzenle" : "Yeni Video Ekle"}
              </h2>
              <form onSubmit={videoKaydet}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input type="text" required value={videoForm.baslik} onChange={(e) => setVideoForm((f) => ({ ...f, baslik: e.target.value }))} className={girdi} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Video URL</label>
                  <input type="text" required value={videoForm.video_url} onChange={(e) => setVideoForm((f) => ({ ...f, video_url: e.target.value }))} className={girdi} placeholder="https://www.youtube.com/watch?v=... veya .mp4" />
                  <p className="text-xs text-stone-400 mt-1">YouTube, Vimeo veya doğrudan video (.mp4) bağlantısı.</p>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kapak Görseli (opsiyonel)</label>
                  <input type="text" value={videoForm.kapak_url} onChange={(e) => setVideoForm((f) => ({ ...f, kapak_url: e.target.value }))} className={girdi} placeholder="Boş bırakılırsa YouTube kapağı kullanılır" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <select value={videoForm.kategori} onChange={(e) => setVideoForm((f) => ({ ...f, kategori: e.target.value }))} className={girdi}>
                    {["Genel", "Etkinlik", "Tanıtım", "Günlük Yaşam", "Kültür"].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama</label>
                  <textarea rows="3" value={videoForm.aciklama} onChange={(e) => setVideoForm((f) => ({ ...f, aciklama: e.target.value }))} className={girdi} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">{videoDuzenleme ? "Güncelle" : "Videoyu Ekle"}</button>
                  {videoDuzenleme && (
                    <button type="button" onClick={videoIptal} className="btn-outline">İptal</button>
                  )}
                </div>
              </form>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Mevcut Videolar ({videolar.length})</h2>
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {videolar.map((v) => (
                  <div key={v.id} className={`border rounded-lg p-3 ${videoDuzenleme === v.id ? "border-koy-500 bg-koy-50" : "border-stone-100"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 bg-koy-100 text-koy-700 rounded-full">{v.kategori}</span>
                      <span className="flex gap-1">
                        <button onClick={() => videoDuzenleBasla(v)} className="p-1.5 text-koy-600 hover:text-koy-800 hover:bg-koy-50 rounded-md" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => videoSil(v.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </span>
                    </div>
                    <h3 className="font-medium mt-2">{v.baslik}</h3>
                    {v.aciklama && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{v.aciklama}</p>}
                    <p className="text-xs text-stone-400 mt-1 truncate">{v.video_url}</p>
                  </div>
                ))}
                {videolar.length === 0 && <p className="text-center text-stone-500 py-8">Henüz video yok.</p>}
              </div>
            </div>
          </div>
        )}

        {sekme === "aidat" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-display font-bold">Aidat Yönetimi</h1>
              <button
                onClick={() => setHatirlatmaAcik((o) => !o)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-koy-600 text-white text-sm font-semibold hover:bg-koy-700"
              >
                <Megaphone size={16} /> Aidat Bildirimi Gönder
              </button>
            </div>

            {hatirlatmaAcik && (
              <div className="card p-6">
                <h2 className="text-lg font-display font-semibold mb-1">Aidat Bildirimi Gönder</h2>
                <p className="text-sm text-stone-500 mb-4">Seçtiğiniz dönem aidatını ödememiş üyelere hatırlatma gönderin.</p>
                <form onSubmit={hatirlatGonder} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Yıl</label>
                    <input type="number" required min="2000" max="2100" value={hatirlatmaForm.yil} onChange={(e) => setHatirlatmaForm((f) => ({ ...f, yil: e.target.value }))} className={girdi} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Dönem</label>
                    <select value={hatirlatmaForm.ay} onChange={(e) => setHatirlatmaForm((f) => ({ ...f, ay: e.target.value }))} className={girdi}>
                      <option value="0">Tüm Yıl</option>
                      {AY_ADLARI.map((ad, i) => (
                        <option key={i + 1} value={i + 1}>{ad}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={hatirlatmaYukleniyor}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-koy-600 text-white text-sm font-semibold hover:bg-koy-700 disabled:opacity-60"
                  >
                    <Megaphone size={16} /> {hatirlatmaYukleniyor ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6 h-fit">
                <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
                  <CreditCard size={18} className="text-koy-600" /> Yeni Aidat Ekle
                </h2>
                <p className="text-sm text-stone-500 mb-4">Bir üyeye aylık veya yıllık ("Tüm Yıl") aidat kaydı oluşturun.</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setAidatEklemeYukleniyor(true)
                    try {
                      await api("/api/aidatlar", {
                        method: "POST",
                        body: JSON.stringify({
                          kullanici_id: Number(aidatForm.kullanici_id),
                          yil: Number(aidatForm.yil) || new Date().getFullYear(),
                          ay: Number(aidatForm.ay ?? 0),
                          tutar: Number(aidatForm.tutar) || Number(Number(aidatForm.ay) === 0 ? (ayarlar.aidat_yillik_tutar || 0) : (ayarlar.aidat_aylik_tutar || 0)),
                          aciklama: aidatForm.aciklama,
                        }),
                      })
                      mesajVer("Aidat kaydı oluşturuldu!")
                      setAidatForm({ kullanici_id: "", yil: String(new Date().getFullYear()), ay: String(new Date().getMonth() + 1), tutar: "", aciklama: "" })
                      verileriYukle()
                    } catch (err) {
                      mesajVer(err.message, "hata")
                    } finally {
                      setAidatEklemeYukleniyor(false)
                    }
                  }}
                >
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Üye</label>
                    <select
                      required
                      value={aidatForm.kullanici_id}
                      onChange={(e) => setAidatForm((f) => ({ ...f, kullanici_id: e.target.value }))}
                      className={girdi}
                    >
                      <option value="">Üye seçin...</option>
                      {kullanicilar.filter((u) => u.durum === "onayli").map((u) => (
                        <option key={u.id} value={u.id}>{u.ad} {u.soyad} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Yıl</label>
                      <input type="number" required value={aidatForm.yil} onChange={(e) => setAidatForm((f) => ({ ...f, yil: e.target.value }))} className={girdi} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Dönem (Ay)</label>
                      <select value={aidatForm.ay} onChange={(e) => setAidatForm((f) => ({ ...f, ay: e.target.value }))} className={girdi}>
                        <option value="0">Tüm Yıl (Yıllık Aidat)</option>
                        {AY_ADLARI.map((ad, i) => (
                          <option key={i + 1} value={i + 1}>{ad}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tutar (₺)</label>
                    <input type="number" value={aidatForm.tutar} placeholder={Number(aidatForm.ay) === 0 ? (ayarlar.aidat_yillik_tutar || "6000") : (ayarlar.aidat_aylik_tutar || "500")} onChange={(e) => setAidatForm((f) => ({ ...f, tutar: e.target.value }))} className={girdi} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama (opsiyonel)</label>
                    <input type="text" value={aidatForm.aciklama} onChange={(e) => setAidatForm((f) => ({ ...f, aciklama: e.target.value }))} className={girdi} />
                  </div>
                  <button type="submit" disabled={aidatEklemeYukleniyor} className="btn-primary w-full">
                    <CreditCard size={18} className="mr-2" /> {aidatEklemeYukleniyor ? "Ekleniyor..." : "Aidat Ekle"}
                  </button>
                </form>
              </div>

              <div className="card p-6 h-fit">
                <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
                  <CheckCheck size={18} className="text-koy-600" /> Aidat Durumları
                </h2>
                <p className="text-sm text-stone-500 mb-4">"Ödeme bildirildi" kayıtlarını onaylayın.</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {aidatlar.filter((a) => a.durum !== "odendi").length === 0 && (
                    <p className="text-center text-stone-500 py-6 bg-stone-50 rounded-xl">Onay bekleyen aidat yok.</p>
                  )}
                  {aidatlar.filter((a) => a.durum !== "odendi").map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 bg-stone-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">{a.ad} {a.soyad}</p>
                        <p className="text-xs text-stone-500">{donemMetni(a)} · {a.tutar} ₺ · {DURUM_ETIKET[a.durum]?.metin ?? a.durum}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async () => {
                            try {
                              const yeni = a.durum === "odeyenekadar" ? "odendi" : "odeyenekadar"
                              await api(`/api/aidatlar/${a.id}`, { method: "PUT", body: JSON.stringify({ durum: yeni }) })
                              mesajVer(yeni === "odendi" ? "Ödeme onaylandı!" : "Ödeme bildirimi beklemede olarak işaretlendi")
                              verileriYukle()
                            } catch (err) { mesajVer(err.message, "hata") }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                        >
                          {a.durum === "odeyenekadar" ? "Onayla" : "Bildirildi"}
                        </button>
                        {a.durum === "odeyenekadar" && (
                          <button
                            onClick={async () => {
                              try {
                                await api(`/api/aidatlar/${a.id}`, { method: "PUT", body: JSON.stringify({ durum: "reddedildi" }) })
                                mesajVer("Ödeme reddedildi")
                                verileriYukle()
                              } catch (err) { mesajVer(err.message, "hata") }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                          >
                            Reddet
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-display font-semibold">Tüm Aidat Kayıtları ({aidatlar.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 text-left text-stone-500">
                      <th className="px-6 py-3 font-medium">Üye</th>
                      <th className="px-6 py-3 font-medium">Dönem</th>
                      <th className="px-6 py-3 font-medium">Tutar</th>
                      <th className="px-6 py-3 font-medium">Durum</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {aidatlar.map((a) => (
                      <tr key={a.id} className="border-t border-stone-100 hover:bg-stone-50">
                        <td className="px-6 py-3 font-medium">{a.ad} {a.soyad}</td>
                        <td className="px-6 py-3">{donemMetni(a)}</td>
                        <td className="px-6 py-3">{a.tutar} ₺</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            a.durum === "odendi" ? "bg-green-100 text-green-700" :
                            a.durum === "odeyenekadar" ? "bg-amber-100 text-amber-800" :
                            a.durum === "reddedildi" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"
                          }`}>
                            {a.durum === "odendi" ? "Ödendi" : a.durum === "odeyenekadar" ? "Bildirildi" : a.durum === "reddedildi" ? "Reddedildi" : "Bekliyor"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={async () => {
                              if (!window.confirm("Bu aidat kaydı silinsin mi?")) return
                              try { await api(`/api/aidatlar/${a.id}`, { method: "DELETE" }); mesajVer("Aidat silindi"); verileriYukle() }
                              catch (err) { mesajVer(err.message, "hata") }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                    {aidatlar.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-500">Henüz aidat kaydı yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-display font-semibold">Bağış Bildirimleri ({bagislar.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 text-left text-stone-500">
                      <th className="px-6 py-3 font-medium">Bağışçı</th>
                      <th className="px-6 py-3 font-medium">Tutar</th>
                      <th className="px-6 py-3 font-medium">Açıklama</th>
                      <th className="px-6 py-3 font-medium">Durum</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bagislar.map((b) => (
                      <tr key={b.id} className="border-t border-stone-100 hover:bg-stone-50">
                        <td className="px-6 py-3 font-medium">{b.ad} {b.kullanici_id ? "" : "(misafir)"}</td>
                        <td className="px-6 py-3">{b.tutar} ₺</td>
                        <td className="px-6 py-3 text-stone-600">{b.aciklama || "-"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            b.durum === "onaylandi" ? "bg-green-100 text-green-700" :
                            b.durum === "reddedildi" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                          }`}>
                            {b.durum === "onaylandi" ? "Onaylandı" : b.durum === "reddedildi" ? "Reddedildi" : "Bekliyor"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {b.durum !== "onaylandi" && (
                              <button
                                onClick={async () => {
                                  try { await api(`/api/bagislar/${b.id}`, { method: "PUT", body: JSON.stringify({ durum: "onaylandi" }) }); mesajVer("Bağış onaylandı!"); verileriYukle() }
                                  catch (err) { mesajVer(err.message, "hata") }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                              >
                                Onayla
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (!window.confirm("Bu bağış kaydı silinsin mi?")) return
                                try { await api(`/api/bagislar/${b.id}`, { method: "DELETE" }); mesajVer("Bağış silindi"); verileriYukle() }
                                catch (err) { mesajVer(err.message, "hata") }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bagislar.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-500">Henüz bağış bildirimi yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {sekme === "rehber" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h3 className="text-lg font-display font-bold text-slate-900 mb-1">
                {rehberDuzenleme ? "Rehber Kaydını Düzenle" : "Yeni Rehber Kaydı"}
              </h3>
              <p className="text-sm text-stone-500 mb-5">İşletme, esnaf ve hizmet kayıtları</p>
              <form onSubmit={rehberKaydet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Ad</label>
                  <input required value={rehberForm.ad} onChange={(e) => setRehberForm({ ...rehberForm, ad: e.target.value })} className={girdi} placeholder="Köy Kahvesi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <input value={rehberForm.kategori} onChange={(e) => setRehberForm({ ...rehberForm, kategori: e.target.value })} className={girdi} placeholder="Kafe / Fırın / Bakkal / Esnaf" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Telefon</label>
                  <input value={rehberForm.telefon} onChange={(e) => setRehberForm({ ...rehberForm, telefon: e.target.value })} className={girdi} placeholder="0532 111 22 33" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Adres</label>
                  <input value={rehberForm.adres} onChange={(e) => setRehberForm({ ...rehberForm, adres: e.target.value })} className={girdi} placeholder="Meydan Sokak No:5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama</label>
                  <textarea value={rehberForm.aciklama} onChange={(e) => setRehberForm({ ...rehberForm, aciklama: e.target.value })} className={girdi} rows="3" placeholder="Kısa tanıtım..." />
                </div>
                {rehberDuzenleme ? (
                  <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary flex-1" disabled={rehberKaydediliyor}>
                      <Save size={18} /> Güncelle
                    </button>
                    <button type="button" onClick={rehberIptal} className="btn btn-secondary"><X size={18} /> Vazgeç</button>
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary w-full" disabled={rehberKaydediliyor}>
                    <Plus size={18} /> Rehber Kaydı Ekle
                  </button>
                )}
              </form>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-display font-bold text-slate-900 mb-4">Rehber Kayıtları</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-500 border-b">
                      <th className="py-2 pr-2">Ad</th>
                      <th className="py-2 pr-2">Kategori</th>
                      <th className="py-2 pr-2">İletişim</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rehber.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-3 pr-2 font-medium text-slate-800">{r.ad}</td>
                        <td className="py-3 pr-2"><span className="px-2 py-0.5 rounded-full bg-koy-100 text-koy-700 text-xs font-semibold">{r.kategori || "Genel"}</span></td>
                        <td className="py-3 pr-2 text-stone-500">{r.telefon || "—"}</td>
                        <td className="py-3">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => rehberDuzenleBasla(r)} className="btn-action"><Pencil size={15} /></button>
                            <button onClick={() => rehberSil(r.id)} className="btn-action text-red-500"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rehber.length === 0 && (
                      <tr><td colSpan="4" className="py-8 text-center text-stone-500">Henüz rehber kaydı yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {sekme === "ilanlar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h3 className="text-lg font-display font-bold text-slate-900 mb-1">
                {ilanDuzenleme ? "İlanı Düzenle" : "Yeni İlan"}
              </h3>
              <p className="text-sm text-stone-500 mb-5">Üye ilanlarını görüntüleyin ve yönetin</p>
              <form onSubmit={ilanKaydet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input required value={ilanForm.baslik} onChange={(e) => setIlanForm({ ...ilanForm, baslik: e.target.value })} className={girdi} placeholder="İlan başlığı" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <input value={ilanForm.kategori} onChange={(e) => setIlanForm({ ...ilanForm, kategori: e.target.value })} className={girdi} placeholder="Satılık / Alınık" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fiyat (₺)</label>
                  <input type="number" value={ilanForm.fiyat} onChange={(e) => setIlanForm({ ...ilanForm, fiyat: e.target.value })} className={girdi} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama</label>
                  <textarea required value={ilanForm.aciklama} onChange={(e) => setIlanForm({ ...ilanForm, aciklama: e.target.value })} className={girdi} rows="3" placeholder="İlan açıklaması..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Telefon</label>
                  <input value={ilanForm.telefon} onChange={(e) => setIlanForm({ ...ilanForm, telefon: e.target.value })} className={girdi} placeholder="0532 111 22 33" />
                </div>
                {ilanDuzenleme ? (
                  <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary flex-1" disabled={ilanKaydediliyor}>
                      <Save size={18} /> Güncelle
                    </button>
                    <button type="button" onClick={ilanIptal} className="btn btn-secondary"><X size={18} /> Vazgeç</button>
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary w-full" disabled={ilanKaydediliyor}>
                    <Plus size={18} /> İlan Ekle
                  </button>
                )}
              </form>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-display font-bold text-slate-900 mb-4">İlanlar ({ilanlar.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-500 border-b">
                      <th className="py-2 pr-2">Başlık</th>
                      <th className="py-2 pr-2">Sahip</th>
                      <th className="py-2 pr-2">Kategori</th>
                      <th className="py-2 pr-2">Fiyat</th>
                      <th className="py-2 pr-2">Durum</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ilanlar.map((il) => (
                      <tr key={il.id} className="border-b last:border-0">
                        <td className="py-3 pr-2 font-medium text-slate-800">{il.baslik}</td>
                        <td className="py-3 pr-2 text-stone-500">{il.kullanici_ad ? `${il.kullanici_ad} ${il.kullanici_soyad || ""}` : "—"}</td>
                        <td className="py-3 pr-2"><span className="px-2 py-0.5 rounded-full bg-koy-100 text-koy-700 text-xs font-semibold">{il.kategori}</span></td>
                        <td className="py-3 pr-2 text-stone-500">{il.fiyat ? `${il.fiyat.toLocaleString("tr-TR")} ₺` : "—"}</td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${il.durum === "aktif" ? "bg-green-100 text-green-700" : il.durum === "kapatildi" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {il.durum === "aktif" ? "Aktif" : il.durum === "kapatildi" ? "Kapatıldı" : "Beklemede"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2 justify-end">
                            {il.durum === "aktif" ? (
                              <button onClick={() => ilanDurum(il, "kapatildi")} className="btn-action" title="Kapat"><X size={15} /></button>
                            ) : (
                              <button onClick={() => ilanDurum(il, "aktif")} className="btn-action text-green-600" title="Yayınla"><Check size={15} /></button>
                            )}
                            <button onClick={() => ilanDuzenleBasla(il)} className="btn-action"><Pencil size={15} /></button>
                            <button onClick={() => ilanSil(il.id)} className="btn-action text-red-500"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ilanlar.length === 0 && (
                      <tr><td colSpan="6" className="py-8 text-center text-stone-500">Henüz ilan yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {sekme === "toplantilar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h3 className="text-lg font-display font-bold text-slate-900 mb-1">
                {toplantiDuzenleme ? "Toplantıyı Düzenle" : "Yeni Toplantı"}
              </h3>
              <p className="text-sm text-stone-500 mb-5">Gündem, oylama ve tutanak yönetimi</p>
              <form onSubmit={toplantiKaydet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input required value={toplantiForm.baslik} onChange={(e) => setToplantiForm({ ...toplantiForm, baslik: e.target.value })} className={girdi} placeholder="2026 Genel Kurul Toplantısı" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama</label>
                  <textarea value={toplantiForm.aciklama} onChange={(e) => setToplantiForm({ ...toplantiForm, aciklama: e.target.value })} className={girdi} rows="2" placeholder="Toplantı açıklaması..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tarih</label>
                    <input type="datetime-local" required value={toplantiForm.tarih || ""} onChange={(e) => setToplantiForm({ ...toplantiForm, tarih: e.target.value })} className={girdi} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Yer</label>
                    <input value={toplantiForm.yer} onChange={(e) => setToplantiForm({ ...toplantiForm, yer: e.target.value })} className={girdi} placeholder="Köy Konağı" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Video URL</label>
                    <input value={toplantiForm.video_url} onChange={(e) => setToplantiForm({ ...toplantiForm, video_url: e.target.value })} className={girdi} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Durum</label>
                    <select value={toplantiForm.durum} onChange={(e) => setToplantiForm({ ...toplantiForm, durum: e.target.value })} className={girdi}>
                      <option value="planlandi">Planlandı</option>
                      <option value="duzenlendi">Yapıldı</option>
                      <option value="iptal">İptal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Gündem (her satır bir madde)</label>
                  <textarea value={toplantiForm.gundem} onChange={(e) => setToplantiForm({ ...toplantiForm, gundem: e.target.value })} className={girdi} rows="4" placeholder={"Açılış\nGündem maddeleri\nKapanış"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Tutanak</label>
                  <textarea value={toplantiForm.tutanak} onChange={(e) => setToplantiForm({ ...toplantiForm, tutanak: e.target.value })} className={girdi} rows="4" placeholder="Toplantı sonrası tutanak metni..." />
                </div>
                {toplantiDuzenleme ? (
                  <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary flex-1" disabled={toplantiKaydediliyor}>
                      <Save size={18} /> Güncelle
                    </button>
                    <button type="button" onClick={toplantiIptal} className="btn btn-secondary"><X size={18} /> Vazgeç</button>
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary w-full" disabled={toplantiKaydediliyor}>
                    <Plus size={18} /> Toplantı Ekle
                  </button>
                )}
              </form>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-display font-bold text-slate-900 mb-4">Toplantılar ({toplantilar.length})</h3>
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {toplantilar.map((t) => (
                  <div key={t.id} className={`border rounded-lg p-4 ${toplantiDuzenleme === t.id ? "border-koy-500 bg-koy-50" : "border-stone-100"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-slate-800">{t.baslik}</h4>
                      <span className="flex gap-1 flex-shrink-0">
                        <button onClick={() => toplantiDuzenleBasla(t)} className="p-1.5 text-koy-600 hover:text-koy-800 hover:bg-koy-50 rounded-md" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toplantiSil(t.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-3">
                      <span>{t.tarih ? new Date(t.tarih).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Tarih yok"}</span>
                      {t.yer ? <span>{t.yer}</span> : null}
                    </div>
                    <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${t.durum === "planlandi" ? "bg-amber-100 text-amber-700" : t.durum === "duzenlendi" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {t.durum === "planlandi" ? "Planlandı" : t.durum === "duzenlendi" ? "Yapıldı" : "İptal"}
                    </span>
                    {t.gundem?.length ? (
                      <ul className="mt-2 space-y-1">
                        {t.gundem.map((g) => (
                          <li key={g.id} className="text-xs text-stone-600 flex gap-2">
                            <span className="text-koy-500 font-semibold">{g.sira}.</span> {g.baslik}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {t.tutanak ? (
                      <p className="mt-2 text-xs text-stone-600 border-t border-stone-100 pt-2 line-clamp-2">📄 {t.tutanak}</p>
                    ) : null}
                    {(t.oylamalar || []).map((o) => (
                      <div key={o.id} className="mt-2 border border-stone-100 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{o.konu}</p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {(o.secenekler || []).join(" · ")} — {o.oy_sayisi} oy
                              {o.aktif ? "" : " · Kapatıldı"}
                            </p>
                          </div>
                          <button onClick={() => oylamaSil(t.id, o.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md flex-shrink-0" title="Oylamayı sil">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => oylamaEkle(t.id, e)}
                      className="mt-3 flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        value={oylemeSecenek.konu}
                        onChange={(e) => setOylamaSecenek((f) => ({ ...f, konu: e.target.value }))}
                        className={`${girdi} flex-1`}
                        placeholder="Oylama konusu"
                      />
                      <input
                        value={oylemeSecenek.secenekler}
                        onChange={(e) => setOylamaSecenek((f) => ({ ...f, secenekler: e.target.value }))}
                        className={`${girdi} flex-1`}
                        placeholder="Seçenekler (virgülle)"
                      />
                      <button type="submit" className="btn-action"><Plus size={15} /></button>
                    </form>
                  </div>
                ))}
                {toplantilar.length === 0 && (
                  <p className="text-center text-stone-500 py-8">Henüz toplantı yok.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {sekme === "reklamlar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
                <Plus size={18} className="text-koy-600" /> {reklamDuzenleme ? "Reklam Düzenle" : "Yeni Reklam Ekle"}
              </h2>
              <p className="text-sm text-stone-500 mb-4">Üst banner için ayrıca "Site Ayarları" sekmesini kullanın.</p>
              <form onSubmit={reklamKaydet}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Başlık</label>
                  <input type="text" required value={reklamForm.baslik} onChange={(e) => setReklamForm((f) => ({ ...f, baslik: e.target.value }))} className={girdi} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Açıklama</label>
                  <textarea rows="2" value={reklamForm.aciklama} onChange={(e) => setReklamForm((f) => ({ ...f, aciklama: e.target.value }))} className={girdi} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Görsel URL (opsiyonel)</label>
                  <input type="text" value={reklamForm.resim_url} onChange={(e) => setReklamForm((f) => ({ ...f, resim_url: e.target.value }))} className={girdi} placeholder="https://..." />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Bağlantı (opsiyonel)</label>
                  <input type="text" value={reklamForm.link_url} onChange={(e) => setReklamForm((f) => ({ ...f, link_url: e.target.value }))} className={girdi} placeholder="/duyurular veya https://..." />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Konum</label>
                    <select value={reklamForm.konum} onChange={(e) => setReklamForm((f) => ({ ...f, konum: e.target.value }))} className={girdi}>
                      <option value="ana_sayfa">Ana Sayfa</option>
                      <option value="genel_ust">Tüm Sayfalar - Üst</option>
                      <option value="genel_alt">Tüm Sayfalar - Alt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Sıra</label>
                    <input type="number" value={reklamForm.sira} onChange={(e) => setReklamForm((f) => ({ ...f, sira: Number(e.target.value) }))} className={girdi} />
                  </div>
                </div>
                <label className="flex items-center gap-2 mb-4 text-sm text-stone-700">
                  <input type="checkbox" checked={reklamForm.aktif} onChange={(e) => setReklamForm((f) => ({ ...f, aktif: e.target.checked }))} className="rounded border-stone-300 text-koy-600 focus:ring-koy-500" />
                  Aktif (sitede gösterilsin)
                </label>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">{reklamDuzenleme ? "Güncelle" : "Reklamı Ekle"}</button>
                  {reklamDuzenleme && (
                    <button type="button" onClick={reklamIptal} className="btn-outline">İptal</button>
                  )}
                </div>
              </form>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Mevcut Reklamlar ({reklamlar.length})</h2>
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {reklamlar.map((r) => (
                  <div key={r.id} className={`border rounded-lg p-3 ${reklamDuzenleme === r.id ? "border-koy-500 bg-koy-50" : "border-stone-100"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full whitespace-nowrap">
                          {r.konum === "ana_sayfa" ? "Ana Sayfa" : r.konum === "genel_ust" ? "Tüm Sayfalar - Üst" : "Tüm Sayfalar - Alt"}
                        </span>
                        {!r.aktif && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Pasif</span>}
                      </div>
                      <span className="flex gap-1 flex-shrink-0">
                        <button onClick={() => reklamDuzenleBasla(r)} className="p-1.5 text-koy-600 hover:text-koy-800 hover:bg-koy-50 rounded-md" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => reklamSil(r.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </span>
                    </div>
                    <h3 className="font-medium mt-2">{r.baslik}</h3>
                    {r.aciklama && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{r.aciklama}</p>}
                  </div>
                ))}
                {reklamlar.length === 0 && <p className="text-center text-stone-500 py-8">Henüz reklam yok.</p>}
              </div>
            </div>
          </div>
        )}

        {sekme === "guvenlik" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-1">Yönetici Şifresi</h2>
              <p className="text-sm text-stone-500 mb-4">Şifrenizi değiştirdiğinizde tüm açık oturumlar kapatılır ve tekrar giriş yapmanız gerekir.</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!sifreForm.mevcut || !sifreForm.yeni) {
                    mesajVer("Mevcut ve yeni şifre alanları zorunludur", "hata")
                    return
                  }
                  if (sifreForm.yeni.length < 6) {
                    mesajVer("Yeni şifre en az 6 karakter olmalı", "hata")
                    return
                  }
                  setSifreDegistiriliyor(true)
                  try {
                    await api("/api/kullanici/sifre", {
                      method: "PUT",
                      body: JSON.stringify({ mevcut_sifre: sifreForm.mevcut, yeni_sifre: sifreForm.yeni }),
                    })
                    mesajVer("Şifreniz değiştirildi. Tekrar giriş yapılıyor...")
                    setSifreForm({ mevcut: "", yeni: "" })
                    setTimeout(cikisYap, 1200)
                  } catch (hata) {
                    if (!yetkiHatasi(hata)) mesajVer(hata.message, "hata")
                  } finally {
                    setSifreDegistiriliyor(false)
                  }
                }}
              >
                <div className="mb-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Mevcut Şifre</label>
                  <input
                    type="password"
                    required
                    value={sifreForm.mevcut}
                    onChange={(e) => setSifreForm((f) => ({ ...f, mevcut: e.target.value }))}
                    className={girdi}
                    autoComplete="current-password"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Yeni Şifre (en az 6 karakter)</label>
                  <input
                    type="password"
                    required
                    value={sifreForm.yeni}
                    onChange={(e) => setSifreForm((f) => ({ ...f, yeni: e.target.value }))}
                    className={girdi}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" disabled={sifreDegistiriliyor} className="btn-primary w-full">
                  <KeyRound size={18} className="mr-2" />
                  {sifreDegistiriliyor ? "Şifre değiştiriliyor..." : "Şifreyi Değiştir"}
                </button>
              </form>
            </div>

            <div className="card p-6 h-fit">
              <h2 className="text-lg font-display font-semibold mb-1">Oturum Güvenliği</h2>
              <p className="text-sm text-stone-500 mb-4">Giriş güvenliği ile ilgili koruma önlemleri.</p>
              <ul className="space-y-3 text-sm text-stone-700">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <CheckCheck size={18} className="text-koy-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Brute force koruması</p>
                    <p className="text-stone-500 mt-0.5">Ardışık 5 hatalı giriş denemesi sonrası hesap 15 dakika kilitlenir.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <CheckCheck size={18} className="text-koy-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Oturum sürümü</p>
                    <p className="text-stone-500 mt-0.5">Şifre değiştirildiğinde eski oturumlar anında geçersizleşir.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <CheckCheck size={18} className="text-koy-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Oturum süresi</p>
                    <p className="text-stone-500 mt-0.5">Oturumlar belirli süre sonunda otomatik sona erer, tekrar giriş istenir.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {sekme === "ayarlar" && (
          <form onSubmit={ayarlariKaydet} className="space-y-6">
            <div className="bg-koy-50 border border-koy-200 text-koy-800 rounded-lg px-4 py-3 text-sm">
              Buradan sitenin metinlerini, renklerini ve yazı tiplerini değiştirebilirsiniz. Değişiklikler kaydettikten sonra anında yansır.
            </div>

            {ayarGruplari.map((grup) => (
              <div key={grup.baslik} className="card p-6">
                <h2 className="text-lg font-display font-semibold mb-4">{grup.baslik}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grup.alanlar.map((alan) => (
                    <div key={alan.anahtar} className={alan.tip === "uzun" ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-medium text-stone-700 mb-1">{alan.etiket}</label>
                      {alan.tip === "uzun" ? (
                        <textarea
                          rows="3"
                          value={ayarlar[alan.anahtar] || ""}
                          onChange={(e) => ayarDegistir(alan.anahtar, e.target.value)}
                          className={girdi}
                        />
                      ) : alan.tip === "secenek" ? (
                        <select
                          value={ayarlar[alan.anahtar] || ""}
                          onChange={(e) => ayarDegistir(alan.anahtar, e.target.value)}
                          className={girdi}
                        >
                          {alan.secenekler.map((s) => (
                            <option key={s.deger} value={s.deger}>{s.etiket}</option>
                          ))}
                        </select>
                      ) : alan.tip === "renk" ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={/[0-9a-fA-F]{6}/.test(ayarlar[alan.anahtar] || "") ? ayarlar[alan.anahtar] : alan.varsayilan || "#2f6149"}
                            onChange={(e) => ayarDegistir(alan.anahtar, e.target.value)}
                            className="h-10 w-14 rounded-lg border border-slate-200 bg-white cursor-pointer"
                          />
                          <input
                            type="text"
                            value={ayarlar[alan.anahtar] || ""}
                            onChange={(e) => ayarDegistir(alan.anahtar, e.target.value)}
                            className={girdi}
                            placeholder={alan.varsayilan || "#2f6149"}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={ayarlar[alan.anahtar] || ""}
                          onChange={(e) => ayarDegistir(alan.anahtar, e.target.value)}
                          className={girdi}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold mb-1">Liste İçerikleri</h2>
              <p className="text-sm text-stone-500 mb-4">Bu alanlar JSON biçimindedir. Kaydetmeden önce doğruluklarını kontrol edin.</p>
              <div className="space-y-4">
                {listeAlanlari.map((alan) => (
                  <div key={alan.anahtar}>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      {alan.etiket} <span className="text-xs text-stone-400 font-normal">({alan.aciklama})</span>
                    </label>
                    <textarea
                      rows="6"
                      value={ayarlar[alan.anahtar] || ""}
                      onChange={(e) => ayarDegistir(alan.anahtar, e.target.value)}
                      className={`${girdi} font-mono text-xs`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-4">
              <button type="submit" disabled={ayarKaydediliyor} className="btn-primary w-full shadow-lg">
                <Save size={18} className="mr-2" />
                {ayarKaydediliyor ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}