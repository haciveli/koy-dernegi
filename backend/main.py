from fastapi import FastAPI, Depends, HTTPException, status, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, or_, and_
from typing import List
import os, uuid, shutil, json, time
from datetime import date, datetime, timedelta
from urllib import request as url_istek
import models, schemas, security
from database import SessionLocal, engine, Base
import varsayilan_ayarlar

Base.metadata.create_all(bind=engine)


def eksik_kolonlari_ekle():
    with engine.connect() as conn:
        kolonlar = [satir[1] for satir in conn.execute(text("PRAGMA table_info(kullanicilar)")).fetchall()]
        if "durum" not in kolonlar:
            conn.execute(text("ALTER TABLE kullanicilar ADD COLUMN durum VARCHAR DEFAULT 'onayli'"))
            conn.commit()
        if "token_surumu" not in kolonlar:
            conn.execute(text("ALTER TABLE kullanicilar ADD COLUMN token_surumu INTEGER DEFAULT 1"))
            conn.commit()


eksik_kolonlari_ekle()

app = FastAPI(title="Köy Derneği Web Portalı API", description="Köy derneği web portalı için arka uç hizmetleri", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_KLASOR = os.environ.get("UPLOAD_KLASOR", os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_KLASOR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_KLASOR), name="uploads")


@app.on_event("startup")
def baslangic():
    db = SessionLocal()
    try:
        varsayilan_ayarlar.varsayilan_ayarlari_doldur(db)
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def kullanici_getir(db: Session, token: dict) -> models.Kullanici:
    kullanici_id = token.get("user_id")
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == kullanici_id).first()
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return kullanici


def guncelle(db: Session, kayit, veri: dict):
    for alan, deger in veri.items():
        if deger is not None:
            setattr(kayit, alan, deger)
    db.commit()
    db.refresh(kayit)
    return kayit


def _kullanici_surum_kontrol(kullanici: models.Kullanici, veri: dict):
    if kullanici.token_surumu is None:
        kullanici.token_surumu = 1
        return
    if veri.get("surum", 1) != kullanici.token_surumu:
        raise HTTPException(status_code=401, detail="Oturum geçersiz, lütfen tekrar giriş yapın")


def guncel_kullanici(db: Session = Depends(get_db), authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    veri = security.token_dogrula(
        authorization[7:],
        HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş oturum"),
    )
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == veri["user_id"]).first()
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    _kullanici_surum_kontrol(kullanici, veri)
    if kullanici.durum != "onayli":
        raise HTTPException(status_code=403, detail="Üyeliğiniz aktif değil")
    return kullanici


def guncel_yonetici(kullanici: models.Kullanici = Depends(guncel_kullanici)) -> models.Kullanici:
    if kullanici.rol != "yonetici":
        raise HTTPException(status_code=403, detail="Bu işlem için yönetici yetkiniz gerekiyor")
    return kullanici


def guncel_kullanici_opsiyonel(
    db: Session = Depends(get_db),
    authorization: str = Header(default=""),
):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        veri = security.token_dogrula(
            authorization[7:],
            HTTPException(status_code=401, detail="Geçersiz oturum"),
        )
    except HTTPException:
        return None
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == veri["user_id"]).first()
    if kullanici is None:
        return None
    try:
        _kullanici_surum_kontrol(kullanici, veri)
    except HTTPException:
        return None
    return kullanici


@app.post("/api/yukle", status_code=201)
def dosya_yukle(dosya: UploadFile = File(...), _: models.Kullanici = Depends(guncel_yonetici)):
    orijinal = dosya.filename or "dosya"
    uzanti = os.path.splitext(orijinal)[1].lower().lstrip(".")
    if not uzanti:
        uzanti = "bin"
    ad = f"{uuid.uuid4().hex}.{uzanti}"
    yol = os.path.join(UPLOAD_KLASOR, ad)
    try:
        with open(yol, "wb") as hedef:
            shutil.copyfileobj(dosya.file, hedef)
    finally:
        dosya.file.close()
    return {"url": f"/uploads/{ad}", "dosya_adi": ad}


@app.get("/")
def ana():
    frontend_klasor = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    if os.path.isdir(frontend_klasor) and os.path.isfile(os.path.join(frontend_klasor, "index.html")):
        return FileResponse(os.path.join(frontend_klasor, "index.html"))
    return {"mesaj": "Köy Derneği Web Portalı API'ye hoş geldiniz"}


@app.post("/api/kayit", status_code=201)
def kullanici_kayit(kullanici: schemas.KullaniciCreate, db: Session = Depends(get_db)):
    mevcut = db.query(models.Kullanici).filter(models.Kullanici.email == kullanici.email).first()
    if mevcut:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")

    sifre_hash = security.sifre_hash_olustur(kullanici.sifre)
    yeni_kullanici = models.Kullanici(
        ad=kullanici.ad,
        soyad=kullanici.soyad,
        email=kullanici.email,
        telefon=kullanici.telefon,
        koy=kullanici.koy,
        rol="uye",
        durum="beklemede",
        sifre_hash=sifre_hash
    )
    db.add(yeni_kullanici)
    db.commit()
    db.refresh(yeni_kullanici)
    return {
        "mesaj": "Üyelik başvurunuz alındı. Hesabınız yönetici onayı ile aktifleşecektir.",
        "durum": "beklemede",
    }


