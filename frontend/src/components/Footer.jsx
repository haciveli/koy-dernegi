import { Trees, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useAyarlar } from "../AyarlarContext"

const baglantilar = [
  { to: "/hakkimizda", label: "Hakkımızda" },
  { to: "/etkinlikler", label: "Etkinlikler" },
  { to: "/duyurular", label: "Duyurular" },
  { to: "/galeri", label: "Galeri" },
  { to: "/videolar", label: "Videolar" },
  { to: "/uyelik", label: "Üyelik" },
]

export default function Footer() {
  const { ayarlar } = useAyarlar()

  return (
    <footer className="bg-koy-950 text-koy-100/70">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2 max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-koy-400 to-koy-600 flex items-center justify-center">
                <Trees size={24} className="text-white" />
              </span>
              <span className="font-display font-extrabold text-white text-lg tracking-tight">
                {ayarlar.site_adi || "Köyüme Gönül Derneği"}
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {ayarlar.footer_metni || "Köyümüzün dayanışmasını güçlendirmek, kültürümüzü yaşatmak ve geleceğe taşımak için çalışan bir gönüllüler topluluğuyuz."}
            </p>
          </div>

          <div>
            <h3 className="font-display text-white font-semibold mb-5 text-sm uppercase tracking-wider">Hızlı Bağlantılar</h3>
            <ul className="space-y-2.5 text-sm">
              {baglantilar.map((b) => (
                <li key={b.to}>
                  <Link to={b.to} className="inline-flex items-center gap-1.5 hover:text-white transition-colors group">
                    {b.label}
                    <ArrowUpRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-white font-semibold mb-5 text-sm uppercase tracking-wider">İletişim</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-koy-300 flex-shrink-0" />
                {ayarlar.iletisim_adres || "Yeditepe Mah. Dernek Sok. No: 1, İstanbul"}
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-koy-300 flex-shrink-0" />
                {ayarlar.iletisim_telefon || "+90 (212) 555 55 55"}
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-koy-300 flex-shrink-0" />
                {ayarlar.iletisim_email || "info@koyumegonul.org"}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>{ayarlar.telif_metni || "© 2024 Köyüme Gönül Derneği. Tüm hakları saklıdır."}</span>
          <span className="text-koy-100/40">Köyümüze gönül veren herkese teşekkürler.</span>
        </div>
      </div>
    </footer>
  )
}
