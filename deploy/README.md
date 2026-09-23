# Köy Derneği — Sunucu Kurulum Rehberi

Bu paket (`koy-dernegi-sunucu.tar.gz`) uygulamayı bir Linux VPS'e taşır:
backend (API + web paneli tek uvicorn) + nginx + Let's Encrypt SSL.
Paket, build için gereken tüm kodu içerir: `backend/`, `frontend/dist/`, `deploy/`.

## Gereksinimler
- Ubuntu 22.04 veya 24.04 VPS (minimum 1 vCPU / 2 GB RAM)
- Alan adı (ör. `koyumegonul.org`) — DNS'te sunucu IP'sine yönlendirilmiş
- Sunucuda 80 ve 443 portları açık
- SSH erişimi (Türkiye sağlayıcılarının çoğu web panelinde SSH Terminal verir; talep et)

## Adımlar

1. VPS'i al, alan adını sunucu IP'sine bağla (DNS A kaydı).

2. Sunucuya taşı (SSH/SCP veya sağlayıcının dosya yöneticisi):
   - `koy-dernegi-sunucu.tar.gz`  ← tüm uygulama kodu + deployment
   - `koy-dernegi-data.tar.gz`    ← mevcut veri (DB + uploads)
   İkisini de aynı klasöre at (ör. `/root/`).

3. Aç ve kur:
   ```bash
   cd /root
   tar -xzf koy-dernegi-sunucu.tar.gz      # backend/ + frontend/ + deploy/ çıkar
   cp koy-dernegi-data.tar.gz ./           # veri arşivini paket köküne al
   cd deploy
   sudo bash kur.sh koyumegonul.org
   ```
   - İlk SSL sertifikası otomatik alınır.
   - Veri (koydernegi.db + uploads) otomatik konteynere kopyalanıp backend yeniden başlatılır.
   - Site https://alanadi.com adresinde hazır olur.

4. Mobil uygulamayı yeni adrese yönlendir:
   - `mobile/app.json` içinde `extra.apiUrl` alanını `https://alanadi.com` yap
   - `mobile/src/config.js` varsayılanını da aynı adrese güncelle
   - Yeni APK build et (şu ana kadarki APK'lar yerel IP'ye işaret ediyor)

## Sık kullanılan komutlar (sunucuda `deploy/` içinden `sudo bash kur.sh ...` sonrası)
```bash
# Güncel durum / restart
sudo docker compose -f ../deploy/docker-compose.yml ps
sudo docker compose -f ../deploy/docker-compose.yml restart backend

# Yeni kod geldiğinde yeniden build
sudo docker compose -f ../deploy/docker-compose.yml up -d --build backend

# Yedek al
cd /root && tar -czf yedek-$(date +%F).tar.gz koy-dernegi-data  # bkz. yedekle.sh
```

## Sertifika yenileme (90 günde bir)
Otomatik döngü kurulmadı (güvenlik için). Yenilemek için `deploy/` içinden:
```bash
sudo docker compose -f ../deploy/docker-compose.yml run --rm certbot renew
sudo docker compose -f ../deploy/docker-compose.yml restart nginx
```

---

## BONUS: Ücretsiz test ortamı — Render.com (resmi sunucuyu almadan)

Uygulamayı bedava test etmek istiyorsan Render'ın ücretsiz planında
dakikalar içinde ayaklandırabiliriz. Neler olur / kısıtlar:
- Kalıcı disk YOK: her restart'ta veri sıfırlanır (seed.py otomatik
  demo veri + admin `ahmet@koyumegonul.org` / `admin123` kurar).
  Test için aslında bir avantaj: veri hep temiz.
- 15 dk kullanılmazsa uyur, ortalama 30-60 sn uyanır.
- HTTPS otomatik: `https://koy-dernegi-test.onrender.com` gibi.
- Web paneli + API tam çalışır; mobil APK değil ama tarayıcıdan test edilir.
- Docker değil, Render'ın Python runtime'ı kullanılır (`deploy/render.yaml`).

### Kurulum adımları
1. Bu projeyi GitHub'a it (public repo). Örn. `koyumegonul/koy-dernegi`.
2. render.com → Sign up (GitHub ile) → New → Blueprint.
3. Repoyu seç → kökteki `render.yaml` otomatik algılanır → Apply.
4. Build + deploy biter: giriş `https://<adi>.onrender.com/yonetim`.

Değişiklik yapınca GitHub'a push → otomatik redeploy.

### Dosyalar nasıl paketlenir / itilir
```bash
cd "/Users/ademce/Documents/Default Project"
git init && git add backend frontend deploy && git commit -m "initial"
gh repo create koyumegonul/koy-dernegi --public --source=. --push
```
> Not: `backend/koydernegi.db` (lokal veri) ve `backend/venv` commitle KALDIRILMALI
> → bir `.gitignore` ile: `backend/*.db`, `backend/uploads/`, `backend/venv/`.

## Not / Kısıtlar
- SQLite tek makinaya göre tasarlandı; aynı anda binlerce ziyaretçi beklenirse PostgreSQL'e geçiş gerekir (backend henüz hazır değil).
- EAS push bildirimleri sunucudan bağımsızdır, her yerde çalışır.