@app.post("/api/giris", response_model=schemas.TokenResponse)
def kullanici_giris(veri: schemas.KullaniciLogin, db: Session = Depends(get_db)):
    email_normal = (veri.email or "").strip().lower()
    simdi = datetime.utcnow()

    deneme = db.query(models.GirisDeneme).filter(models.GirisDeneme.email == email_normal).first()
    if deneme and deneme.kilitli_ta:
        kalan = (deneme.kilitli_ta - simdi).total_seconds()
        if kalan > 0:
            dakika = int(kalan // 60) + 1
            raise HTTPException(status_code=429, detail=f"Çok fazla hatalı deneme. Hesap {dakika} dakika kilitli.")
        deneme.kilitli_ta = None
        deneme.basarisiz_sayi = 0
        db.commit()

    kullanici = db.query(models.Kullanici).filter(models.Kullanici.email == email_normal).first()
    if not kullanici or not security.sifre_dogrula(veri.sifre, kullanici.sifre_hash):
        if not deneme:
            deneme = models.GirisDeneme(email=email_normal, basarisiz_sayi=1)
            db.add(deneme)
        else:
            deneme.basarisiz_sayi = (deneme.basarisiz_sayi or 0) + 1
        if deneme.basarisiz_sayi >= 5:
            deneme.kilitli_ta = simdi + timedelta(minutes=15)
            deneme.basarisiz_sayi = 0
            db.commit()
            raise HTTPException(status_code=429, detail="Çok fazla hatalı deneme. Hesap 15 dakika kilitli.")
        db.commit()
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")

    if kullanici.durum == "beklemede":
        raise HTTPException(status_code=403, detail="Üyeliğiniz henüz yönetici onayı bekliyor")
    if kullanici.durum == "reddedildi":
        raise HTTPException(status_code=403, detail="Üyelik başvurunuz reddedilmiştir")

    if deneme:
        deneme.basarisiz_sayi = 0
        deneme.kilitli_ta = None
        db.commit()

    token = security.token_olustur({"sub": str(kullanici.id)}, surum=kullanici.token_surumu or 1)
    return {"access_token": token}


@app.get("/api/kullanici", response_model=schemas.KullaniciResponse)
def kullanici_bilgi(kullanici: models.Kullanici = Depends(guncel_kullanici)):
    return kullanici


@app.put("/api/kullanici/sifre")
def sifre_degistir(
    veri: schemas.SifreDegistir,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    if not security.sifre_dogrula(veri.mevcut_sifre, kullanici.sifre_hash):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    if len(veri.yeni_sifre) < 6:
        raise HTTPException(status_code=400, detail="Yeni şifre en az 6 karakter olmalı")
    kullanici.sifre_hash = security.sifre_hash_olustur(veri.yeni_sifre)
    kullanici.token_surumu = (kullanici.token_surumu or 1) + 1
    db.commit()
    return {"mesaj": "Şifreniz değiştirildi. Tüm oturumlar kapatıldı, lütfen tekrar giriş yapın"}


# ---- Push bildirim altyapısı ----

def _expo_push_gonder(token_listesi: List[str], baslik: str, mesaj: str, veri: dict = None):
    if not token_listesi:
        return
    govde = json.dumps(
        [
            {
                "to": t,
                "title": baslik,
                "body": mesaj,
                "sound": "default",
                "data": veri or {},
            }
            for t in token_listesi
        ],
        ensure_ascii=False,
    ).encode("utf-8")
    ist = url_istek.Request(
        "https://exp.host/--/api/v2/push/send",
        data=govde,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        url_istek.urlopen(ist, timeout=8)
    except Exception:
        pass


# Bildirim türleri: kullanıcılar bu türler için tercihlerini açıp kapatabilir.
BILDIRIM_TURLERI = ["duyuru", "etkinlik", "toplanti", "oylama", "aidat", "bagis", "mesaj"]


def _tercih_kapali_kullanicilar(db: Session, tur: str):
    kapali_ids = (
        db.query(models.BildirimTercihi.kullanici_id)
        .filter(models.BildirimTercihi.tur == tur, models.BildirimTercihi.aktif == False)
        .all()
    )
    return {k[0] for k in kapali_ids}


def bildirim_gonder(db: Session, baslik: str, mesaj: str, kullanici_id: int = None, veri: dict = None, tur: str = None, gonderen_haric_id: int = None):
    sorgu = db.query(models.Cihaz.expo_token)
    if kullanici_id is not None:
        sorgu = sorgu.filter(models.Cihaz.kullanici_id == kullanici_id)
    if gonderen_haric_id is not None:
        sorgu = sorgu.filter(models.Cihaz.kullanici_id != gonderen_haric_id)
    if tur in BILDIRIM_TURLERI:
        kapali = _tercih_kapali_kullanicilar(db, tur)
        if kapali:
            if kullanici_id is not None:
                if kullanici_id in kapali:
                    return
            else:
                sorgu = sorgu.filter(models.Cihaz.kullanici_id.notin_(kapali))
    tokenler = [t[0] for t in sorgu.all() if t[0]]
    _expo_push_gonder(tokenler, baslik, mesaj, veri)


@app.get("/api/bildirim-tercihleri")
def bildirim_tercihleri_getir(
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    kayitlar = db.query(models.BildirimTercihi).filter(
        models.BildirimTercihi.kullanici_id == kullanici.id
    ).all()
    tercih = {tur: True for tur in BILDIRIM_TURLERI}
    for kayit in kayitlar:
        if kayit.tur in tercih:
            tercih[kayit.tur] = bool(kayit.aktif)
    return {"tercihler": tercih}


@app.put("/api/bildirim-tercihleri")
def bildirim_tercihleri_guncelle(
    veri: schemas.BildirimTercihGuncelle,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    veri_dict = veri.model_dump(exclude_none=True)
    for tur, aktif in veri_dict.items():
        if tur not in BILDIRIM_TURLERI:
            continue
        kayit = (
            db.query(models.BildirimTercihi)
            .filter(
                models.BildirimTercihi.kullanici_id == kullanici.id,
                models.BildirimTercihi.tur == tur,
            )
            .first()
        )
        if kayit:
            kayit.aktif = aktif
        else:
            db.add(models.BildirimTercihi(kullanici_id=kullanici.id, tur=tur, aktif=aktif))
    db.commit()
    return {"mesaj": "Bildirim tercihleri güncellendi"}


@app.post("/api/cihaz", status_code=201)
def cihaz_kaydet(
    veri: schemas.CihazKayit,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    token = (veri.expo_token or "").strip()
    if not token.startswith("ExponentPushToken[") and not token.startswith("ExpoPushToken["):
        raise HTTPException(status_code=400, detail="Geçersiz Expo push token")
    mevcut = db.query(models.Cihaz).filter(models.Cihaz.expo_token == token).first()
    if mevcut:
        mevcut.kullanici_id = kullanici.id
        mevcut.platform = veri.platform
    else:
        db.add(models.Cihaz(kullanici_id=kullanici.id, expo_token=token, platform=veri.platform))
    db.commit()
    return {"mesaj": "Cihaz kaydedildi"}


@app.delete("/api/cihaz", status_code=204)
def cihaz_kaldir(
    veri: schemas.CihazKayit,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    db.query(models.Cihaz).filter(
        models.Cihaz.expo_token == (veri.expo_token or "").strip(),
        models.Cihaz.kullanici_id == kullanici.id,
    ).delete()
    db.commit()
    return None


@app.get("/api/debug/cihazlar")
def debug_cihazlar(_: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db)):
    cihazlar = db.query(models.Cihaz).all()
    return {
        "adet": len(cihazlar),
        "cihazlar": [
            {
                "id": c.id,
                "kullanici_id": c.kullanici_id,
                "token": c.expo_token[:40] + "..." if c.expo_token else None,
                "platform": c.platform,
            }
            for c in cihazlar
        ],
    }


@app.post("/api/debug/bildirim-test")
def debug_bildirim_test(
    baslik: str = "Test Bildirimi", mesaj: str = "Bildirim kanali testi",
    _: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db),
):
    cihazlar = db.query(models.Cihaz).all()
    tokenler = [c.expo_token for c in cihazlar if c.expo_token]
    if not tokenler:
        return {"durum": "cihaz-yok", "mesaj": "Kayitli cihaz/token bulunamadi"}
    govde = json.dumps(
        [{"to": t, "title": baslik, "body": mesaj, "sound": "default"} for t in tokenler],
        ensure_ascii=False,
    ).encode("utf-8")
    ist = url_istek.Request(
        "https://exp.host/--/api/v2/push/send",
        data=govde,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        yanit = url_istek.urlopen(ist, timeout=15)
        govde_yanit = yanit.read().decode("utf-8", "replace")
        return {"durum": "gonderildi", "token_adet": len(tokenler), "expo_yanit": govde_yanit}
    except Exception as e:
        return {"durum": "hata", "hata": str(e)}


@app.get("/api/kullanicilar", response_model=List[schemas.KullaniciResponse])
def kullanicilar_liste(_: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db)):
    return db.query(models.Kullanici).all()


@app.get("/api/kullanicilar/{kullanici_id}", response_model=schemas.KullaniciResponse)
def kullanici_detay(kullanici_id: int, _: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db)):
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == kullanici_id).first()
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return kullanici


@app.put("/api/kullanicilar/{kullanici_id}", response_model=schemas.KullaniciResponse)
def kullanici_guncelle(
    kullanici_id: int,
    veri: schemas.KullaniciUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == kullanici_id).first()
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    eski_durum = kullanici.durum
    sonuc = guncelle(db, kullanici, veri.model_dump())
    if eski_durum != sonuc.durum:
        if sonuc.durum == "onayli":
            bildirim_gonder(db, "Üyeliğiniz onaylandı", "Köy Derneği üyeliğiniz artık aktif.",
                            kullanici_id=sonuc.id, veri={"ekran": "Profil"})
        elif sonuc.durum == "reddedildi":
            bildirim_gonder(db, "Üyelik başvurunuz", "Başvurunuz reddedildi.",
                            kullanici_id=sonuc.id, veri={"ekran": "Profil"})
    return sonuc


@app.delete("/api/kullanicilar/{kullanici_id}", status_code=204)
def kullanici_sil(
    kullanici_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == kullanici_id).first()
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    db.query(models.EtkinlikKayit).filter(models.EtkinlikKayit.kullanici_id == kullanici_id).delete()
    db.delete(kullanici)
    db.commit()
    return None


@app.get("/api/duyurular", response_model=List[schemas.DuyuruResponse])
def duyuru_liste(db: Session = Depends(get_db)):
    return db.query(models.Duyuru).order_by(models.Duyuru.olusturulma_tarihi.desc()).all()


@app.get("/api/duyurular/{duyuru_id}", response_model=schemas.DuyuruResponse)
def duyuru_detay(duyuru_id: int, db: Session = Depends(get_db)):
    duyuru = db.query(models.Duyuru).filter(models.Duyuru.id == duyuru_id).first()
    if duyuru is None:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    return duyuru


@app.post("/api/duyurular", response_model=schemas.DuyuruResponse, status_code=201)
def duyuru_olustur(
    duyuru: schemas.DuyuruCreate,
    yonetici: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    yeni_duyuru = models.Duyuru(**duyuru.model_dump(), yazar_id=yonetici.id)
    db.add(yeni_duyuru)
    db.commit()
    db.refresh(yeni_duyuru)
    bildirim_gonder(db, f"Yeni Duyuru: {yeni_duyuru.baslik}", yeni_duyuru.icerik[:120],
                    veri={"ekran": "Duyurular", "id": yeni_duyuru.id}, tur="duyuru")
    return yeni_duyuru


@app.put("/api/duyurular/{duyuru_id}", response_model=schemas.DuyuruResponse)
def duyuru_guncelle(
    duyuru_id: int,
    veri: schemas.DuyuruUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    duyuru = db.query(models.Duyuru).filter(models.Duyuru.id == duyuru_id).first()
    if duyuru is None:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    return guncelle(db, duyuru, veri.model_dump())


@app.delete("/api/duyurular/{duyuru_id}", status_code=204)
def duyuru_sil(
    duyuru_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    duyuru = db.query(models.Duyuru).filter(models.Duyuru.id == duyuru_id).first()
    if duyuru is None:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    db.delete(duyuru)
    db.commit()
    return None


@app.get("/api/etkinlikler", response_model=List[schemas.EtkinlikResponse])
def etkinlik_liste(db: Session = Depends(get_db)):
    etkinlikler = db.query(models.Etkinlik).order_by(models.Etkinlik.tarih).all()
    for etkinlik in etkinlikler:
        kayit_sayisi = db.query(models.EtkinlikKayit).filter(
            models.EtkinlikKayit.etkinlik_id == etkinlik.id
        ).count()
        etkinlik.kayitli = kayit_sayisi
    return etkinlikler


@app.get("/api/etkinlikler/{etkinlik_id}", response_model=schemas.EtkinlikResponse)
def etkinlik_detay(etkinlik_id: int, db: Session = Depends(get_db)):
    etkinlik = db.query(models.Etkinlik).filter(models.Etkinlik.id == etkinlik_id).first()
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    kayit_sayisi = db.query(models.EtkinlikKayit).filter(
        models.EtkinlikKayit.etkinlik_id == etkinlik_id
    ).count()
    etkinlik.kayitli = kayit_sayisi
    return etkinlik


@app.post("/api/etkinlikler", response_model=schemas.EtkinlikResponse, status_code=201)
def etkinlik_olustur(
    etkinlik: schemas.EtkinlikCreate,
    yonetici: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    yeni_etkinlik = models.Etkinlik(**etkinlik.model_dump(), duzenleyen_id=yonetici.id)
    db.add(yeni_etkinlik)
    db.commit()
    db.refresh(yeni_etkinlik)
    bildirim_gonder(db, f"Yeni Etkinlik: {yeni_etkinlik.baslik}", yeni_etkinlik.aciklama[:120],
                    veri={"ekran": "Etkinlikler", "id": yeni_etkinlik.id}, tur="etkinlik")
    return yeni_etkinlik


@app.put("/api/etkinlikler/{etkinlik_id}", response_model=schemas.EtkinlikResponse)
def etkinlik_guncelle(
    etkinlik_id: int,
    veri: schemas.EtkinlikUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    etkinlik = db.query(models.Etkinlik).filter(models.Etkinlik.id == etkinlik_id).first()
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return guncelle(db, etkinlik, veri.model_dump())


@app.delete("/api/etkinlikler/{etkinlik_id}", status_code=204)
def etkinlik_sil(
    etkinlik_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    etkinlik = db.query(models.Etkinlik).filter(models.Etkinlik.id == etkinlik_id).first()
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    db.query(models.EtkinlikKayit).filter(models.EtkinlikKayit.etkinlik_id == etkinlik_id).delete()
    db.delete(etkinlik)
    db.commit()
    return None


@app.post("/api/etkinlikler/{etkinlik_id}/kayit", status_code=200)
def etkinlige_kayit(
    etkinlik_id: int,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    etkinlik = db.query(models.Etkinlik).filter(models.Etkinlik.id == etkinlik_id).first()
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    mevcut = (
        db.query(models.EtkinlikKayit)
        .filter(
            models.EtkinlikKayit.etkinlik_id == etkinlik_id,
            models.EtkinlikKayit.kullanici_id == kullanici.id,
        )
        .first()
    )
    if mevcut:
        raise HTTPException(status_code=400, detail="Bu etkinliğe zaten kayıtlısınız")
    kayitli_sayisi = (
        db.query(models.EtkinlikKayit)
        .filter(models.EtkinlikKayit.etkinlik_id == etkinlik_id)
        .count()
    )
    if kayitli_sayisi >= etkinlik.kontenjan:
        raise HTTPException(status_code=400, detail="Etkinlik kontenjanı dolu")
    db.add(models.EtkinlikKayit(etkinlik_id=etkinlik_id, kullanici_id=kullanici.id))
    db.commit()
    return {"mesaj": "Kayıt başarılı"}


@app.get("/api/galeri", response_model=List[schemas.GaleriResponse])
def galeri_liste(db: Session = Depends(get_db)):
    return db.query(models.Galeri).all()


@app.post("/api/galeri", response_model=schemas.GaleriResponse, status_code=201)
def galeri_olustur(
    resim: schemas.GaleriCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    yeni_resim = models.Galeri(**resim.model_dump())
    db.add(yeni_resim)
    db.commit()
    db.refresh(yeni_resim)
    return yeni_resim


@app.put("/api/galeri/{galeri_id}", response_model=schemas.GaleriResponse)
def galeri_guncelle(
    galeri_id: int,
    veri: schemas.GaleriUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    resim = db.query(models.Galeri).filter(models.Galeri.id == galeri_id).first()
    if resim is None:
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")
    return guncelle(db, resim, veri.model_dump())


@app.delete("/api/galeri/{galeri_id}", status_code=204)
def galeri_sil(
    galeri_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    resim = db.query(models.Galeri).filter(models.Galeri.id == galeri_id).first()
    if resim is None:
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")
    db.delete(resim)
    db.commit()
    return None


@app.get("/api/videolar", response_model=List[schemas.VideoResponse])
def video_liste(db: Session = Depends(get_db)):
    return db.query(models.Video).order_by(models.Video.olusturulma_tarihi.desc()).all()


@app.post("/api/videolar", response_model=schemas.VideoResponse, status_code=201)
def video_olustur(
    video: schemas.VideoCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    yeni_video = models.Video(**video.model_dump())
    db.add(yeni_video)
    db.commit()
    db.refresh(yeni_video)
    return yeni_video


@app.put("/api/videolar/{video_id}", response_model=schemas.VideoResponse)
def video_guncelle(
    video_id: int,
    veri: schemas.VideoUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
    return guncelle(db, video, veri.model_dump())


@app.delete("/api/videolar/{video_id}", status_code=204)
def video_sil(
    video_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
    db.delete(video)
    db.commit()
    return None


@app.get("/api/iletisim", response_model=List[schemas.IletisimResponse])
def iletisim_liste(_: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db)):
    return db.query(models.Iletisim).order_by(models.Iletisim.olusturulma_tarihi.desc()).all()


@app.post("/api/iletisim", response_model=schemas.IletisimResponse, status_code=201)
def iletisim_gonder(veri: schemas.IletisimCreate, db: Session = Depends(get_db)):
    yeni_mesaj = models.Iletisim(**veri.model_dump())
    db.add(yeni_mesaj)
    db.commit()
    db.refresh(yeni_mesaj)
    return yeni_mesaj


@app.put("/api/iletisim/{iletisim_id}", response_model=schemas.IletisimResponse)
def iletisim_guncelle(
    iletisim_id: int,
    veri: schemas.IletisimUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    mesaj = db.query(models.Iletisim).filter(models.Iletisim.id == iletisim_id).first()
    if mesaj is None:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    return guncelle(db, mesaj, veri.model_dump())


@app.delete("/api/iletisim/{iletisim_id}", status_code=204)
def iletisim_sil(
    iletisim_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    mesaj = db.query(models.Iletisim).filter(models.Iletisim.id == iletisim_id).first()
    if mesaj is None:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    db.delete(mesaj)
    db.commit()
    return None


@app.get("/api/reklamlar", response_model=List[schemas.ReklamResponse])
def reklam_liste(konum: str = None, sadece_aktif: bool = False, db: Session = Depends(get_db)):
    sorgu = db.query(models.Reklam)
    if konum:
        sorgu = sorgu.filter(models.Reklam.konum == konum)
    if sadece_aktif:
        sorgu = sorgu.filter(models.Reklam.aktif == True)
    return sorgu.order_by(models.Reklam.sira, models.Reklam.id).all()


@app.post("/api/reklamlar", response_model=schemas.ReklamResponse, status_code=201)
def reklam_olustur(
    veri: schemas.ReklamCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    yeni = models.Reklam(**veri.model_dump())
    db.add(yeni)
    db.commit()
    db.refresh(yeni)
    return yeni


@app.put("/api/reklamlar/{reklam_id}", response_model=schemas.ReklamResponse)
def reklam_guncelle(
    reklam_id: int,
    veri: schemas.ReklamUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    reklam = db.query(models.Reklam).filter(models.Reklam.id == reklam_id).first()
    if reklam is None:
        raise HTTPException(status_code=404, detail="Reklam bulunamadı")
    return guncelle(db, reklam, veri.model_dump())


@app.delete("/api/reklamlar/{reklam_id}", status_code=204)
def reklam_sil(
    reklam_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    reklam = db.query(models.Reklam).filter(models.Reklam.id == reklam_id).first()
    if reklam is None:
        raise HTTPException(status_code=404, detail="Reklam bulunamadı")
    db.delete(reklam)
    db.commit()
    return None


@app.get("/api/ayarlar")
def ayarlar_liste(db: Session = Depends(get_db)):
    kayitlar = {a.anahtar: a.deger for a in db.query(models.SiteAyar).all()}
    return {**varsayilan_ayarlar.VARSAYILAN_AYARLAR, **kayitlar}


@app.put("/api/ayarlar")
def ayarlar_guncelle(
    veri: dict,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    for anahtar, deger in veri.items():
        ayar = db.query(models.SiteAyar).filter(models.SiteAyar.anahtar == anahtar).first()
        if ayar:
            ayar.deger = "" if deger is None else str(deger)
        else:
            db.add(models.SiteAyar(anahtar=anahtar, deger="" if deger is None else str(deger)))
    db.commit()
    kayitlar = {a.anahtar: a.deger for a in db.query(models.SiteAyar).all()}
    return {**varsayilan_ayarlar.VARSAYILAN_AYARLAR, **kayitlar}


# ---- Üye sohbeti ----

def mesaj_tamami(db: Session, mesaj: models.Mesaj) -> dict:
    g = mesaj.gonderen
    return {
        "id": mesaj.id,
        "gonderen_id": mesaj.gonderen_id,
        "alici_id": mesaj.alici_id,
        "icerik": mesaj.icerik,
        "okundu": mesaj.okundu,
        "gonderen_ad": g.ad if g else "",
        "gonderen_soyad": g.soyad if g else "",
        "olusturulma_tarihi": mesaj.olusturulma_tarihi,
    }


@app.get("/api/ben", response_model=schemas.KullaniciResponse)
def ben(kullanici: models.Kullanici = Depends(guncel_kullanici)):
    return kullanici


@app.get("/api/chat/uyeler", response_model=List[schemas.KullaniciResponse])
def chat_uyeler(kullanici: models.Kullanici = Depends(guncel_kullanici), db: Session = Depends(get_db)):
    return (
        db.query(models.Kullanici)
        .filter(models.Kullanici.durum == "onayli", models.Kullanici.id != kullanici.id)
        .order_by(models.Kullanici.ad)
        .all()
    )


@app.get("/api/chat/mesajlar", response_model=List[schemas.MesajResponse])
def chat_mesajlar(
    alici_id: int = None,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    if alici_id is None:
        sorgu = db.query(models.Mesaj).filter(models.Mesaj.alici_id.is_(None))
    else:
        sorgu = db.query(models.Mesaj).filter(
            or_(
                and_(
                    models.Mesaj.gonderen_id == kullanici.id,
                    models.Mesaj.alici_id == alici_id,
                ),
                and_(
                    models.Mesaj.gonderen_id == alici_id,
                    models.Mesaj.alici_id == kullanici.id,
                ),
            )
        )
    sorgu = sorgu.order_by(models.Mesaj.olusturulma_tarihi, models.Mesaj.id)

    if alici_id is None:
        okunacaklar = sorgu.filter(
            models.Mesaj.gonderen_id != kullanici.id,
            models.Mesaj.okundu == False,
        )
    else:
        okunacaklar = sorgu.filter(
            models.Mesaj.gonderen_id == alici_id,
            models.Mesaj.okundu == False,
        )
    for m in okunacaklar.all():
        m.okundu = True
    db.commit()
    return [mesaj_tamami(db, m) for m in sorgu.all()]


@app.post("/api/chat/mesajlar", response_model=schemas.MesajResponse, status_code=201)
def chat_mesaj_gonder(
    veri: schemas.MesajCreate,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    icerik = veri.icerik.strip()
    if not icerik:
        raise HTTPException(status_code=400, detail="Mesaj boş olamaz")
    if veri.alici_id is not None:
        alici = (
            db.query(models.Kullanici)
            .filter(
                models.Kullanici.id == veri.alici_id,
                models.Kullanici.durum == "onayli",
            )
            .first()
        )
        if alici is None:
            raise HTTPException(status_code=404, detail="Alıcı üye bulunamadı")
    mesaj = models.Mesaj(
        gonderen_id=kullanici.id,
        alici_id=veri.alici_id,
        icerik=icerik,
    )
    db.add(mesaj)
    db.commit()
    db.refresh(mesaj)
    gonderen_ad = f"{kullanici.ad} {kullanici.soyad}"
    if veri.alici_id is not None:
        bildirim_gonder(
            db,
            f"Yeni mesaj: {gonderen_ad}",
            icerik[:120],
            kullanici_id=veri.alici_id,
            veri={"tip": "sohbet", "ekran": "Sohbet", "mesaj_id": mesaj.id, "gonderen": gonderen_ad, "aliciId": veri.alici_id, "gonderenId": kullanici.id},
            tur="mesaj",
        )
    else:
        bildirim_gonder(
            db,
            f"Genel Sohbet: {gonderen_ad}",
            icerik[:120],
            gonderen_haric_id=kullanici.id,
            veri={"tip": "sohbet", "ekran": "Sohbet", "mesaj_id": mesaj.id, "gonderen": gonderen_ad, "aliciId": None},
            tur="mesaj",
        )
    return mesaj_tamami(db, mesaj)


@app.get("/api/chat/son_durum")
def chat_son_durum(
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    mesajlar = (
        db.query(models.Mesaj)
        .filter(
            or_(
                models.Mesaj.gonderen_id == kullanici.id,
                models.Mesaj.alici_id == kullanici.id,
                models.Mesaj.alici_id.is_(None),
            )
        )
        .order_by(models.Mesaj.id)
        .all()
    )
    uyeler = (
        db.query(models.Kullanici)
        .filter(models.Kullanici.durum == "onayli", models.Kullanici.id != kullanici.id)
        .order_by(models.Kullanici.ad)
        .all()
    )

    def kanal_ozeti(kisi_id=None):
        if kisi_id is None:
            kanal = [m for m in mesajlar if m.alici_id is None]
        else:
            kanal = [
                m
                for m in mesajlar
                if (m.gonderen_id == kullanici.id and m.alici_id == kisi_id)
                or (m.gonderen_id == kisi_id and m.alici_id == kullanici.id)
            ]
        okunmamis = sum(1 for m in kanal if m.gonderen_id != kullanici.id and not m.okundu)
        son = kanal[-1] if kanal else None
        g = son.gonderen if son else None
        return {
            "okunmamis": okunmamis,
            "son_mesaj": son.icerik if son else None,
            "son_tarih": son.olusturulma_tarihi if son else None,
            "gonderen_ad": g.ad if g else "",
        }

    return {
        "genel": kanal_ozeti(None),
        "uyeler": [
            {"id": u.id, "ad": u.ad, "soyad": u.soyad, **kanal_ozeti(u.id)}
            for u in uyeler
        ],
    }


def aidat_yanit(aidat: models.Aidat) -> dict:
    kullanici = aidat.kullanici
    return {
        "id": aidat.id,
        "kullanici_id": aidat.kullanici_id,
        "ad": kullanici.ad if kullanici else None,
        "soyad": kullanici.soyad if kullanici else None,
        "yil": aidat.yil,
        "ay": aidat.ay,
        "tutar": aidat.tutar,
        "durum": aidat.durum,
        "aciklama": aidat.aciklama,
        "odeme_tarihi": aidat.odeme_tarihi,
        "olusturulma_tarihi": aidat.olusturulma_tarihi,
    }


@app.get("/api/aidatlar", response_model=List[schemas.AidatResponse])
def aidatlar_liste(_: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db)):
    return [aidat_yanit(a) for a in db.query(models.Aidat).order_by(models.Aidat.yil.desc(), models.Aidat.ay.desc()).all()]


@app.get("/api/aidatlar/benim", response_model=List[schemas.AidatResponse])
def aidatlar_benim(kullanici: models.Kullanici = Depends(guncel_kullanici), db: Session = Depends(get_db)):
    return [aidat_yanit(a) for a in db.query(models.Aidat).filter(models.Aidat.kullanici_id == kullanici.id).order_by(models.Aidat.yil.desc(), models.Aidat.ay.desc()).all()]


@app.post("/api/aidatlar", response_model=schemas.AidatResponse, status_code=201)
def aidat_ekle(
    veri: schemas.AidatCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    kullanici = db.query(models.Kullanici).filter(models.Kullanici.id == veri.kullanici_id).first()
    if kullanici is None:
        raise HTTPException(status_code=404, detail="Üye bulunamadı")
    if veri.tutar <= 0:
        raise HTTPException(status_code=400, detail="Tutar 0'dan büyük olmalı")
    aidat = models.Aidat(
        kullanici_id=veri.kullanici_id,
        yil=veri.yil,
        ay=veri.ay,
        tutar=veri.tutar,
        durum="beklemede",
        aciklama=veri.aciklama,
    )
    db.add(aidat)
    db.commit()
    db.refresh(aidat)
    donem = f"{veri.yil} yılı {veri.ay}. ayı"
    bildirim_gonder(
        db,
        "Aidat Kaydı Oluşturuldu",
        f"{donem} aidatınız kaydedildi ({aidat.tutar} ₺). Ödemenizi yaptığınızda bildirin.",
        kullanici_id=veri.kullanici_id,
        veri={"ekran": "Aidatlar"},
        tur="aidat",
    )
    return aidat_yanit(aidat)


@app.put("/api/aidatlar/{aidat_id}", response_model=schemas.AidatResponse)
def aidat_guncelle(
    aidat_id: int,
    veri: schemas.AidatUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    aidat = db.query(models.Aidat).filter(models.Aidat.id == aidat_id).first()
    if aidat is None:
        raise HTTPException(status_code=404, detail="Aidat kaydı bulunamadı")
    eski_durum = aidat.durum
    sonuc = guncelle(db, aidat, veri.model_dump())
    if eski_durum != sonuc.durum:
        donem = f"{sonuc.yil} yılı {sonuc.ay}. ayı"
        if sonuc.durum == "odendi":
            bildirim_gonder(db, "Aidat Ödemeniz Onaylandı", f"{donem} aidatınız ödendi olarak işaretlendi.",
                            kullanici_id=sonuc.kullanici_id, veri={"ekran": "Aidatlar"}, tur="aidat")
        elif sonuc.durum == "reddedildi":
            bildirim_gonder(db, "Aidat Durumu", f"{donem} aidat ödemeniz onaylanmadı.",
                            kullanici_id=sonuc.kullanici_id, veri={"ekran": "Aidatlar"}, tur="aidat")
    return aidat_yanit(sonuc)


@app.delete("/api/aidatlar/{aidat_id}", status_code=204)
def aidat_sil(
    aidat_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    aidat = db.query(models.Aidat).filter(models.Aidat.id == aidat_id).first()
    if aidat is None:
        raise HTTPException(status_code=404, detail="Aidat kaydı bulunamadı")
    db.delete(aidat)
    db.commit()


@app.post("/api/aidatlar/benim/ode", response_model=schemas.AidatResponse)
def aidat_benim_ode(
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    bugun = date.today()
    yil = bugun.year
    ay = bugun.month
    kayit = (
        db.query(models.Aidat)
        .filter(
            models.Aidat.kullanici_id == kullanici.id,
            models.Aidat.yil == yil,
            models.Aidat.ay == ay,
        )
        .first()
    )
    if kayit is None:
        ayarlar = {a.anahtar: a.deger for a in db.query(models.SiteAyar).all()}
        tutar = float(ayarlar.get("aidat_aylik_tutar") or varsayilan_ayarlar.VARSAYILAN_AYARLAR.get("aidat_aylik_tutar", 0) or 0)
        kayit = models.Aidat(
            kullanici_id=kullanici.id,
            yil=yil,
            ay=ay,
            tutar=tutar,
            durum="beklemede",
        )
        db.add(kayit)
        db.commit()
        db.refresh(kayit)
    if kayit.durum == "odendi":
        raise HTTPException(status_code=400, detail="Bu ayın aidatı zaten ödenmiş")
    kayit.durum = "odeyenekadar"
    db.commit()
    db.refresh(kayit)
    return aidat_yanit(kayit)


@app.post("/api/aidatlar/hatirlat")
def aidat_hatirlat(
    veri: schemas.AidatHatirlatInput,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    bugun = date.today()
    yil = veri.yil or bugun.year
    ay = veri.ay or bugun.month
    if not (1 <= ay <= 12):
        raise HTTPException(status_code=400, detail="Geçersiz ay")
    odenenler = {
        k[0]
        for k in db.query(models.Aidat.kullanici_id)
        .filter(models.Aidat.yil == yil, models.Aidat.ay == ay, models.Aidat.durum == "odendi")
        .all()
        if k[0] is not None
    }
    hedefler = (
        db.query(models.Kullanici.id)
        .filter(models.Kullanici.durum == "onayli")
        .all()
    )
    hedef_ids = [k[0] for k in hedefler if k[0] not in odenenler]
    if not hedef_ids:
        return {"mesaj": "Bildirim gönderilecek üye bulunamadı", "hedef_sayi": 0}

    kapali = _tercih_kapali_kullanicilar(db, "aidat")
    sorgu = db.query(models.Cihaz.expo_token).filter(models.Cihaz.kullanici_id.in_(hedef_ids))
    if kapali:
        sorgu = sorgu.filter(models.Cihaz.kullanici_id.notin_(kapali))
    tokenler = [t[0] for t in sorgu.all() if t[0]]
    ay_isimleri = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                   "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    ay_ad = ay_isimleri[ay]
    _expo_push_gonder(
        tokenler,
        f"Aidat Hatırlatması",
        f"{ay_ad} {yil} ayı aidatınızı ödemeniz bekleniyor. Odeme bildirimini yapmayı unutmayın.",
        {"ekran": "Aidatlar"},
    )
    return {"mesaj": "Bildirim gönderildi", "hedef_sayi": len(hedef_ids), "gonderilen": len(tokenler)}


@app.post("/api/aidatlar/{aidat_id}/ode", response_model=schemas.AidatResponse)
def aidat_ode(
    aidat_id: int,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    aidat = db.query(models.Aidat).filter(models.Aidat.id == aidat_id).first()
    if aidat is None or aidat.kullanici_id != kullanici.id:
        raise HTTPException(status_code=404, detail="Aidat kaydı bulunamadı")
    if aidat.durum == "odendi":
        raise HTTPException(status_code=400, detail="Bu aidat zaten ödenmiş")
    aidat.durum = "odeyenekadar"
    db.commit()
    db.refresh(aidat)
    return aidat_yanit(aidat)


@app.get("/api/bagislar", response_model=List[schemas.BagisResponse])
def bagislar_liste(_: models.Kullanici = Depends(guncel_yonetici), db: Session = Depends(get_db)):
    return db.query(models.Bagis).order_by(models.Bagis.olusturulma_tarihi.desc()).all()


@app.get("/api/bagislar/benim", response_model=List[schemas.BagisResponse])
def bagislar_benim(kullanici: models.Kullanici = Depends(guncel_kullanici), db: Session = Depends(get_db)):
    return db.query(models.Bagis).filter(models.Bagis.kullanici_id == kullanici.id).order_by(models.Bagis.olusturulma_tarihi.desc()).all()


@app.post("/api/bagislar", response_model=schemas.BagisResponse, status_code=201)
def bagis_ekle(
    veri: schemas.BagisCreate,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    if veri.tutar <= 0:
        raise HTTPException(status_code=400, detail="Tutar 0'dan büyük olmalı")
    bagis = models.Bagis(
        kullanici_id=kullanici.id,
        ad=kullanici.ad,
        email=kullanici.email,
        tutar=veri.tutar,
        aciklama=veri.aciklama,
        durum="beklemede",
    )
    db.add(bagis)
    db.commit()
    db.refresh(bagis)
    return bagis


@app.put("/api/bagislar/{bagis_id}", response_model=schemas.BagisResponse)
def bagis_guncelle(
    bagis_id: int,
    veri: schemas.BagisUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    bagis = db.query(models.Bagis).filter(models.Bagis.id == bagis_id).first()
    if bagis is None:
        raise HTTPException(status_code=404, detail="Bağış kaydı bulunamadı")
    eski_durum = bagis.durum
    sonuc = guncelle(db, bagis, veri.model_dump())
    if eski_durum != sonuc.durum and sonuc.kullanici_id and sonuc.durum in ("onaylandi", "reddedildi"):
        bildirim_gonder(db, "Bağış Durumu",
                        "Bağışınız onaylandı." if sonuc.durum == "onaylandi" else "Bağışınız onaylanmadı.",
                        kullanici_id=sonuc.kullanici_id, veri={"ekran": "Bagislar"}, tur="bagis")
    return sonuc


@app.delete("/api/bagislar/{bagis_id}", status_code=204)
def bagis_sil(
    bagis_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    bagis = db.query(models.Bagis).filter(models.Bagis.id == bagis_id).first()
    if bagis is None:
        raise HTTPException(status_code=404, detail="Bağış kaydı bulunamadı")
    db.delete(bagis)
    db.commit()


@app.get("/api/rehber", response_model=list[schemas.RehberResponse])
def rehber_liste(kategori: str = None, db: Session = Depends(get_db)):
    sorgu = db.query(models.Rehber)
    if kategori:
        sorgu = sorgu.filter(models.Rehber.kategori == kategori)
    return sorgu.order_by(models.Rehber.ad).all()


@app.post("/api/rehber", response_model=schemas.RehberResponse)
def rehber_ekle(
    veri: schemas.RehberCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    kayit = models.Rehber(**veri.model_dump())
    db.add(kayit)
    db.commit()
    db.refresh(kayit)
    return kayit


@app.put("/api/rehber/{rehber_id}", response_model=schemas.RehberResponse)
def rehber_guncelle(
    rehber_id: int,
    veri: schemas.RehberUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    rehber = db.query(models.Rehber).filter(models.Rehber.id == rehber_id).first()
    if rehber is None:
        raise HTTPException(status_code=404, detail="Rehber kaydı bulunamadı")
    guncelle(db, rehber, veri.model_dump(exclude_none=True))
    db.commit()
    db.refresh(rehber)
    return rehber


@app.delete("/api/rehber/{rehber_id}", status_code=204)
def rehber_sil(
    rehber_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    rehber = db.query(models.Rehber).filter(models.Rehber.id == rehber_id).first()
    if rehber is None:
        raise HTTPException(status_code=404, detail="Rehber kaydı bulunamadı")
    db.delete(rehber)
    db.commit()


@app.get("/api/ilanlar", response_model=list[schemas.IlanResponse])
def ilanlar_liste(
    kategori: str = None,
    sadece_aktif: bool = True,
    db: Session = Depends(get_db),
):
    sorgu = db.query(models.Ilan)
    if kategori:
        sorgu = sorgu.filter(models.Ilan.kategori == kategori)
    if sadece_aktif:
        sorgu = sorgu.filter(models.Ilan.durum == "aktif")
    return sorgu.order_by(models.Ilan.olusturulma_tarihi.desc()).all()


@app.post("/api/ilanlar", response_model=schemas.IlanResponse)
def ilan_ekle(
    veri: schemas.IlanCreate,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    kayit = models.Ilan(
        baslik=veri.baslik,
        aciklama=veri.aciklama,
        kategori=veri.kategori,
        fiyat=veri.fiyat,
        fotograf_url=veri.fotograf_url,
        kullanici_id=kullanici.id,
        telefon=veri.telefon or kullanici.telefon,
        durum="aktif",
    )
    db.add(kayit)
    db.commit()
    db.refresh(kayit)
    return {
        "id": kayit.id,
        "baslik": kayit.baslik,
        "aciklama": kayit.aciklama,
        "kategori": kayit.kategori,
        "fiyat": kayit.fiyat,
        "durum": kayit.durum,
        "telefon": kayit.telefon,
        "fotograf_url": kayit.fotograf_url,
        "kullanici_id": kayit.kullanici_id,
        "kullanici_ad": kullanici.ad,
        "kullanici_soyad": kullanici.soyad,
        "olusturulma_tarihi": kayit.olusturulma_tarihi,
    }


@app.put("/api/ilanlar/{ilan_id}", response_model=schemas.IlanResponse)
def ilan_guncelle(
    ilan_id: int,
    veri: schemas.IlanUpdate,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    ilan = db.query(models.Ilan).filter(models.Ilan.id == ilan_id).first()
    if ilan is None:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    if kullanici.rol != "yonetici" and ilan.kullanici_id != kullanici.id:
        raise HTTPException(status_code=403, detail="Bu ilanı düzenleme yetkiniz yok")
    if kullanici.rol != "yonetici":
        veri = veri.model_copy(update={"durum": None})
    guncelle(db, ilan, veri.model_dump(exclude_none=True))
    db.commit()
    db.refresh(ilan)
    kullanici_nesne = ilan.kullanici or kullanici
    return {
        "id": ilan.id,
        "baslik": ilan.baslik,
        "aciklama": ilan.aciklama,
        "kategori": ilan.kategori,
        "fiyat": ilan.fiyat,
        "durum": ilan.durum,
        "telefon": ilan.telefon,
        "fotograf_url": ilan.fotograf_url,
        "kullanici_id": ilan.kullanici_id,
        "kullanici_ad": kullanici_nesne.ad if kullanici_nesne else None,
        "kullanici_soyad": kullanici_nesne.soyad if kullanici_nesne else None,
        "olusturulma_tarihi": ilan.olusturulma_tarihi,
    }


@app.delete("/api/ilanlar/{ilan_id}", status_code=204)
def ilan_sil(
    ilan_id: int,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    ilan = db.query(models.Ilan).filter(models.Ilan.id == ilan_id).first()
    if ilan is None:
        raise HTTPException(status_code=404, detail="İlan bulunamadı")
    if kullanici.rol != "yonetici" and ilan.kullanici_id != kullanici.id:
        raise HTTPException(status_code=403, detail="Bu ilanı silme yetkiniz yok")
    db.delete(ilan)
    db.commit()


def _secim_sayilari(oylama: models.Oylama, db: Session) -> dict:
    sayilar = {}
    oylar = db.query(models.Oy).filter(models.Oy.oylama_id == oylama.id).all()
    for oy in oylar:
        sayilar[oy.secim] = sayilar.get(oy.secim, 0) + 1
    return sayilar


def _toplanti_yanit(toplanti: models.Toplanti, db: Session, kullanici: models.Kullanici = None) -> dict:
    gundem = [{"id": g.id, "toplanti_id": g.toplanti_id, "baslik": g.baslik, "sira": g.sira}
              for g in sorted(toplanti.gundem, key=lambda x: x.sira)]
    secenekler_parcala = lambda s: json.loads(s) if s else []
    oylamalar = []
    for oy in sorted(toplanti.oylamalar, key=lambda x: x.id):
        secimler = _secim_sayilari(oy, db)
        benim = None
        if kullanici is not None:
            kayit = db.query(models.Oy).filter(
                models.Oy.oylama_id == oy.id, models.Oy.kullanici_id == kullanici.id
            ).first()
            benim = kayit.secim if kayit else None
        oylamalar.append({
            "id": oy.id,
            "toplanti_id": oy.toplanti_id,
            "konu": oy.konu,
            "secenekler": secenekler_parcala(oy.secenekler),
            "aktif": oy.aktif,
            "sonuc": oy.sonuc,
            "oy_sayisi": sum(secimler.values()),
            "oy_secimler": secimler,
            "benim_oyum": benim,
        })
    return {
        "id": toplanti.id,
        "baslik": toplanti.baslik,
        "aciklama": toplanti.aciklama,
        "tarih": toplanti.tarih,
        "yer": toplanti.yer,
        "video_url": toplanti.video_url,
        "tutanak": toplanti.tutanak,
        "durum": toplanti.durum,
        "gundem": gundem,
        "oylamalar": oylamalar,
        "olusturulma_tarihi": toplanti.olusturulma_tarihi,
    }


@app.get("/api/toplantilar", response_model=list[schemas.ToplantiResponse])
def toplantilar_liste(
    sadece_gelecek: bool = False,
    db: Session = Depends(get_db),
    kullanici: models.Kullanici = Depends(guncel_kullanici_opsiyonel),
):
    sorgu = db.query(models.Toplanti)
    if sadece_gelecek:
        sorgu = sorgu.filter(models.Toplanti.tarih.is_not(None)).order_by(models.Toplanti.tarih.asc())
    else:
        sorgu = sorgu.order_by(models.Toplanti.tarih.desc())
    return [_toplanti_yanit(t, db, kullanici) for t in sorgu.all()]


@app.get("/api/toplantilar/{toplanti_id}", response_model=schemas.ToplantiResponse)
def toplanti_detay(
    toplanti_id: int,
    db: Session = Depends(get_db),
    kullanici: models.Kullanici = Depends(guncel_kullanici_opsiyonel),
):
    toplanti = db.query(models.Toplanti).filter(models.Toplanti.id == toplanti_id).first()
    if toplanti is None:
        raise HTTPException(status_code=404, detail="Toplantı bulunamadı")
    return _toplanti_yanit(toplanti, db, kullanici)


@app.post("/api/toplantilar", response_model=schemas.ToplantiResponse)
def toplanti_ekle(
    veri: schemas.ToplantiCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    toplanti = models.Toplanti(
        baslik=veri.baslik,
        aciklama=veri.aciklama,
        tarih=veri.tarih,
        yer=veri.yer,
        video_url=veri.video_url,
        durum=veri.durum,
    )
    for i, gundem in enumerate(veri.gundem):
        toplanti.gundem.append(models.Gundem(baslik=gundem.baslik, sira=gundem.sira or i))
    db.add(toplanti)
    db.commit()
    db.refresh(toplanti)
    tarih_metin = toplanti.tarih.strftime("%d.%m.%Y %H:%M") if toplanti.tarih else ""
    bildirim_gonder(db, f"Yeni Toplantı: {toplanti.baslik}", tarih_metin or "Toplantı programı eklendi",
                    veri={"ekran": "Toplantilar", "id": toplanti.id}, tur="toplanti")
    return _toplanti_yanit(toplanti, db, None)


@app.put("/api/toplantilar/{toplanti_id}", response_model=schemas.ToplantiResponse)
def toplanti_guncelle(
    toplanti_id: int,
    veri: schemas.ToplantiUpdate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    toplanti = db.query(models.Toplanti).filter(models.Toplanti.id == toplanti_id).first()
    if toplanti is None:
        raise HTTPException(status_code=404, detail="Toplantı bulunamadı")
    guncelle(db, toplanti, veri.model_dump(exclude_none=True, exclude={"gundem"}))
    if veri.gundem is not None:
        for g in toplanti.gundem:
            db.delete(g)
        toplanti.gundem = []
        for i, gundem in enumerate(veri.gundem):
            toplanti.gundem.append(models.Gundem(baslik=gundem.baslik, sira=gundem.sira or i))
    db.commit()
    db.refresh(toplanti)
    return _toplanti_yanit(toplanti, db, None)


@app.delete("/api/toplantilar/{toplanti_id}", status_code=204)
def toplanti_sil(
    toplanti_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    toplanti = db.query(models.Toplanti).filter(models.Toplanti.id == toplanti_id).first()
    if toplanti is None:
        raise HTTPException(status_code=404, detail="Toplantı bulunamadı")
    db.delete(toplanti)
    db.commit()


@app.post("/api/toplantilar/{toplanti_id}/oylamalar", response_model=schemas.OylamaResponse)
def oylama_ekle(
    toplanti_id: int,
    veri: schemas.OylamaCreate,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    toplanti = db.query(models.Toplanti).filter(models.Toplanti.id == toplanti_id).first()
    if toplanti is None:
        raise HTTPException(status_code=404, detail="Toplantı bulunamadı")
    oylama = models.Oylama(
        toplanti_id=toplanti_id,
        konu=veri.konu,
        secenekler=json.dumps(veri.secenekler, ensure_ascii=False),
        aktif=True,
    )
    db.add(oylama)
    db.commit()
    db.refresh(oylama)
    bildirim_gonder(db, "Yeni Oylama Açıldı", oylama.konu[:120],
                    veri={"ekran": "ToplantiDetay", "toplanti_id": toplanti_id}, tur="oylama")
    return {
        "id": oylama.id, "toplanti_id": oylama.toplanti_id, "konu": oylama.konu,
        "secenekler": veri.secenekler, "aktif": oylama.aktif, "sonuc": oylama.sonuc,
        "oy_sayisi": 0, "oy_secimler": {}, "benim_oyum": None,
    }


@app.delete("/api/toplantilar/{toplanti_id}/oylamalar/{oylama_id}", status_code=204)
def oylama_sil(
    toplanti_id: int,
    oylama_id: int,
    _: models.Kullanici = Depends(guncel_yonetici),
    db: Session = Depends(get_db),
):
    oylama = db.query(models.Oylama).filter(
        models.Oylama.id == oylama_id, models.Oylama.toplanti_id == toplanti_id
    ).first()
    if oylama is None:
        raise HTTPException(status_code=404, detail="Oylama bulunamadı")
    db.delete(oylama)
    db.commit()


@app.post("/api/toplantilar/{toplanti_id}/oylamalar/{oylama_id}/oy")
def oy_kullan(
    toplanti_id: int,
    oylama_id: int,
    secim: str,
    kullanici: models.Kullanici = Depends(guncel_kullanici),
    db: Session = Depends(get_db),
):
    oylama = db.query(models.Oylama).filter(
        models.Oylama.id == oylama_id, models.Oylama.toplanti_id == toplanti_id
    ).first()
    if oylama is None:
        raise HTTPException(status_code=404, detail="Oylama bulunamadı")
    if not oylama.aktif:
        raise HTTPException(status_code=400, detail="Bu oylama kapatıldı")
    secenekler = json.loads(oylama.secenekler or "[]")
    if secim not in secenekler:
        raise HTTPException(status_code=400, detail="Geçersiz oylama seçeneği")
    mevcut = db.query(models.Oy).filter(
        models.Oy.oylama_id == oylama_id, models.Oy.kullanici_id == kullanici.id
    ).first()
    if mevcut:
        mevcut.secim = secim
    else:
        db.add(models.Oy(oylama_id=oylama_id, kullanici_id=kullanici.id, secim=secim))
    db.commit()
    secimler = _secim_sayilari(oylama, db)
    return {"durum": "ok", "secim": secim, "oy_secimler": secimler, "oy_sayisi": sum(secimler.values())}


FRONTEND_KLASOR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(FRONTEND_KLASOR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_KLASOR, "assets")), name="assets")


@app.get("/{tum_yol:path}", include_in_schema=False)
def sayfa_servis(tum_yol: str):
    if not os.path.isdir(FRONTEND_KLASOR):
        raise HTTPException(status_code=404, detail="Frontend build edilmemiş")
    if tum_yol.startswith("api/") or tum_yol.startswith("uploads/") or tum_yol == "api":
        raise HTTPException(status_code=404, detail="Bulunamadı")
    hedef = os.path.normpath(os.path.join(FRONTEND_KLASOR, tum_yol))
    if tum_yol and os.path.isfile(hedef) and hedef.startswith(os.path.realpath(FRONTEND_KLASOR)):
        return FileResponse(hedef)
    return FileResponse(os.path.join(FRONTEND_KLASOR, "index.html"))