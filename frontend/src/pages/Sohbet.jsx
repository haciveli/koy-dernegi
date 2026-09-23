import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { MessageCircle, Send, LogIn, Users, CheckCheck, Check } from "lucide-react"
import PageHeader from "../components/PageHeader"

const AVATAR_RENKLERI = [
  "bg-koy-600",
  "bg-vurgu-500",
  "bg-blue-700",
  "bg-purple-600",
  "bg-pink-600",
  "bg-cyan-700",
]

const tokeniAl = () => localStorage.getItem("token") || ""

const tarihSaat = (iso) => {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
}

export default function Sohbet() {
  const [durum, setDurum] = useState("yukleniyor") // yukleniyor | girissiz | hazir
  const [ben, setBen] = useState(null)
  const [genel, setGenel] = useState({ okunmamis: 0, son_mesaj: null, son_tarih: null, gonderen_ad: "" })
  const [uyeler, setUyeler] = useState([])
  const [aktif, setAktif] = useState(null) // {tip:'genel'} ya da {tip:'uye', id, ad, soyad}
  const [mesajlar, setMesajlar] = useState([])
  const [girdi, setGirdi] = useState("")
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const altRef = useRef(null)

  const aktifId = aktif && aktif.tip === "uye" ? aktif.id : null

  const sonDurumGetir = async () => {
    try {
      const r = await fetch("/api/chat/son_durum", { headers: { Authorization: `Bearer ${tokeniAl()}` } })
      if (r.ok) {
        const veri = await r.json()
        setGenel(veri.genel || {})
        setUyeler(veri.uyeler || [])
      }
    } catch {
      // sessiz
    }
  }

  const mesajlariGetir = async () => {
    try {
      const s = aktifId ? `?alici_id=${aktifId}` : ""
      const r = await fetch(`/api/chat/mesajlar${s}`, { headers: { Authorization: `Bearer ${tokeniAl()}` } })
      if (r.ok) {
        setMesajlar(await r.json())
        sonDurumGetir()
      }
    } catch {
      // sessiz
    }
  }

  useEffect(() => {
    const baslat = async () => {
      const token = tokeniAl()
      if (!token) {
        setDurum("girissiz")
        return
      }
      try {
        const r = await fetch("/api/ben", { headers: { Authorization: `Bearer ${token}` } })
        if (!r.ok) {
          setDurum("girissiz")
          return
        }
        const b = await r.json()
        setBen(b)
        setAktif({ tip: "genel" })
        setDurum("hazir")
        sonDurumGetir()
      } catch {
        setDurum("girissiz")
      }
    }
    baslat()
  }, [])

  useEffect(() => {
    if (durum !== "hazir") return
    const t = setInterval(sonDurumGetir, 6000)
    return () => clearInterval(t)
  }, [durum])

  useEffect(() => {
    if (durum !== "hazir") return
    mesajlariGetir()
    const t = setInterval(mesajlariGetir, 4000)
    return () => clearInterval(t)
  }, [durum, aktifId])

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mesajlar])

  const gonder = async (e) => {
    e.preventDefault()
    const icerik = girdi.trim()
    if (!icerik || gonderiliyor) return
    setGonderiliyor(true)
    try {
      const veri = { icerik }
      if (aktifId) veri.alici_id = aktifId
      const r = await fetch("/api/chat/mesajlar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokeniAl()}` },
        body: JSON.stringify(veri),
      })
      if (r.ok) {
        setGirdi("")
        await mesajlariGetir()
      }
    } catch {
      // sessiz
    } finally {
      setGonderiliyor(false)
    }
  }

  const avatar = (ad, soyad, id, ekstra = "") => {
    const renk = AVATAR_RENKLERI[(id || 0) % AVATAR_RENKLERI.length]
    return (
      <span className={`w-9 h-9 rounded-full ${renk} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 ${ekstra}`}>
        {(ad || "?")[0]?.toUpperCase()}
        {(soyad || "")[0]?.toUpperCase()}
      </span>
    )
  }

  const kenarListesi = (
    <aside className="card overflow-hidden flex flex-col h-72 lg:h-full">
      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-display font-semibold text-slate-800 flex items-center gap-2">
          <MessageCircle size={18} className="text-koy-600" /> Sohbet
        </h2>
        <span className="text-xs text-stone-400">{uyeler.length} üye</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setAktif({ tip: "genel" })}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-stone-50 ${
            aktif && aktif.tip === "genel" ? "bg-koy-50" : "hover:bg-stone-50"
          }`}
        >
          <span className="w-9 h-9 rounded-full bg-koy-600 text-white flex items-center justify-center flex-shrink-0">
            <Users size={17} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-slate-800">Genel Sohbet</span>
            <span className="block text-xs text-stone-500 truncate">
              {genel.son_mesaj ? `${genel.gonderen_ad || "Üye"}: ${genel.son_mesaj}` : "Herkesin yazabileceği ortak alan"}
            </span>
          </span>
          {genel.okunmamis > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {genel.okunmamis}
            </span>
          )}
        </button>

        <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Üyeler</p>
        {uyeler.map((u) => (
          <button
            key={u.id}
            onClick={() => setAktif({ tip: "uye", id: u.id, ad: u.ad, soyad: u.soyad })}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              aktif && aktif.tip === "uye" && aktif.id === u.id ? "bg-koy-50" : "hover:bg-stone-50"
            }`}
          >
            {avatar(u.ad, u.soyad, u.id)}
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-slate-800 truncate">{u.ad} {u.soyad}</span>
              <span className="block text-xs text-stone-500 truncate">
                {u.son_mesaj ? (u.gonderen_ad === ben?.ad ? `Siz: ${u.son_mesaj}` : `${u.gonderen_ad}: ${u.son_mesaj}`) : "Hiç mesaj yok"}
              </span>
            </span>
            {u.okunmamis > 0 && (
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {u.okunmamis}
              </span>
            )}
          </button>
        ))}
        {uyeler.length === 0 && <p className="text-center text-stone-400 text-sm py-6">Sohbet için başka üye yok.</p>}
      </div>
    </aside>
  )

  if (durum === "yukleniyor") {
    return (
      <div>
        <PageHeader icon={MessageCircle} title="Üye Sohbeti" subtitle="Üyeler arası mesajlaşma" />
        <section className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-500">Yükleniyor...</section>
      </div>
    )
  }

  if (durum === "girissiz") {
    return (
      <div>
        <PageHeader icon={MessageCircle} title="Üye Sohbeti" subtitle="Üyeler arası mesajlaşma" />
        <section className="max-w-md mx-auto px-4 py-16">
          <div className="card p-8 text-center">
            <span className="mx-auto w-14 h-14 rounded-2xl bg-koy-50 border border-koy-100 flex items-center justify-center mb-4">
              <LogIn size={26} className="text-koy-600" />
            </span>
            <h2 className="text-lg font-display font-semibold text-slate-800 mb-2">Giriş yapmanız gerekiyor</h2>
            <p className="text-sm text-stone-500 mb-6">Sohbete yalnızca üyeler katılabilir. Lütfen hesabınızla giriş yapın.</p>
            <Link to="/uyelik" className="btn-primary w-full">Üyelik / Giriş Sayfası</Link>
          </div>
        </section>
      </div>
    )
  }

  const baslikIcerigi = aktif && aktif.tip === "uye" ? `${aktif.ad} ${aktif.soyad}` : "Genel Sohbet"

  return (
    <div>
      <PageHeader icon={MessageCircle} title="Üye Sohbeti" subtitle="Üyeler arası mesajlaşma" />

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {kenarListesi}

          <main className="card flex flex-col h-[70vh] lg:h-auto lg:min-h-[70vh]">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
              {aktif && aktif.tip === "uye"
                ? avatar(aktif.ad, aktif.soyad, aktif.id)
                : (
                  <span className="w-9 h-9 rounded-full bg-koy-600 text-white flex items-center justify-center">
                    <Users size={17} />
                  </span>
                )}
              <div>
                <h2 className="font-display font-semibold text-slate-800 leading-tight">{baslikIcerigi}</h2>
                <p className="text-[11px] text-stone-400">{aktif && aktif.tip === "uye" ? "Özel mesaj" : "Tüm üyeler ortak alanda yazabilir"}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-stone-50 p-4 space-y-3">
              {mesajlar.length === 0 && (
                <p className="text-center text-stone-400 text-sm py-10">Henüz mesaj yok. İlk mesajı yazın!</p>
              )}
              {mesajlar.map((m) => {
                const bendenMi = m.gonderen_id === ben?.id
                return (
                  <div key={m.id} className={`flex gap-2 ${bendenMi ? "justify-end" : "justify-start"}`}>
                    {!bendenMi && avatar(m.gonderen_ad, m.gonderen_soyad, m.gonderen_id)}
                    <div className={`max-w-[75%] ${bendenMi ? "text-right" : ""}`}>
                      {!bendenMi && aktif.tip === "genel" && (
                        <p className="text-[11px] font-semibold text-koy-700 mb-0.5 px-1">{m.gonderen_ad} {m.gonderen_soyad}</p>
                      )}
                      <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-soft ${
                        bendenMi
                          ? "bg-koy-600 text-white rounded-br-md"
                          : "bg-white border border-stone-100 text-slate-700 rounded-bl-md"
                      }`}>
                        <p className="whitespace-pre-line">{m.icerik}</p>
                        <span className={`block mt-0.5 text-[10px] ${bendenMi ? "text-koy-100/80" : "text-stone-400"}`}>
                          {tarihSaat(m.olusturulma_tarihi)} {bendenMi && (m.okundu
                            ? <CheckCheck size={12} className="inline" aria-label="Okundu" />
                            : <Check size={12} className="inline" aria-label="Gönderildi" />)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={altRef} />
            </div>

            <form onSubmit={gonder} className="p-3 border-t border-stone-100 flex items-center gap-2 bg-white">
              <input
                type="text"
                value={girdi}
                onChange={(e) => setGirdi(e.target.value)}
                placeholder={`${baslikIcerigi} için mesaj yazın...`}
                className="input-field flex-1"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={!girdi.trim() || gonderiliyor}
                className="btn-primary !px-4 !py-2.5"
                title="Gönder"
              >
                <Send size={18} />
              </button>
            </form>
          </main>
        </div>
      </section>
    </div>
  )
}