import { useState, useEffect } from "react"
import { Megaphone, Clock } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

export default function Duyurular() {
  const [duyurular, setDuyurular] = useState([])
  const [kategori, setKategori] = useState("Tümü")
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/duyurular")
      .then((r) => r.json())
      .then(setDuyurular)
      .catch(() => setDuyurular([]))
  }, [])

  const kategoriler = ["Tümü", ...new Set(duyurular.map((d) => d.kategori))]

  const filtrelenen = kategori === "Tümü" ? duyurular : duyurular.filter((d) => d.kategori === kategori)

  const tarihYaz = (t) =>
    new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div>
      <PageHeader
        icon={Megaphone}
        title={ayarlar.duyurular_baslik || "Duyurular"}
        subtitle={ayarlar.duyurular_alt_baslik || "Derneğimizden tüm güncel haberler"}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {kategoriler.map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                kategori === k
                  ? "bg-koy-600 text-white"
                  : "bg-white text-koy-700 hover:bg-koy-100 border border-koy-200"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {filtrelenen.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500">Bu kategoride henüz duyuru yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtrelenen.map((d) => (
              <article key={d.id} className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block px-3 py-1 bg-koy-100 text-koy-700 text-xs font-semibold rounded-full">
                    {d.kategori}
                  </span>
                  <span className="text-xs text-stone-500 inline-flex items-center gap-1">
                    <Clock size={14} />
                    {tarihYaz(d.olusturulma_tarihi)}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{d.baslik}</h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{d.icerik}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}