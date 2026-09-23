import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ExternalLink } from "lucide-react"

function Baglanti({ link, children, className }) {
  if (!link) return <div className={className}>{children}</div>
  if (link.startsWith("/")) {
    return <Link to={link} className={className}>{children}</Link>
  }
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

export default function ReklamAlani({ konum, baslik }) {
  const [reklamlar, setReklamlar] = useState([])

  useEffect(() => {
    fetch(`/api/reklamlar?konum=${konum}&sadece_aktif=true`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setReklamlar(d) })
      .catch(() => {})
  }, [konum])

  if (reklamlar.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {baslik && (
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-display font-semibold text-stone-700">{baslik}</h2>
          <span className="text-[10px] uppercase tracking-wider text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">Reklam</span>
        </div>
      )}
      <div className={`grid gap-4 ${reklamlar.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {reklamlar.map((r) => (
          <Baglanti
            key={r.id}
            link={r.link_url}
            className="card overflow-hidden group block hover:shadow-lg transition-shadow"
          >
            {r.resim_url && (
              <div className="aspect-[3/1] overflow-hidden bg-stone-100">
                <img
                  src={r.resim_url}
                  alt={r.baslik}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => (e.target.style.opacity = "0.1")}
                />
              </div>
            )}
            <div className="p-5">
              <h3 className="font-display font-semibold text-stone-800 flex items-center gap-2">
                {r.baslik}
                {r.link_url && <ExternalLink size={14} className="text-stone-400" />}
              </h3>
              {r.aciklama && <p className="text-sm text-stone-600 mt-1">{r.aciklama}</p>}
            </div>
          </Baglanti>
        ))}
      </div>
    </section>
  )
}
