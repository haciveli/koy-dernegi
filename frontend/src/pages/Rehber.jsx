import { useState, useEffect } from "react"
import { Store, Phone, MapPin } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

export default function Rehber() {
  const [kayitlar, setKayitlar] = useState([])
  const [kategori, setKategori] = useState("Tümü")
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/rehber")
      .then((r) => r.json())
      .then(setKayitlar)
      .catch(() => setKayitlar([]))
  }, [])

  const kategoriler = ["Tümü", ...new Set(kayitlar.map((k) => k.kategori || "Genel"))]

  const filtrelenen =
    kategori === "Tümü" ? kayitlar : kayitlar.filter((k) => k.kategori === kategori)

  return (
    <div>
      <PageHeader
        icon={Store}
        title={ayarlar.rehber_baslik || "Köy Rehberi"}
        subtitle={ayarlar.rehber_alt_baslik || "Köyümüzün işletmeleri ve hizmetleri"}
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
            <p className="text-stone-500">Bu kategoride henüz kayıt yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrelenen.map((k) => (
              <article key={k.id} className="card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-display font-semibold">{k.ad}</h3>
                  <span className="inline-block px-3 py-1 bg-koy-100 text-koy-700 text-xs font-semibold rounded-full">
                    {k.kategori || "Genel"}
                  </span>
                </div>
                {k.aciklama ? (
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{k.aciklama}</p>
                ) : null}
                <div className="mt-auto space-y-2 text-sm text-stone-500">
                  {k.telefon ? (
                    <p className="flex items-center gap-2">
                      <Phone size={15} className="text-koy-600" />
                      <a href={`tel:${k.telefon.replace(/[^0-9+]/g, "")}`} className="hover:text-koy-700">
                        {k.telefon}
                      </a>
                    </p>
                  ) : null}
                  {k.adres ? (
                    <p className="flex items-center gap-2">
                      <MapPin size={15} className="text-koy-600" />
                      {k.adres}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}