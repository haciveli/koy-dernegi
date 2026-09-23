import { useState, useEffect } from "react"
import { Image } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

const varsayilanResimler = [
  { id: 1, baslik: "Sonbahar Şenliği", resim_url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", aciklama: "Köy meydanında düzenlenen geleneksel sonbahar şenliği" },
  { id: 2, baslik: "Hasat Zamanı", resim_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", aciklama: "Buğday hasatında bir araya gelen köylülerimiz" },
  { id: 3, baslik: "Köy Kahvesi", resim_url: "https://images.unsplash.com/photo-1508278683621-3cfadd3c3d92?w=800&q=80", aciklama: "Uzun yıllardır ayakta olan tarihi köy kahvemiz" },
  { id: 4, baslik: "Cami Restorasyonu", resim_url: "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80", aciklama: "Yeni restore edilen köy camimizin açılışı" },
  { id: 5, baslik: "Kültür Gecesi", resim_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80", aciklama: "Düzenli olarak gerçekleştirdiğimiz kültür geceleri" },
  { id: 6, baslik: "Gençlik Bursu", resim_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", aciklama: "Üniversite öğrencilerimize vermekte olduğumuz burs programı" },
  { id: 7, baslik: "Köy Kütüphanesi", resim_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80", aciklama: "Gençlerimiz için kurduğumuz köy kütüphanesi" },
  { id: 8, baslik: "El Sanatları", resim_url: "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=800&q=80", aciklama: "Kadınlarımızın el emeği göz nuru ürünleri" },
]

export default function Galeri() {
  const [resimler, setResimler] = useState([])
  const [secili, setSecili] = useState(null)
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/galeri")
      .then((r) => r.json())
      .then((d) => {
        if (d.length > 0) setResimler(d)
        else setResimler(varsayilanResimler)
      })
      .catch(() => setResimler(varsayilanResimler))
  }, [])

  return (
    <div>
      <PageHeader
        icon={Image}
        title={ayarlar.galeri_baslik || "Fotoğraf Galerisi"}
        subtitle={ayarlar.galeri_alt_baslik || "Köyümüzün ve derneğimizin anıları"}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resimler.map((r) => (
            <button
              key={r.id}
              onClick={() => setSecili(r)}
              className="card group overflow-hidden cursor-pointer text-left"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={r.resim_url}
                  alt={r.baslik}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80"
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-koy-800">{r.baslik}</h3>
                {r.aciklama && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{r.aciklama}</p>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {secili && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSecili(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSecili(null)}
              className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              aria-label="Kapat"
            >
              ✕
            </button>
            <img src={secili.resim_url} alt={secili.baslik} className="w-full max-h-[75vh] object-contain rounded-lg" />
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h3 className="font-display font-semibold text-lg">{secili.baslik}</h3>
              {secili.aciklama && <p className="text-stone-600 mt-1">{secili.aciklama}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}