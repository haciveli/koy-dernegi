import os
import datetime
import models
import security
import varsayilan_ayarlar
from database import SessionLocal, engine, Base

if os.path.exists("koydernegi.db"):
    os.remove("koydernegi.db")

Base.metadata.create_all(bind=engine)
db = SessionLocal()

yonetici = models.Kullanici(
    ad="Ahmet", soyad="Yılmaz", email="ahmet@koyumegonul.org",
    telefon="05321234567", koy="Yukarı Köy", rol="yonetici", durum="onayli",
    sifre_hash=security.sifre_hash_olustur("admin123"),
)
db.add(yonetici)

demo_kullanicilar = [
    ("Fatma", "Kaya", "fatma@ornek.com", "05320000001", "Yukarı Köy", "onayli"),
    ("Mehmet", "Demir", "mehmet@ornek.com", "05320000002", "Aşağı Köy", "onayli"),
    ("Ayşe", "Şahin", "ayse@ornek.com", "05320000003", "Orta Köy", "onayli"),
    ("Hasan", "Çelik", "hasan@ornek.com", "05320000004", "Yukarı Köy", "onayli"),
    ("Zeynep", "Arslan", "zeynep@ornek.com", "05320000005", "Orta Köy", "beklemede"),
    ("Mustafa", "Koç", "mustafa@ornek.com", "05320000006", "Aşağı Köy", "beklemede"),
]
for ad, soyad, email, tel, koy, durum in demo_kullanicilar:
    db.add(models.Kullanici(ad=ad, soyad=soyad, email=email, telefon=tel, koy=koy, rol="uye", durum=durum))

db.commit()
yonetici_id = yonetici.id

duyurular = [
    ("Üyelik Aidatları Güncellendi", "Aylık aidat tutarı 500 TL olarak belirlenmiştir. Aidatlar her ayın sonuna kadar yatırılabilir.", "Genel"),
    ("Gençlik Bursu Başvuruları Başladı", "Üniversite okuyan köyümüz gençleri için burs başvuruları açılmıştır. Başvuru için dernek ofisine uğrayabilirsiniz.", "Eğitim"),
    ("Kurban Bayramı Yardım Organizasyonu", "İhtiyaç sahibi aileler için kurban payı toplama organizasyonumuz başlamıştır.", "Hayır"),
    ("Köy Kütüphanesi Açıldı", "Gençlerimiz için kurduğumuz köy kütüphanesi cumartesi günleri 14:00-18:00 saatleri arasında hizmet verecektir.", "Kültür"),
]
for baslik, icerik, kategori in duyurular:
    db.add(models.Duyuru(baslik=baslik, icerik=icerik, kategori=kategori, yazar_id=yonetici_id))

etkinlikler = [
    ("Geleneksel Yayla Şenliği", "Her yıl temmuz ayında düzenlenen şenliğimizde yöresel müzik, halay ve köy kebapçısının özel menüsü olacaktır.", datetime.datetime(2027, 7, 18, 10, 0), "Yayla Mevkii", 200),
    ("Hasat Etkinliği", "Köyümüzde birlikte buğday hasadı yapıyor, sonrasında çekirdek kavurma eşliğinde sohbet ediyoruz.", datetime.datetime(2027, 6, 5, 9, 0), "Tarım Bölgesi", 100),
    ("Unutulmayan Kadınlar Kültür Gecesi", "Kuzu çevirme ve yöresel tatlar eşliğinde kadınlarımızın el emeği ürünleri sergilenecektir.", datetime.datetime(2027, 3, 21, 19, 0), "Köy Konağı", 120),
    ("Köy Tanıtım Gecesi", "Yurt dışında yaşayan hemşehrilerimizle buluşup ortak projeleri konuşacağız.", datetime.datetime(2027, 9, 2, 20, 0), "Dernek Merkezi", 80),
]
for baslik, aciklama, tarih, yer, kontenjan in etkinlikler:
    db.add(models.Etkinlik(baslik=baslik, aciklama=aciklama, tarih=tarih, yer=yer, kontenjan=kontenjan, duzenleyen_id=yonetici_id))

galeri = [
    ("Sonbahar Şenliği", "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", "Köy meydanında düzenlenen geleneksel sonbahar şenliği"),
    ("Hasat Zamanı", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "Buğday hasadında bir araya gelen köylülerimiz"),
    ("Köy Kahvesi", "https://images.unsplash.com/photo-1508278683621-3cfadd3c3d92?w=800&q=80", "Uzun yıllardır ayakta olan tarihi köy kahvemiz"),
    ("Cami Restorasyonu", "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80", "Yeni restore edilen köy camimizin açılışı"),
    ("Kültür Gecesi", "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80", "Düzenli olarak gerçekleştirdiğimiz kültür geceleri"),
    ("Gençlik Bursu", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", "Üniversite öğrencilerimize vermekte olduğumuz burs programı"),
    ("Köy Kütüphanesi", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80", "Gençlerimiz için kurduğumuz köy kütüphanesi"),
    ("El Sanatları", "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=800&q=80", "Kadınlarımızın el emeği göz nuru ürünleri"),
]
for baslik, url, aciklama in galeri:
    db.add(models.Galeri(baslik=baslik, resim_url=url, aciklama=aciklama))

videolar = [
    ("Yayla Şenliği 2026", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", "Köyümüzün geleneksel yayla şenliğinden görüntüler", "Etkinlik"),
    ("Köy Tanıtım Filmi", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", "Köyümüzün tarihi ve doğal güzelliklerini anlatan tanıtım filmi", "Tanıtım"),
    ("Hasat Zamanı", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", "Buğday hasadında birlikte çalışan köylülerimiz", "Günlük Yaşam"),
]
for baslik, url, aciklama, kategori in videolar:
    db.add(models.Video(baslik=baslik, video_url=url, aciklama=aciklama, kategori=kategori))

db.commit()
varsayilan_ayarlar.varsayilan_ayarlari_doldur(db)
print("Demo verileri eklendi.")
db.close()