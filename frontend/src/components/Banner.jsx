import { Link } from "react-router-dom"
import { Megaphone, X } from "lucide-react"
import { useState } from "react"
import { useAyarlar } from "../AyarlarContext"

const renkler = {
  koy: "bg-koy-700 text-white",
  amber: "bg-amber-500 text-white",
  kirmizi: "bg-red-600 text-white",
  yesil: "bg-green-600 text-white",
  lacivert: "bg-blue-800 text-white",
}

export default function Banner() {
  const { ayarlar } = useAyarlar()
  const [kapali, setKapali] = useState(false)

  if (kapali || ayarlar.banner_aktif !== "1" || !ayarlar.banner_metin) return null

  const renk = renkler[ayarlar.banner_renk] || renkler.koy
  const link = ayarlar.banner_link

  return (
    <div className={`${renk} text-sm relative`}>
      <div className="max-w-7xl mx-auto px-10 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <Megaphone size={16} className="flex-shrink-0" />
        <p className="font-medium">{ayarlar.banner_metin}</p>
        {link && ayarlar.banner_buton && (
          <Link to={link} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 font-semibold transition-colors">
            {ayarlar.banner_buton}
          </Link>
        )}
      </div>
      <button
        onClick={() => setKapali(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
        title="Kapat"
      >
        <X size={16} />
      </button>
    </div>
  )
}
