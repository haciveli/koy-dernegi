import { Link } from "react-router-dom"
import { Trees, HeartHandshake, Landmark, Sprout, ChevronRight, CalendarDays, Megaphone, ArrowRight, Store, ScrollText, ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"
import { useAyarlar } from "../AyarlarContext"
import ReklamAlani from "../components/ReklamAlani"

const ozellikIkonlari = [Landmark, HeartHandshake, Sprout]
const varsayilanOzellikler = [
  { baslik: "Kültürümüz", aciklama: "Köyümüzün zengin kültürel mirasını koruyor, yaşatıyor ve gelecek nesillere aktarıyoruz." },
  { baslik: "Dayanışmamız", aciklama: "Zor zamanlarında köylülerimizin yanında oluyor, birlik ve beraberliğimizi güçlendiriyoruz." },
  { baslik: "Geleceğimiz", aciklama: "Gençlerimize burs, eğitim ve iş imkanları sağlayarak köyümüzün geleceğini şekillendiriyoruz." },
]

export default function AnaSayfa() {
  const [duyurular, setDuyurular] = useState([])
  const [etkinlikler, setEtkinlikler] = useState([])
  const { ayarlar } = useAyarlar()

  let ozellikler = varsayilanOzellikler
  try {
    const ayarOzellikler = JSON.parse(ayarlar.ana_ozellikler || "[]")
    if (Array.isArray(ayarOzellikler) && ayarOzellikler.length) ozellikler = ayarOzellikler
  } catch {
    ozellikler = varsayilanOzellikler
  }

  useEffect(() => {
    fetch("/api/duyurular")
      .then((r) => r.json())
      .then((d) => setDuyurular(d.slice(0, 3)))
      .catch(() => setDuyurular([]))
    fetch("/api/etkinlikler")
      .then((r) => r.json())
      .then((d) => setEtkinlikler(d.slice(0, 3)))
      .catch(() => setEtkinlikler([]))
  }, [])

  return (
    <div>
      <section className="relative overflow-hidden bg-koy-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-40 -right-20 w-[32rem] h-[32rem] rounded-full bg-koy-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] rounded-full bg-vurgu-500/15 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-[0.18em] text-koy-100 backdrop-blur">
            <Trees size={14} className="text-koy-300" />
            Köyümüz için birlikte
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.05]">
            {ayarlar.ana_hero_baslik || "Köyümüze Gönül Verenler"}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-koy-100/80 max-w-3xl mx-auto leading-relaxed">
            {ayarlar.ana_hero_alt_baslik || "Kadim köyümüzün kültürünü yaşatmak, dayanışmasını güçlendirmek ve geleceğe birlikte taşımak için bir araya geldik."}
          </p>
          <p className="mt-3 text-koy-200/60 max-w-2xl mx-auto">
            {ayarlar.ana_hero_aciklama || "Her birimizin gönlünde aynı köy, aynı hatıra, aynı umut var."}
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/uyelik" className="btn-accent">
              <HeartHandshake size={20} />
              Bize Katılın
            </Link>
            <Link to="/hakkimizda" className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 backdrop-blur transition-colors">
              Hakkımızda
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="relative h-16 bg-gradient-to-b from-transparent to-stone-50" />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="eyebrow justify-center">Neler Yapıyoruz</span>
          <h2 className="section-title mt-3">Odak Alanlarımız</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {ozellikler.map((o, i) => {
            const Ikon = ozellikIkonlari[i % ozellikIkonlari.length]
            return (
              <div key={o.baslik} className="card p-8 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-koy-50 text-koy-600 flex items-center justify-center mx-auto mb-5 group-hover:bg-koy-600 group-hover:text-white transition-colors">
                  <Ikon size={28} />
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{o.baslik}</h3>
                <p className="text-slate-600 leading-relaxed">{o.aciklama}</p>
              </div>
            )
          })}
        </div>
      </section>

      <ReklamAlani konum="ana_sayfa" baslik="Sponsorlarımız" />

      {duyurular.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="eyebrow">Gündem</span>
                <h2 className="section-title mt-3 flex items-center gap-3">
                  <Megaphone size={30} className="text-koy-600" />
                  Güncel Duyurular
                </h2>
              </div>
              <Link to="/duyurular" className="inline-flex items-center gap-1 text-koy-600 hover:text-koy-800 font-semibold">
                Tümü <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {duyurular.map((d) => (
                <article key={d.id} className="card p-6 flex flex-col">
                  <span className="self-start inline-block px-3 py-1 bg-koy-50 text-koy-700 text-xs font-semibold rounded-full mb-3">
                    {d.kategori}
                  </span>
                  <h3 className="font-display font-semibold text-lg mb-2">{d.baslik}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{d.icerik}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {etkinlikler.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="eyebrow">Takvim</span>
                <h2 className="section-title mt-3 flex items-center gap-3">
                  <CalendarDays size={30} className="text-koy-600" />
                  Yaklaşan Etkinlikler
                </h2>
              </div>
              <Link to="/etkinlikler" className="inline-flex items-center gap-1 text-koy-600 hover:text-koy-800 font-semibold">
                Tümü <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {etkinlikler.map((e) => (
                <article key={e.id} className="card p-6">
                  <h3 className="font-display font-semibold text-lg mb-2">{e.baslik}</h3>
                  <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">{e.aciklama}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} className="text-koy-500" />
                      {new Date(e.tarih).toLocaleDateString("tr-TR")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Sprout size={15} className="text-koy-500" />
                      {e.yer}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/rehber" className="card p-8 group flex flex-col justify-between min-h-[240px] hover:shadow-hover transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-koy-50 text-koy-600 flex items-center justify-center mb-5 group-hover:bg-koy-600 group-hover:text-white transition-colors">
                  <Store size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">Köy Rehberi</h3>
                <p className="text-slate-600 leading-relaxed">İşletmeler, esnaflar, çiftçiler ve köyümüzün sunduğu hizmetler.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-koy-600 group-hover:gap-2 transition-all font-semibold mt-6">
                Rehbere Göz At <ChevronRight size={18} />
              </span>
            </Link>
            <Link to="/ilanlar" className="card p-8 group flex flex-col justify-between min-h-[240px] hover:shadow-hover transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-koy-50 text-koy-600 flex items-center justify-center mb-5 group-hover:bg-koy-600 group-hover:text-white transition-colors">
                  <ScrollText size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">İlan Panosu</h3>
                <p className="text-slate-600 leading-relaxed">Köy içi alım satım, bulundu, kayıp ve duyuru ilanları.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-koy-600 group-hover:gap-2 transition-all font-semibold mt-6">
                İlanlara Göz At <ChevronRight size={18} />
              </span>
            </Link>
            <Link to="/toplantilar" className="card p-8 group flex flex-col justify-between min-h-[240px] hover:shadow-hover transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-koy-50 text-koy-600 flex items-center justify-center mb-5 group-hover:bg-koy-600 group-hover:text-white transition-colors">
                  <ClipboardList size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">Toplantılar</h3>
                <p className="text-slate-600 leading-relaxed">Genel kurul ve yönetim kurulu toplantıları, gündem ve tutanaklar.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-koy-600 group-hover:gap-2 transition-all font-semibold mt-6">
                Toplantılara Göz At <ChevronRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
