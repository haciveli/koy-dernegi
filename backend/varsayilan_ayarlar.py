import json

# Site genelinde kullanilan varsayilan metin ve ayarlar.
# Anahtar -> varsayilan deger. JSON alanlari string olarak tutulur.

VARSAYILAN_AYARLAR = {
    # Genel
    "site_adi": "Köyüme Gönül Derneği",
    "site_kisa_aciklama": "Dayanışma · Kültür · Gelecek",
    "footer_metni": "Köyümüzün dayanışmasını güçlendirmek, kültürümüzü yaşatmak ve geleceğe taşımak için çalışan bir gönüllüler topluluğuyuz.",
    "telif_metni": "© 2024 Köyüme Gönül Derneği. Tüm hakları saklıdır.",

    # Tema
    "tema_renk": "yesil",
    "tema_ana_renk": "#2f6149",
    "tema_vurgu_renk": "#c98a24",
    "tema_font_govde": "Inter",
    "tema_font_baslik": "Plus Jakarta Sans",

    # Ust banner
    "banner_aktif": "0",
    "banner_metin": "Kurban Bayramı yardım kampanyamıza katılın, birlikte daha güçlüyüz.",
    "banner_link": "/duyurular",
    "banner_buton": "Detaylı Bilgi",
    "banner_renk": "koy",

    # Iletisim
    "iletisim_baslik": "İletişim",
    "iletisim_alt_baslik": "Sorularınız ve önerileriniz için bize ulaşın",
    "iletisim_adres": "Yeditepe Mah. Dernek Sok. No: 1, İstanbul",
    "iletisim_telefon": "+90 (212) 555 55 55",
    "iletisim_email": "info@koyumegonul.org",
    "ofis_saatleri": "Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 15:00\nPazar: Kapalı",

    # Aidat ve Bağış
    "aidat_aylik_tutar": "500",
    "aidat_iban": "TR45 0000 0000 0000 0000 0000 00",
    "aidat_banka": "Ziraat Bankası",
    "aidat_alici": "Köyüme Gönül Derneği",
    "aidat_aciklama": "Açıklamaya adınızı ve soyadınızı yazınız.",
    "bagis_iban": "TR45 0000 0000 0000 0000 0000 00",
    "bagis_banka": "Ziraat Bankası",
    "bagis_alici": "Köyüme Gönül Derneği",
    "bagis_aciklama": "Bağışınız için teşekkür ederiz. Açıklamaya adınızı soyadınızı ekleyiniz.",

    # Ana sayfa
    "ana_hero_baslik": "Köyümüze Gönül Verenler",
    "ana_hero_alt_baslik": "Kadim köyümüzün kültürünü yaşatmak, dayanışmasını güçlendirmek ve geleceğe birlikte taşımak için bir araya geldik.",
    "ana_hero_aciklama": "Her birimizin gönlünde aynı köy, aynı hatıra, aynı umut var.",
    "ana_ozellikler": json.dumps([
        {"baslik": "Kültürümüz", "aciklama": "Köyümüzün zengin kültürel mirasını koruyor, yaşatıyor ve gelecek nesillere aktarıyoruz."},
        {"baslik": "Dayanışmamız", "aciklama": "Zor zamanlarında köylülerimizin yanında oluyor, birlik ve beraberliğimizi güçlendiriyoruz."},
        {"baslik": "Geleceğimiz", "aciklama": "Gençlerimize burs, eğitim ve iş imkanları sağlayarak köyümüzün geleceğini şekillendiriyoruz."},
    ], ensure_ascii=False),

    # Hakkımızda
    "hakkimizda_baslik": "Hakkımızda",
    "hakkimizda_ust_metin": "Köyüme Gönül Derneği, köyümüzün dayanışma, kültür ve eğitim ihtiyaçlarını karşılamak üzere 1998 yılında kurulmuş, tamamen gönüllülerden oluşan bir sivil toplum kuruluşudur.",
    "hakkimizda_degerler": json.dumps([
        {"baslik": "Birlik", "aciklama": "Köyümüzün tüm fertleri için kucaklayıcı, ayrım gözetmeyen bir dernek."},
        {"baslik": "Kültür", "aciklama": "Geleneklerimizi, türkülerimizi, mutfağımızı ve el sanatlarımızı yaşatmak."},
        {"baslik": "Yardımlaşma", "aciklama": "İhtiyaç sahibi köylülerimizin yanında olmak, şeffaf bir dayanışma."},
        {"baslik": "Eğitim", "aciklama": "Gençlerimize burs vererek ve gece dersleri düzenleyerek gelecek kurmak."},
    ], ensure_ascii=False),
    "hakkimizda_misyon_metin": "Köyümüzün kültürel mirasını korumak, gençlerimizin eğitimine destek olmak ve her koşulda kendi ayakları üzerinde duran güçlü bir toplum oluşturmak için çalışıyoruz. Ayrıntılı hedeflerimiz:",
    "hakkimizda_misyon_maddeleri": json.dumps([
        "Köyümüzdeki tarihi yapıların restorasyonunu desteklemek",
        "Her yıl en az 10 öğrenciye tam burs sağlamak",
        "Köy meydanı ve sosyal tesislerin modernizasyonunu tamamlamak",
        "Yurt dışında yaşayan hemşehrilerimizle bağı güçlendirmek",
        "Tarım ve hayvancılık kooperatifleri kurarak üretimi teşvik etmek",
    ], ensure_ascii=False),
    "yonetim_kurulu": json.dumps([
        {"ad": "Ahmet Yılmaz", "gorev": "Başkan", "aciklama": "Köyümüzde 35 yıl yaşamış, derneğin kurucu üyelerinden."},
        {"ad": "Fatma Kaya", "gorev": "Başkan Yardımcısı", "aciklama": "Öğretmen, eğitim komitesi sorumlusu."},
        {"ad": "Mehmet Demir", "gorev": "Genel Sekreter", "aciklama": "Mimar, köye kazandırılan kamu binalarının proje yürütücüsü."},
        {"ad": "Ayşe Şahin", "gorev": "Sayman", "aciklama": "Muhasebeci, derneğin mali işlerinden sorumlu."},
        {"ad": "Hasan Çelik", "gorev": "Yönetim Kurulu Üyesi", "aciklama": "Doktor, sağlık taramaları organizatörü."},
        {"ad": "Elif Aydın", "gorev": "Yönetim Kurulu Üyesi", "aciklama": "Hukukçu, üyelik ve etik işlerden sorumlu."},
    ], ensure_ascii=False),

    # Sayfa basliklari
    "etkinlikler_baslik": "Etkinlikler",
    "etkinlikler_alt_baslik": "Köyümüzün panayırları, festivalleri ve buluşmaları",
    "duyurular_baslik": "Duyurular",
    "duyurular_alt_baslik": "Derneğimizden tüm güncel haberler",
    "galeri_baslik": "Fotoğraf Galerisi",
    "galeri_alt_baslik": "Köyümüzün ve derneğimizin anıları",
    "uyelik_baslik": "Üyelik",
    "uyelik_alt_baslik": "Köyümüzün ailesine katılın",
    "videolar_baslik": "Videolar",
    "videolar_alt_baslik": "Köyümüzden görüntüler ve etkinlik kayıtları",
    "rehber_baslik": "Köy Rehberi",
    "rehber_alt_baslik": "Köyümüzün işletmeleri ve hizmetleri",
    "ilanlar_baslik": "İlan Panosu",
    "ilanlar_alt_baslik": "Köy içi alım satım, bulundu ve kayıp ilanları",
    "toplantilar_baslik": "Toplantılar",
    "toplantilar_alt_baslik": "Genel kurul ve yönetim kurulu toplantıları, gündem ve tutanaklar",
}


def varsayilan_ayarlari_doldur(db):
    from models import SiteAyar
    mevcut = {a.anahtar for a in db.query(SiteAyar).all()}
    for anahtar, deger in VARSAYILAN_AYARLAR.items():
        if anahtar not in mevcut:
            db.add(SiteAyar(anahtar=anahtar, deger=deger))
    db.commit()
