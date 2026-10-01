# Teknik Teslim Planı (İç Doküman — müşteriye gösterilmez)

Bu plan, teklifi kabul eden bir derneğe sistemi **üretim kalitesinde** teslim etmek için
takip edilecek adımları içerir. Kalıcı veri, SSL, yedek ve APK üretimi burada kurulur.

---

## 0. Satış öncesi zorunlu hazırlık (ŞİMDİ yapılmalı)

> ⚠️ **Kritik blokaj:** Mevcut canlı ortam (Render free) her deploy'da veriyi sıfırlıyor
> (seed.py DB'yi siler). **Müşteriye bu test ortamı gösterilemez, satılamaz.**
> Müşteri verisi kaybedilirse itibar + olası hukuki sorun. Satış ancak VPS + kalıcı disk ile
> yapılabilir.

- [ ] **VPS alın** (öneri: 1 vCPU / 2 GB RAM, Ubuntu 24.04) — ~300-500 TL/ay
- [ ] **Alan adı** (kendi adına) — DNS A kaydı sunucu IP'sine
- [ ] VPS'te 80/443 portları açık, SSH erişimi hazır
- [ ] `deploy/` kurulumu sunucuda test edilip **kalıcı DB doğrulandı** (restart'ta veri kalmıyor durumda olmalı)
- [ ] APK'nın `extra.apiUrl` değeri → yeni domaine ayarlanıp test edildi

---

## 1. Sunucuya kurulum

Pakette hazır (bkz. `deploy/README.md`):

```bash
# sunucuda /root altında:
tar -xzf koy-dernegi-sunucu.tar.gz
cp koy-dernegi-data.tar.gz ./
cd deploy && sudo bash kur.sh dernekadi.com
```

Önceden hazır olanlar:
- `Dockerfile` (backend + frontend tek image, uvicorn)
- `docker-compose.yml`, `nginx.conf`, `nginx-ssl.conf`
- `kur.sh` (ilk kurulum + otomatik Let's Encrypt SSL)
- `yedekle.sh` (veri + uploads arşivi)

---

## 2. Veri (kalıcılık doğrulaması)

- `koydernegi.db` ve `uploads/` **volume'da** tutulmalı → restart/silinemez
- `seed.py` **yalnızca ilk kurulumda** (DB yoksa) çalışmalı
- Test: `docker compose restart backend` → `kayıt sayısı korunsun` doğrula
- Yedek: `yedekle.sh` haftalık cron'a bağlanır, arşiv sunucu dışına da kopyalanır (ör. kendi bilgisayarına)

---

## 3. Alan adı + SSL

- `kur.sh dernekadi.com` → DNS A kaydı → nginx vhost + Let's Encrypt otomatik
- Doğrula: `https://dernekadi.com` açılır, `https://dernekadi.com/yonetim` panel gelir

---

## 4. Mobil APK üretimi ve teslimat

1. `mobile/app.json` → `expo.extra.apiUrl = "https://dernekadi.com"`
2. `mobile/src/config.js` varsayılan URL'ini de güncelle
3. Release build (FCM + google-services.json ile — mevcut kurulum hazır):
   ```
   ./gradlew :app:assembleRelease
   ```
4. APK üyesi bir cihaza kur + bildirim testi (duyuru/test bildirimi)
5. APK dosyasını (ör. `degneticilik-v1.apk`) derneğe teslim et

> Not: Play Store yerleştirme isterse Google hesabı dernek adına açılır;
> aAB APK `key.jks` dosyasının yedeği düzenli saklanmalı (kaybolursa güncelleme yayınlanamaz).

---

## 5. Kabul testi (kurulum sonrası, dernekle birlikte)

Sıran dernek bağlamında birlikte denenecekler:
- [ ] Yönetici girişi, üye ekleme/onaylama
- [ ] Bir üye aidat bildirimi → yönetici onayı → "Ödendi"
- [ ] Duyuru yayınla → üye telefonuna push bildirimi
- [ ] Genel sohbet + birebir mesaj
- [ ] Etkinlik aç + katılım bildirimi
- [ ] Üye kurulumu (APK kurulumu + giriş) 2-3 telefonla

---

## 6. Devir / sözleşme

- Teslim tutanağı imzalanır (kabul testi listesi ekinde)
- Yönetici hesap bilgileri (alan adı paneli, sunucu root, e-posta) derneğe ait olur
- Kaynak kod: teklifte "kod dernekte mi, geliştiricide mi?" netleştirilmeli →
  bu teklifte **kod geliştiricide kalır, kullanım hakkı derneğe verilir** (SaaS tarzı)

---

## 7. Riskler / notlar

- **SQLite:** tek sunucu için yeterli; binlerce eşzamanlı kullanıcı beklentisi varsa
  PostgreSQL (backend henüz adapte değil — ayrı iş)
- **iOS:** şu an yok (Apple + mağaza gereksinimleri) → dokümanda belirtilir
- **SMS:** resmi SMS hatları dernek sağlarsa ayrı teklif
- Yedek testi: en az ayda bir, yedekten geri yükleme denemesi önerilir