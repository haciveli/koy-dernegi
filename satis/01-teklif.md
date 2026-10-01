# Köy Derneği Dijital Üyelik Sistemi — Teklif

**Hazırlayan:** Hacıveli (Köy Umegönlü Derneği)
**Tarih:** Eylül 2026
**Amaç:** Derneğin üyelik, aidat, duyuru ve iletişim işlerini tek uygulamada dijitalleştirmek.

---

## 1. Sorun neyi çözüyor?

Dernek yönetimlerinin en çok zaman harcadığı işler kağıtta ve mesaj takibiyle yürür:

- Aidat kim ödedi, kim ödemedi → eksik listeler, yanlış hatırlatmalar
- Üye kayıtları karışık → WhatsApp gruplarında kayboluyor
- Duyurular herkese ulaşmıyor, kim okudu belli değil
- Bağış ve aidat hareketleri şeffaf değil, yönetim hesap veremiyor
- Üyeler birbirine ulaşmakta zorlanıyor, derneğin gündemi bölünüyor

Bu sistem bunların tamamını tek yerde, cep telefonundan çözer.

---

## 2. Sistemin özellikleri

### Üyelik ve Yönetim
- Üye kaydı (ad, soyad, telefon, e-posta, köy bilgisi) ve yönetici onayı
- Üye roller: Yönetici / Üye; onaylı üye, bekleyen üye ayrımı
- Yönetim panelinden üye listesi, düzenleme, silme, onaylama/red

### Aidat ve Bağış
- Yıllık aidat tutarı (örn. 500 TL) tek yerden yönetilebilir
- Üye, "Aidatımı ödedim" diye bildirir → yönetici onaylar → "Ödendi" olur
- Havale/EFT bilgileri (IBAN, banka, açıklama) uygulama içinde gösterilir
- Bağış bildirimi de aynı akışla toplanır

### Duyuru, Etkinlik ve Organizasyon
- Duyurular (tüm üyelere bildirim gönderir)
- Etkinlikler + katılım bildirimi
- Toplantılar + gündem + üye oylamaları (oy sayımı otomatik)
- Köy rehberi (muhtar, esnaf, servisler...), ilan panosu
- Galeri (fotoğraf) ve videolar

### İletişim ve Bildirim
- **Sohbet:** genel sohbet + üye-üye birebir mesaj; yeni mesaj geldiğinde push bildirimi
- **Push bildirim:** yeni duyuru, etkinlik, aidat onayı, mesaj — telefon kapalıyken bile gelir
- Kullanıcı hangi konularda bildirim alacağını kendi açar/kapatır
- İletişim formu → yönetime iletilir

### Teknik
- Web yönetim paneli (yönetici için, bilgisayardan da çalışır)
- Android uygulaması (APK olarak kurulur)
- Veri tek merkezde, yedekli ve şifreli kullanıcı hesaplarıyla korunur

---

## 3. Altyapı ve teslim

- Sistem, derneğin kendi adına alınan **alan adı** (örn. `koyumegonul.org`) üzerinde çalışır
- Veri **kalıcı sunucuda** tutulur (test ortamındaki sıfırlanma sorunu üretimde yoktur)
- Teslimat:
  1. Kurulum + alan adı + SSL sertifikası (https)
  2. Yönetim paneli eğitimi (1 oturum, ortalama 45 dk)
  3. Üyelere kurulum ve tanıtım metni
  4. Android APK teslimi + kurulum desteği
  5. Veri yedeği politikası (aylık otomatik yedek)

---

## 4. Paket ve fiyat seçenekleri

| Paket | İçerik | Fiyat |
|-------|--------|-------|
| **Kurulum** | Kurulum + eğitim + ilk 30 gün destek | ~~__12.500 TL__~~ **9.500 TL** |
| **Bakım (aylık)** | Sunucu, yerinde veri yedeği, SSL yenileme, kritik hata düzeltme + telefon destek | **1.000 TL/ay** |
| **Yıllık bakım** (indirimli) | Aylık paketin 12 ayı peşin | **10.000 TL/yıl** |

*Fiyatlar; üye sayısı ve ek geliştirme istekleriyle değişebilir. KDV ayrıca eklenir.*

---

## 5. Ne kapsanmaz (önemli)

- Play Store yayınlama (dernek hesabı açarsa ek ücretle yapılır — yıllık ~100 USD Google ücreti derneğe aittir)
- iOS uygulaması (dernek Apple hesabı + Apple Developer üyeliği ister; talep edilirse ayrı teklif)
- Özel geliştirme istekleri (banka sanal POS, resmi SMS, koca ölçekli özel rapor) → ayrı teklif
- Sunucu ve alan adı ücretleri derneğe aittir (yıllık ~1.500-3.000 TL arası)

---

## 6. İletişim

- E-posta: ___
- Telefon: ___
- Referans / deneme: sistem web...

*Bu teklif 30 gün geçerlidir.*