import { useState, useEffect } from "react"
import { ScrollText, Phone, Clock } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

export default function IlanPanosu() {
  const [ilanlar, setIlanlar] = useState([])
  const [kategori, setKategori] = useState("Tümü")
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/ilanlar")
      .then((r) => r.json())
      .then(setIlanlar)
      .catch(() => setIlanlar([]))
  }, [])

  const kategoriler = ["Tümü", ...new Set(ilanlar.map((i) => i.kategori))]

  const filtrelenen =
    kategori === "Tümü" ? ilanlar : ilanlar.filter((i) => i.kategori === kategori)

  const tarihYaz = (t) =>
    new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })

  const ikonSec = (k) => {
    if (k === "Satılık") return "pricetag-outline"
    if (k === "Alınık") return "cart-outline"
    if (k === "Bulundu") return "checkmark-circle-outline"
    if (k === "Kayıp") return "help-circle-outline"
    return "grid-outline"
  }

  return (
    <div>
      <PageHeader
        icon={ScrollText}
        title={ayarlar.ilanlar_baslik || "İlan Panosu"}
        subtitle={ayarlar.ilanlar_alt_baslik || "Köy içi alım satım, bulundu ve kayıp ilanları"}
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
            <p className="text-stone-500">Henüz ilan yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtrelenen.map((i) => (
              <article key={i.id} className="card p-6">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-11 h-11 rounded-xl bg-koy-100 text-koy-700 flex items-center justify-center shrink-0">
                      <span role="img" aria-label={i.kategori}>
                        {ikonSec(i.kategori)}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-display font-semibold truncate">{i.baslik}</h3>
                      <p className="text-xs text-stone-500">
                        {i.kullanici_ad ? `${i.kullanici_ad} ${i.kullanici_soyad || ""} · ` : ""}
                        <Clock size={12} className="inline" /> {tarihYaz(i.olusturulma_tarihi)}
                      </p>
                    </div>
                  </div>
                  {i.fiyat > 0 ? (
                    <span className="text-lg font-bold text-koy-700 shrink-0">
                      {i.fiyat.toLocaleString("tr-TR")} ₺
                    </span>
                  ) : null}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">{i.aciklama}</p>
                {i.telefon ? (
                  <a
                    href={`tel:${i.telefon.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-koy-600 text-white text-sm font-medium rounded-xl hover:bg-koy-700 transition-colors"
                  >
                    <Phone size={15} />
                    {i.telefon}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}