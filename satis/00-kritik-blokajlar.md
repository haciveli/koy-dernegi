# Satış Öncesi Kritik Blokajlar (Özet)

Bunlar çözülmeden **satış yapılmamalı**. Müşteri verisiyle ilgili olduğu için iş ve itibar riski.

## 1. Kalıcı sunucu (ZORUNLU — en kritik)
- **Durum:** Uygulama şu an Render free'de; her deploy/restart'ta `koydernegi.db` silinir (seed.py). Müşteriye ait aidat/üye verisi kaybolur.
- **Çözüm:** VPS (1 vCPU/2GB Ubuntu) + hazır `deploy/` paketi (Docker + nginx + SSL). ~300-500 TL/ay.
- **Doğrulama:** Mayısta genel "restart sonrası veri kalır" testi; `seed.py`'yi yalnızca DB yoksa çalışacak şekilde düzenle.

## 2. Kalıcı veri + yedek
- Volume'lı veri; haftalık `yedekle.sh` + sunucu dışı kopya; aylık geri yükleme provası.
- `backend/uploads/` da volume'da kalmalı (galeri/video dosyaları).

## 3. APK build → üretim adresi
- APK., `extra.apiUrl` değeri şu an TEST adresine bakıyor. Satışta domaine ayarlanır.
- `key.jks` imza anahtarı güvenli saklanır (kaybolursa uygulama güncellenemez).

## 4. Rol/teslim modeli netleştirme
- Kod size mi ait, müşteriye mi? Öneri: **kullanım hakkı** (yazılım sizin) → kaynak kod karşıya verilmez, bakım ücretli devam eder.
- Sözleşmede açık yazılmalı.

## 5. iOS / Play Store
- Şu an yok. Teklife "kapsam dışı" notu düşüldü. Müşteri isterse ayrı iş.

## 6. Sunucu/alan adı ücretleri
- Müşteri üstlenir; teklifte açıkça yazar (dernek adına alınır ki veriler sizin değil, derneğin).

---

### Önerilen sıra
1. VPS + alan adı al, `deploy/` ile kur, kalıcılığı doğrula (yarım gün)
2. APK'yı üretim adresine bağla
3. Teklifi sun
4. Sözleşme imzalat
5. Kurulum + eğitim + kabul testi
6. Aylık bakım döngüsü (yedek, SSL, hata)