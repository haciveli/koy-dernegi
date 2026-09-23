import { Link, NavLink, useLocation } from "react-router-dom"
import { Menu, X, Trees, Home, Users, CalendarDays, Megaphone, Image, Video, Mail, LayoutDashboard, MessageCircle, Store, ScrollText, ClipboardList } from "lucide-react"
import { useState } from "react"
import { useAyarlar } from "../AyarlarContext"

const navItems = [
  { to: "/", label: "Ana Sayfa", icon: Home },
  { to: "/hakkimizda", label: "Hakkımızda", icon: Users },
  { to: "/etkinlikler", label: "Etkinlikler", icon: CalendarDays },
  { to: "/duyurular", label: "Duyurular", icon: Megaphone },
  { to: "/rehber", label: "Rehber", icon: Store },
  { to: "/ilanlar", label: "İlan Panosu", icon: ScrollText },
  { to: "/toplantilar", label: "Toplantılar", icon: ClipboardList },
  { to: "/galeri", label: "Galeri", icon: Image },
  { to: "/videolar", label: "Videolar", icon: Video },
  { to: "/iletisim", label: "İletişim", icon: Mail },
  { to: "/sohbet", label: "Sohbet", icon: MessageCircle },
]

export default function Navbar() {
  const [acik, setAcik] = useState(false)
  const location = useLocation()
  const { ayarlar } = useAyarlar()

  return (
    <nav className="sticky top-0 z-50 bg-koy-900/95 backdrop-blur-md border-b border-white/10 shadow-soft">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-koy-400 to-koy-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Trees size={24} className="text-white" />
            </span>
            <span className="leading-tight">
              <span className="font-display font-extrabold text-white text-lg block tracking-tight">
                {ayarlar.site_adi || "Köyüme Gönül Derneği"}
              </span>
              <span className="text-[11px] font-medium text-koy-300 tracking-wide uppercase">
                {ayarlar.site_kisa_aciklama || "Dayanışma · Kültür · Gelecek"}
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-koy-100/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
              <Link to="/uyelik" className="btn-accent !px-4 !py-2 text-sm">
                Üye Ol
              </Link>
              <Link
                to="/yonetim"
                className={`p-2.5 rounded-lg transition-colors ${location.pathname === "/yonetim" ? "bg-white/15 text-white" : "text-koy-100/70 hover:bg-white/10 hover:text-white"}`}
                title="Yönetim Paneli"
              >
                <LayoutDashboard size={20} />
              </Link>
            </div>
          </div>

          <button
            onClick={() => setAcik(!acik)}
            className="lg:hidden p-2.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Menüyü aç/kapat"
          >
            {acik ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {acik && (
        <div className="lg:hidden px-4 pb-5 pt-2 space-y-1 border-t border-white/10 animate-fade-in">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setAcik(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-koy-100/70 hover:bg-white/5"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
          <div className="flex gap-2 pt-3">
            <Link to="/uyelik" onClick={() => setAcik(false)} className="btn-accent flex-1">
              Üye Ol
            </Link>
            <Link to="/yonetim" onClick={() => setAcik(false)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-white/15 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors">
              <LayoutDashboard size={17} /> Yönetim
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
