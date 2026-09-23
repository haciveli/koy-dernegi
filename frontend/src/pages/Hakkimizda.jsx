import { Trees, Medal, Users, HelpingHand, GraduationCap } from "lucide-react"
import { useAyarlar } from "../AyarlarContext"
import PageHeader from "../components/PageHeader"

const degerIkonlari = [Users, Medal, HelpingHand, GraduationCap]

const varsayilanYonetim = [
  { ad: "Ahmet Yılmaz", gorev: "Başkan", aciklama: "Köyümüzde 35 yıl yaşamış, derneğin kurucu üyelerinden." },
  { ad: "Fatma Kaya", gorev: "Başkan Yardımcısı", aciklama: "Öğretmen, eğitim komitesi sorumlusu." },
  { ad: "Mehmet Demir", gorev: "Genel Sekreter", aciklama: "Mimar, köye kazandırılan kamu binalarının proje yürütücüsü." },
  { ad: "Ayşe Şahin", gorev: "Sayman", aciklama: "Muhasebeci, derneğin mali işlerinden sorumlu." },
  { ad: "Hasan Çelik", gorev: "Yönetim Kurulu Üyesi", aciklama: "Doktor, sağlık taramaları organizatörü." },
  { ad: "Elif Aydın", gorev: "Yönetim Kurulu Üyesi", aciklama: "Hukukçu, üyelik ve etik işlerden sorumlu." },
]

const varsayilanDegerler = [
  { baslik: "Birlik", aciklama: "Köyümüzün tüm fertleri için kucaklayıcı, ayrım gözetmeyen bir dernek." },
  { baslik: "Kültür", aciklama: "Geleneklerimizi, türkülerimizi, mutfağımızı ve el sanatlarımızı yaşatmak." },
  { baslik: "Yardımlaşma", aciklama: "İhtiyaç sahibi köylülerimizin yanında olmak, şeffaf bir dayanışma." },
  { baslik: "Eğitim", aciklama: "Gençlerimize burs vererek ve gece dersleri düzenleyerek gelecek kurmak." },
]

const varsayilanMisyon = [
  "Köyümüzdeki tarihi yapıların restorasyonunu desteklemek",
  "Her yıl en az 10 öğrenciye tam burs sağlamak",
  "Köy meydanı ve sosyal tesislerin modernizasyonunu tamamlamak",
  "Yurt dışında yaşayan hemşehrilerimizle bağı güçlendirmek",
  "Tarım ve hayvancılık kooperatifleri kurarak üretimi teşvik etmek",
]

const jsonCoz = (metin, varsayilan) => {
  try {
    const d = JSON.parse(metin || "")
    return Array.isArray(d) && d.length ? d : varsayilan
  } catch {
    return varsayilan
  }
}

export default function Hakkimizda() {
  const { ayarlar } = useAyarlar()
  const yonetim = jsonCoz(ayarlar.yonetim_kurulu, varsayilanYonetim)
  const degerler = jsonCoz(ayarlar.hakkimizda_degerler, varsayilanDegerler)
  const misyonMaddeleri = jsonCoz(ayarlar.hakkimizda_misyon_maddeleri, varsayilanMisyon)

  return (
    <div>
      <PageHeader
        icon={Trees}
        title={ayarlar.hakkimizda_baslik || "Hakkımızda"}
        subtitle={ayarlar.hakkimizda_ust_metin || "Köyüme Gönül Derneği, köyümüzün dayanışma, kültür ve eğitim ihtiyaçlarını karşılamak üzere 1998 yılında kurulmuş, tamamen gönüllülerden oluşan bir sivil toplum kuruluşudur."}
      />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="section-title">Değerlerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {degerler.map((d, i) => {
            const Ikon = degerIkonlari[i % degerIkonlari.length]
            return (
              <div key={d.baslik} className="card p-6 text-center">
                <Ikon size={36} className="mx-auto mb-3 text-koy-600" />
                <h3 className="font-display font-semibold text-lg mb-2">{d.baslik}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{d.aciklama}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title">Misyonumuz</h2>
          <p className="text-center text-stone-700 leading-relaxed text-lg">
            {ayarlar.hakkimizda_misyon_metin || "Köyümüzün kültürel mirasını korumak, gençlerimizin eğitimine destek olmak ve her koşulda kendi ayakları üzerinde duran güçlü bir toplum oluşturmak için çalışıyoruz. Ayrıntılı hedeflerimiz:"}
          </p>
          <ul className="mt-8 space-y-3 text-stone-700">
            {misyonMaddeleri.map((m, i) => (
              <li key={i} className="flex items-start gap-3 bg-stone-50 p-4 rounded-lg">
                <span className="w-6 h-6 bg-koy-600 text-white rounded-full font-semibold flex items-center justify-center flex-shrink-0 text-sm">{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="section-title">Yönetim Kurulumuz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yonetim.map((u) => (
            <div key={u.ad} className="card p-6">
              <div className="w-16 h-16 bg-koy-200 text-koy-700 rounded-full flex items-center justify-center font-display text-2xl font-bold mb-4 mx-auto">
                {u.ad.split(" ").map((k) => k[0]).join("")}
              </div>
              <h3 className="text-center font-semibold text-lg">{u.ad}</h3>
              <p className="text-center text-koy-600 font-medium text-sm mb-3">{u.gorev}</p>
              <p className="text-center text-sm text-stone-600 leading-relaxed">{u.aciklama}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}