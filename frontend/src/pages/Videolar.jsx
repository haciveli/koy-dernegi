import { useState, useEffect } from "react"
import { Video as VideoIcon, Play } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

const youtubeId = (url) => {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

const vimeoId = (url) => {
  if (!url) return null
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

const embedUrl = (url) => {
  const yt = youtubeId(url)
  if (yt) return `https://www.youtube.com/embed/${yt}?autoplay=1`
  const vm = vimeoId(url)
  if (vm) return `https://player.vimeo.com/video/${vm}?autoplay=1`
  return null
}

const kapakResmi = (v) => {
  if (v.kapak_url) return v.kapak_url
  const yt = youtubeId(v.video_url)
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
  return null
}

export default function Videolar() {
  const [videolar, setVideolar] = useState([])
  const [secili, setSecili] = useState(null)
  const { ayarlar } = useAyarlar()

  useEffect(() => {
    fetch("/api/videolar")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setVideolar(d) })
      .catch(() => setVideolar([]))
  }, [])

  return (
    <div>
      <PageHeader
        icon={VideoIcon}
        title={ayarlar.videolar_baslik || "Videolar"}
        subtitle={ayarlar.videolar_alt_baslik || "Köyümüzden görüntüler ve etkinlik kayıtları"}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videolar.map((v) => {
            const kapak = kapakResmi(v)
            return (
              <button key={v.id} onClick={() => setSecili(v)} className="card group overflow-hidden cursor-pointer text-left">
                <div className="aspect-video overflow-hidden bg-stone-800 relative">
                  {kapak ? (
                    <img
                      src={kapak}
                      alt={v.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = "none" }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-koy-700 to-koy-900" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-black/50 group-hover:bg-koy-600 flex items-center justify-center transition-colors">
                      <Play size={26} className="text-white ml-1" fill="currentColor" />
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <span className="inline-block px-2.5 py-0.5 bg-koy-100 text-koy-700 text-xs font-semibold rounded-full mb-2">{v.kategori}</span>
                  <h3 className="font-semibold text-koy-800">{v.baslik}</h3>
                  {v.aciklama && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{v.aciklama}</p>}
                </div>
              </button>
            )
          })}
        </div>
        {videolar.length === 0 && <p className="text-center text-stone-500 py-12">Henüz video eklenmemiş.</p>}
      </section>

      {secili && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSecili(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSecili(null)}
              className="absolute -top-10 right-0 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              aria-label="Kapat"
            >
              ✕
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {embedUrl(secili.video_url) ? (
                <iframe
                  src={embedUrl(secili.video_url)}
                  title={secili.baslik}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={secili.video_url} controls autoPlay className="w-full h-full" />
              )}
            </div>
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
