import { useState } from "react"
import { HeartHandshake, UserPlus, LogIn, CheckCircle2 } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

export default function Uyelik() {
  const [mod, setMod] = useState("kayit")
  const [kayitForm, setKayitForm] = useState({ ad: "", soyad: "", email: "", telefon: "", koy: "", sifre: "" })
  const [girisForm, setGirisForm] = useState({ email: "", sifre: "" })
  const [hata, setHata] = useState("")
  const [basari, setBasari] = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)
  const { ayarlar } = useAyarlar()

  const kayitDegistir = (e) => setKayitForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const girisDegistir = (e) => setGirisForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const kayitOl = async (e) => {
    e.preventDefault()
    setHata("")
    setYukleniyor(true)
    try {
      const r = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kayitForm),
      })
      const veri = await r.json()
      if (r.ok) {
        setBasari(veri.mesaj || "Üyelik başvurunuz alındı. Yönetici onayı sonrası giriş yapabilirsiniz.")
        setKayitForm({ ad: "", soyad: "", email: "", telefon: "", koy: "", sifre: "" })
        setMod("giris")
      } else {
        setHata(veri.detail || "Kayıt oluşturulamadı")
      }
    } catch {
      setHata("Sunucuya ulaşılamadı. Lütfen sonra tekrar deneyin.")
    } finally {
      setYukleniyor(false)
    }
  }

  const girisYap = async (e) => {
    e.preventDefault()
    setHata("")
    setYukleniyor(true)
    try {
      const r = await fetch("/api/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(girisForm),
      })
      const veri = await r.json()
      if (r.ok) {
        localStorage.setItem("token", veri.access_token)
        setBasari("Giriş başarılı! Hoş geldiniz.")
        setGirisForm({ email: "", sifre: "" })
      } else {
        setHata(veri.detail || "Giriş yapılamadı")
      }
    } catch {
      setHata("Sunucuya ulaşılamadı. Lütfen sonra tekrar deneyin.")
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div>
      <PageHeader
        icon={HeartHandshake}
        title={ayarlar.uyelik_baslik || "Üyelik"}
        subtitle={ayarlar.uyelik_alt_baslik || "Köyümüzün ailesine katılın"}
      />

      <section className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => { setMod("kayit"); setHata(""); setBasari("") }}
              className={`flex-1 py-4 font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
                mod === "kayit" ? "bg-koy-600 text-white" : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              <UserPlus size={18} /> Üye Ol
            </button>
            <button
              onClick={() => { setMod("giris"); setHata(""); setBasari("") }}
              className={`flex-1 py-4 font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
                mod === "giris" ? "bg-koy-600 text-white" : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              <LogIn size={18} /> Giriş Yap
            </button>
          </div>

          <div className="p-8">
            {basari && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{basari}</p>
              </div>
            )}

            {mod === "kayit" ? (
              <form onSubmit={kayitOl}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Ad</label>
                    <input type="text" name="ad" required value={kayitForm.ad} onChange={kayitDegistir} className="input-field" placeholder="Ad" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Soyad</label>
                    <input type="text" name="soyad" required value={kayitForm.soyad} onChange={kayitDegistir} className="input-field" placeholder="Soyad" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">E-posta</label>
                  <input type="email" name="email" required value={kayitForm.email} onChange={kayitDegistir} className="input-field" placeholder="ornek@eposta.com" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Telefon</label>
                    <input type="tel" name="telefon" value={kayitForm.telefon} onChange={kayitDegistir} className="input-field" placeholder="05xx xxx xx xx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Doğduğunuz Köy</label>
                    <input type="text" name="koy" value={kayitForm.koy} onChange={kayitDegistir} className="input-field" placeholder="Köy adı" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Şifre</label>
                  <input type="password" name="sifre" required minLength={6} value={kayitForm.sifre} onChange={kayitDegistir} className="input-field" placeholder="En az 6 karakter" />
                </div>
                {hata && <p className="text-red-600 text-sm mb-4">{hata}</p>}
                <button type="submit" disabled={yukleniyor} className="btn-primary w-full">
                  {yukleniyor ? "İşleniyor..." : "Üyelik Oluştur"}
                </button>
              </form>
            ) : (
              <form onSubmit={girisYap}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">E-posta</label>
                  <input type="email" name="email" required value={girisForm.email} onChange={girisDegistir} className="input-field" placeholder="ornek@eposta.com" />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Şifre</label>
                  <input type="password" name="sifre" required value={girisForm.sifre} onChange={girisDegistir} className="input-field" placeholder="Şifreniz" />
                </div>
                {hata && <p className="text-red-600 text-sm mb-4">{hata}</p>}
                <button type="submit" disabled={yukleniyor} className="btn-primary w-full">
                  {yukleniyor ? "İşleniyor..." : "Giriş Yap"}
                </button>
              </form>
            )}

            <p className="text-xs text-stone-400 mt-6 text-center">
              Dernek tüzüğü gereği üyelik, yönetim kurulu onayıyla kesinleşir.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}