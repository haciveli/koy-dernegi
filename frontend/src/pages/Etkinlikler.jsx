import { useState, useEffect } from "react"
import { CalendarDays, MapPin, Users, Ticket, CheckCircle2 } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

export default function Etkinlikler() {
  const [etkinlikler, setEtkinlikler] = useState([])
  const [secili, setSecili] = useState(null)
  const [kayitDurum, setKayitDurum] = useState({})
  const [yukleniyor, setYukleniyor] = useState(true)
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/etkinlikler")
      .then((r) => r.json())
      .then((d) => {
        const simdi = new Date()
        const gelecek = d
          .filter((e) => new Date(e.tarih) >= simdi)
          .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
        const gecmis = d
          .filter((e) => new Date(e.tarih) < simdi)
          .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        setEtkinlikler([...gelecek, ...gecmis])
      })
      .catch(() => setEtkinlikler([]))
      .finally(() => setYukleniyor(false))
  }, [])

  const formattaTarih = (t) =>
    new Date(t).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const kayitOl = async (id) => {
    try {
      const r = await fetch(`/api/etkinlikler/${id}/kayit`, { method: "POST" })
      const veri = await r.json()
      if (r.ok) {
        setKayitDurum((s) => ({ ...s, [id]: "başarılı" }))
        setEtkinlikler((es) =>
          es.map((e) => (e.id === id ? { ...e, kayitli: e.kayitli + 1 } : e))
        )
      } else {
        setKayitDurum((s) => ({ ...s, [id]: veri.detail || "Hata" }))
      }
    } catch {
      setKayitDurum((s) => ({ ...s, [id]: "Sunucuya ulaşılamadı" }))
    }
  }

  const gecmisMi = (t) => new Date(t) < new Date()

  return (
    <div>
      <PageHeader
        icon={CalendarDays}
        title={ayarlar.etkinlikler_baslik || "Etkinlikler"}
        subtitle={ayarlar.etkinlikler_alt_baslik || "Köyümüzün panayırları, festivalleri ve buluşmaları"}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        {yukleniyor ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-koy-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-stone-500">Etkinlikler yükleniyor...</p>
          </div>
        ) : etkinlikler.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays size={48} className="mx-auto text-stone-400 mb-4" />
            <p className="text-stone-500">Henüz etkinlik eklenmemiş.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {etkinlikler.map((e) => {
              const dolu = e.kayitli >= e.kontenjan
              const gecmis = gecmisMi(e.tarih)
              return (
                <div key={e.id} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-semibold mb-1">{e.baslik}</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={16} className="text-koy-600" />
                          {formattaTarih(e.tarih)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={16} className="text-koy-600" />
                          {e.yer}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={16} className="text-koy-600" />
                          {e.kayitli} / {e.kontenjan} kişi
                        </span>
                      </div>
                      <p className="mt-3 text-stone-600 leading-relaxed">{e.aciklama}</p>
                    </div>
                    <div className="flex flex-col gap-2 md:w-40 flex-shrink-0">
                      {gecmis ? (
                        <span className="px-4 py-2 text-center bg-stone-100 text-stone-500 rounded-lg text-sm font-medium">
                          Sona Erdi
                        </span>
                      ) : dolu ? (
                        <span className="px-4 py-2 text-center bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                          Kontenjan Dolu
                        </span>
                      ) : kayitDurum[e.id] === "başarılı" ? (
                        <span className="px-4 py-2 text-center bg-green-100 text-green-700 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-1">
                          <CheckCircle2 size={16} /> Kayıtlısınız
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSecili(e.id)
                            kayitOl(e.id)
                          }}
                          className="btn-primary"
                        >
                          <Ticket size={18} className="mr-2" />
                          Katıl
                        </button>
                      )}
                      {kayitDurum[e.id] && kayitDurum[e.id] !== "başarılı" && (
                        <span className="text-sm text-red-600 text-center">{kayitDurum[e.id]}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}