import { useState } from "react"
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

export default function Iletisim() {
  const [form, setForm] = useState({ ad: "", email: "", konu: "", mesaj: "" })
  const [gonderildi, setGonderildi] = useState(false)
  const [hata, setHata] = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)
  const { ayarlar } = useAyarlar()

  const degistir = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const gonder = async (e) => {
    e.preventDefault()
    setHata("")
    setYukleniyor(true)
    try {
      const r = await fetch("/api/iletisim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (r.ok) {
        setGonderildi(true)
        setForm({ ad: "", email: "", konu: "", mesaj: "" })
      } else {
        const veri = await r.json()
        setHata(veri.detail || "Mesaj gönderilirken bir hata oluştu")
      }
    } catch {
      setHata("Sunucuya ulaşılamadı. Lütfen sonra tekrar deneyin.")
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div>
      <PageHeader
        icon={Mail}
        title={ayarlar.iletisim_baslik || "İletişim"}
        subtitle={ayarlar.iletisim_alt_baslik || "Sorularınız ve önerileriniz için bize ulaşın"}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {gonderildi ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
                <h2 className="text-xl font-display font-semibold text-green-800 mb-2">Mesajınız alındı!</h2>
                <p className="text-green-700 mb-6">En kısa sürede size dönüş yapacağız.</p>
                <button onClick={() => setGonderildi(false)} className="btn-outline">
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={gonder} className="card p-8">
                <h2 className="text-xl font-display font-semibold mb-6">Bize Yazın</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Adınız Soyadınız</label>
                    <input
                      type="text"
                      name="ad"
                      required
                      value={form.ad}
                      onChange={degistir}
                      className="input-field"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">E-posta</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={degistir}
                      className="input-field"
                      placeholder="ornek@eposta.com"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Konu</label>
                  <select name="konu" required value={form.konu} onChange={degistir} className="input-field">
                    <option value="">Konu seçin</option>
                    <option>Genel Bilgi</option>
                    <option>Üyelik Hakkında</option>
                    <option>Etkinlik Önerisi</option>
                    <option>Bağış ve Destek</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Mesajınız</label>
                  <textarea
                    name="mesaj"
                    required
                    rows="5"
                    value={form.mesaj}
                    onChange={degistir}
                    className="input-field"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
                {hata && <p className="text-red-600 text-sm mb-4">{hata}</p>}
                <button type="submit" disabled={yukleniyor} className="btn-primary w-full">
                  <Send size={18} className="mr-2" />
                  {yukleniyor ? "Gönderiliyor..." : "Mesajı Gönder"}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-display font-semibold mb-4">Dernek Merkezi</h3>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-koy-600 mt-0.5 flex-shrink-0" />
                  {ayarlar.iletisim_adres || "Yeditepe Mah. Dernek Sok. No: 1, İstanbul"}
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-koy-600 flex-shrink-0" />
                  {ayarlar.iletisim_telefon || "+90 (212) 555 55 55"}
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-koy-600 flex-shrink-0" />
                  {ayarlar.iletisim_email || "info@koyumegonul.org"}
                </li>
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-semibold mb-3">Ofis Saatlerimiz</h3>
              <ul className="text-sm text-stone-600 space-y-2">
                {(ayarlar.ofis_saatleri || "Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 15:00\nPazar: Kapalı")
                  .split("\n")
                  .filter(Boolean)
                  .map((satir, i) => (
                    <li key={i}>{satir}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}