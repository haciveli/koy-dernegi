import { useState, useEffect } from "react"
import { ClipboardList, MapPin, CalendarDays, PlayCircle, FileText, Video } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

const DURUM_ETIKET = { planlandi: "Planlandı", duzenlendi: "Yapıldı", iptal: "İptal Edildi" }

export default function Toplantilar() {
  const [toplantilar, setToplantilar] = useState([])
  const [secilen, setSecilen] = useState(null)
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/toplantilar")
      .then((r) => r.json())
      .then(setToplantilar)
      .catch(() => setToplantilar([]))
  }, [])

  const tarihYaz = (t) =>
    new Date(t).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title={ayarlar.toplantilar_baslik || "Toplantılar"}
        subtitle={ayarlar.toplantilar_alt_baslik || "Genel kurul ve yönetim kurulu toplantıları"}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        {toplantilar.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500">Henüz planlanmış toplantı yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {toplantilar.map((t) => (
                <article key={t.id} className={`card p-6 cursor-pointer transition-all ${secilen === t.id ? "ring-2 ring-koy-500" : "hover:border-koy-200"}`} onClick={() => setSecilen(t.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-xl bg-koy-100 text-koy-700 flex items-center justify-center shrink-0">
                        <CalendarDays size={20} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-display font-semibold truncate">{t.baslik}</h3>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <CalendarDays size={12} className="inline" /> {tarihYaz(t.tarih)}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-semibold ${t.durum === "planlandi" ? "bg-amber-100 text-amber-700" : t.durum === "duzenlendi" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {DURUM_ETIKET[t.durum] || t.durum}
                    </span>
                  </div>
                  {t.yer ? (
                    <p className="mt-3 text-sm text-stone-600 flex items-center gap-1.5">
                      <MapPin size={14} className="text-koy-500" /> {t.yer}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="card p-6 h-fit">
              {toplantilar.filter((t) => t.id === secilen)[0] ? (() => {
                const t = toplantilar.filter((x) => x.id === secilen)[0]
                return (
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">{t.baslik}</h3>
                    <p className="text-sm text-stone-500 mt-1 flex items-center gap-1.5">
                      <CalendarDays size={14} /> {tarihYaz(t.tarih)}
                      {t.yer ? <><span className="mx-1">·</span><MapPin size={14} /> {t.yer}</> : null}
                    </p>
                    {t.aciklama ? <p className="mt-4 text-stone-600 text-sm leading-relaxed">{t.aciklama}</p> : null}

                    {t.gundem?.length ? (
                      <div className="mt-6">
                        <h4 className="font-display font-semibold text-slate-800 flex items-center gap-2">
                          <FileText size={16} className="text-koy-600" /> Gündem
                        </h4>
                        <ul className="mt-3 space-y-2">
                          {t.gundem.map((g) => (
                            <li key={g.id} className="flex gap-3 items-start">
                              <span className="w-6 h-6 rounded-full bg-koy-100 text-koy-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {g.sira}
                              </span>
                              <span className="text-sm text-stone-700">{g.baslik}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {t.oylamalar?.length ? (
                      <div className="mt-6">
                        <h4 className="font-display font-semibold text-slate-800">Oylamalar</h4>
                        <div className="mt-3 space-y-3">
                          {t.oylamalar.map((o) => (
                            <div key={o.id} className="border border-stone-100 rounded-xl p-4">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="font-medium text-sm text-slate-800">{o.konu}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${o.aktif ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                                  {o.aktif ? "Devam ediyor" : "Kapatıldı"}
                                </span>
                              </div>
                              {o.oy_sayisi ? (
                                <div className="mt-3 space-y-2">
                                  {(o.secenekler || []).map((s) => {
                                    const sayi = o.oy_secimler?.[s] || 0
                                    const oran = o.oy_sayisi ? Math.round((sayi / o.oy_sayisi) * 100) : 0
                                    return (
                                      <div key={s}>
                                        <div className="flex justify-between text-xs text-stone-600">
                                          <span>{s}</span>
                                          <span>{sayi} (%{oran})</span>
                                        </div>
                                        <div className="mt-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-koy-600 rounded-full" style={{ width: `${oran}%` }} />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-stone-500 mt-2">Henüz oy kullanılmadı.</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {t.video_url ? (
                      <a
                        href={t.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-koy-600 text-white text-sm font-medium rounded-xl hover:bg-koy-700 transition-colors"
                      >
                        <Video size={15} /> Toplantı Videosu
                      </a>
                    ) : null}

                    {t.tutanak ? (
                      <div className="mt-6">
                        <h4 className="font-display font-semibold text-slate-800 flex items-center gap-2">
                          <FileText size={16} className="text-koy-600" /> Tutanak
                        </h4>
                        <p className="mt-2 text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{t.tutanak}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })() : (
                <div className="text-center py-16 text-stone-500 flex flex-col items-center gap-3">
                  <PlayCircle size={40} className="text-stone-300" />
                  <p>Detayları görmek için soldan bir toplantı seçin.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}