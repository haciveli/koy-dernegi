# Köy Derneği Web Portalı

Köy derneği için kültür, dayanışma ve eğitim faaliyetlerini tanıtan modern bir web portalı.

## Özellikler

- Ana sayfa (duyuru ve etkinlik özetleri)
- Hakkımızda sayfası (değerler, misyon, yönetim kurulu)
- Etkinlikler (liste, kayıt, kontenjan takibi)
- Duyurular (kategori filtreli)
- Fotoğraf galerisi (lightbox görünümü)
- İletişim formu
- Üyelik sistemi (kayıt / giriş, token tabanlı)
- Yönetim paneli (duyuru, etkinlik, galeri, üye ve mesaj yönetimi)

## Teknolojiler

- **Backend:** Python FastAPI + SQLAlchemy + SQLite
- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Kimlik doğrulama:** JWT (python-jose) + bcrypt şifre hash

## Kurulum

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API adresi: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Web adresi: http://localhost:5173

## Yapı

```
backend/
  main.py        # FastAPI uygulaması ve tüm API rotaları
  models.py      # SQLAlchemy veritabanı modelleri
  schemas.py     # Pydantic doğrulama modelleri
  database.py    # Veritabanı bağlantısı (SQLite)
  security.py    # JWT token ve şifre işlemleri

frontend/
  src/
    App.jsx
    components/  # Navbar ve Footer
    pages/       # AnaSayfa, Hakkimizda, Etkinlikler, Duyurular, Galeri, Iletisim, Uyelik, YonetimPaneli

mobile/
  src/
    api.js                  # Backend REST çağrıları (token otomatik eklenir)
    config.js               # API adresi (expo start ekranında ayarlanır)
    context/AuthContext.js  # JWT token + üye bilgisi (AsyncStorage)
    navigation/             # Alt sekmeler + sayfa akışı
    screens/                # AnaSayfa, Duyurular, Etkinlikler, Galeri, Videolar, Sohbet, Profil...
```

## Mobil Uygulama (Android + iOS — Expo / React Native)

`mobile/` klasörü Expo (React Native) ile tek kod tabanından hem Android hem iOS için
aynı uygulamayı üretir; mevcut FastAPI backend'ine bağlanır.

```bash
cd mobile
npm install                 # Bağımlılıkları kur
npx expo start              # Metro'yu başlat
# Telefonunuza Expo Go kurup QR kodu okutun (veya: a | i tuşlarıyla simülatör)
```

- API adresi `mobile/src/config.js` içindeki `API_URL` sabitinden okunur; cihazda
  sınayacaksanız bilgisayarınızın LAN IP adresini (örn. `http://192.168.1.20:8000`)
  ve CORS'u ayarlayın.
- Üye sohbeti ve profil arayüzleri backend'deki aynı JWT oturumunu kullanır;
  üyeliği onaylı olmayanlar yalnızca duyuru/etkinlik galerisini görür.

Android APK: `cd mobile && npx expo run:android`
iOS: `cd mobile && npx expo run:ios`