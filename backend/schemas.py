from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class KullaniciCreate(BaseModel):
    ad: str
    soyad: str
    email: EmailStr
    telefon: str
    koy: str
    sifre: str


class KullaniciLogin(BaseModel):
    email: EmailStr
    sifre: str


class KullaniciResponse(BaseModel):
    id: int
    ad: str
    soyad: str
    email: str
    telefon: str
    rol: str
    durum: str
    koy: str

    class Config:
        from_attributes = True


class KullaniciUpdate(BaseModel):
    ad: Optional[str] = None
    soyad: Optional[str] = None
    telefon: Optional[str] = None
    koy: Optional[str] = None
    rol: Optional[str] = None
    durum: Optional[str] = None


class DuyuruCreate(BaseModel):
    baslik: str
    icerik: str
    kategori: str = "Genel"


class DuyuruUpdate(BaseModel):
    baslik: Optional[str] = None
    icerik: Optional[str] = None
    kategori: Optional[str] = None


class DuyuruResponse(BaseModel):
    id: int
    baslik: str
    icerik: str
    kategori: str
    yazar_id: int
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True


class EtkinlikCreate(BaseModel):
    baslik: str
    aciklama: str
    tarih: datetime
    yer: str
    kontenjan: int = 50


class EtkinlikUpdate(BaseModel):
    baslik: Optional[str] = None
    aciklama: Optional[str] = None
    tarih: Optional[datetime] = None
    yer: Optional[str] = None
    kontenjan: Optional[int] = None


class EtkinlikResponse(BaseModel):
    id: int
    baslik: str
    aciklama: str
    tarih: datetime
    yer: str
    kontenjan: int
    kayitli: int

    class Config:
        from_attributes = True


class GaleriCreate(BaseModel):
    baslik: str
    resim_url: str
    aciklama: Optional[str] = None


class GaleriUpdate(BaseModel):
    baslik: Optional[str] = None
    resim_url: Optional[str] = None
    aciklama: Optional[str] = None


class GaleriResponse(BaseModel):
    id: int
    baslik: str
    resim_url: str
    aciklama: Optional[str]

    class Config:
        from_attributes = True


class VideoCreate(BaseModel):
    baslik: str
    video_url: str
    kapak_url: Optional[str] = None
    aciklama: Optional[str] = None
    kategori: str = "Genel"


class VideoUpdate(BaseModel):
    baslik: Optional[str] = None
    video_url: Optional[str] = None
    kapak_url: Optional[str] = None
    aciklama: Optional[str] = None
    kategori: Optional[str] = None


class VideoResponse(BaseModel):
    id: int
    baslik: str
    video_url: str
    kapak_url: Optional[str]
    aciklama: Optional[str]
    kategori: str

    class Config:
        from_attributes = True


class IletisimCreate(BaseModel):
    ad: str
    email: EmailStr
    konu: str
    mesaj: str


class IletisimUpdate(BaseModel):
    durum: Optional[str] = None


class IletisimResponse(BaseModel):
    id: int
    ad: str
    email: str
    konu: str
    mesaj: str
    durum: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SifreDegistir(BaseModel):
    mevcut_sifre: str
    yeni_sifre: str


class CihazKayit(BaseModel):
    expo_token: str
    platform: str = "android"


class BildirimTercihGuncelle(BaseModel):
    duyuru: Optional[bool] = None
    etkinlik: Optional[bool] = None
    toplanti: Optional[bool] = None
    oylama: Optional[bool] = None
    aidat: Optional[bool] = None
    bagis: Optional[bool] = None


class MesajCreate(BaseModel):
    alici_id: Optional[int] = None
    icerik: str


class MesajResponse(BaseModel):
    id: int
    gonderen_id: int
    alici_id: Optional[int] = None
    icerik: str
    okundu: bool
    gonderen_ad: Optional[str] = None
    gonderen_soyad: Optional[str] = None
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True


class ReklamCreate(BaseModel):
    baslik: str
    aciklama: Optional[str] = None
    resim_url: Optional[str] = None
    link_url: Optional[str] = None
    konum: str = "ana_sayfa"
    aktif: bool = True
    sira: int = 0


class ReklamUpdate(BaseModel):
    baslik: Optional[str] = None
    aciklama: Optional[str] = None
    resim_url: Optional[str] = None
    link_url: Optional[str] = None
    konum: Optional[str] = None
    aktif: Optional[bool] = None
    sira: Optional[int] = None


class ReklamResponse(BaseModel):
    id: int
    baslik: str
    aciklama: Optional[str]
    resim_url: Optional[str]
    link_url: Optional[str]
    konum: str
    aktif: bool
    sira: int

    class Config:
        from_attributes = True


class AidatCreate(BaseModel):
    kullanici_id: int
    yil: int
    ay: int = 1
    tutar: int = 0
    aciklama: Optional[str] = None


class AidatUpdate(BaseModel):
    tutar: Optional[int] = None
    durum: Optional[str] = None
    aciklama: Optional[str] = None


class AidatResponse(BaseModel):
    id: int
    kullanici_id: int
    ad: Optional[str] = None
    soyad: Optional[str] = None
    yil: int
    ay: int
    tutar: int
    durum: str
    aciklama: Optional[str]
    odeme_tarihi: Optional[datetime]
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True


class BagisCreate(BaseModel):
    tutar: int
    ad: str
    email: str
    aciklama: Optional[str] = None


class BagisUpdate(BaseModel):
    tutar: Optional[int] = None
    durum: Optional[str] = None
    aciklama: Optional[str] = None


class BagisResponse(BaseModel):
    id: int
    kullanici_id: Optional[int]
    ad: str
    email: str
    tutar: int
    aciklama: Optional[str]
    durum: str
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True


class RehberCreate(BaseModel):
    ad: str
    kategori: str = "Genel"
    aciklama: Optional[str] = None
    adres: Optional[str] = None
    telefon: Optional[str] = None
    fotograf_url: Optional[str] = None


class RehberUpdate(BaseModel):
    ad: Optional[str] = None
    kategori: Optional[str] = None
    aciklama: Optional[str] = None
    adres: Optional[str] = None
    telefon: Optional[str] = None
    fotograf_url: Optional[str] = None


class RehberResponse(BaseModel):
    id: int
    ad: str
    kategori: str
    aciklama: Optional[str]
    adres: Optional[str]
    telefon: Optional[str]
    fotograf_url: Optional[str]
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True


class IlanCreate(BaseModel):
    baslik: str
    aciklama: str
    kategori: str = "Satılık"
    fiyat: int = 0
    telefon: Optional[str] = None
    fotograf_url: Optional[str] = None


class IlanUpdate(BaseModel):
    baslik: Optional[str] = None
    aciklama: Optional[str] = None
    kategori: Optional[str] = None
    fiyat: Optional[int] = None
    telefon: Optional[str] = None
    fotograf_url: Optional[str] = None
    durum: Optional[str] = None


class IlanResponse(BaseModel):
    id: int
    baslik: str
    aciklama: str
    kategori: str
    fiyat: int
    durum: str
    telefon: Optional[str]
    fotograf_url: Optional[str]
    kullanici_id: Optional[int]
    kullanici_ad: Optional[str] = None
    kullanici_soyad: Optional[str] = None
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True


class GundemCreate(BaseModel):
    baslik: str
    sira: int = 0


class GundemResponse(BaseModel):
    id: int
    toplanti_id: int
    baslik: str
    sira: int

    class Config:
        from_attributes = True


class OylamaCreate(BaseModel):
    konu: str
    secenekler: List[str]


class OylamaResponse(BaseModel):
    id: int
    toplanti_id: int
    konu: str
    secenekler: List[str] = []
    aktif: bool
    sonuc: Optional[str]
    oy_sayisi: int = 0
    oy_secimler: dict = {}
    benim_oyum: Optional[str] = None

    class Config:
        from_attributes = True


class ToplantiCreate(BaseModel):
    baslik: str
    aciklama: Optional[str] = None
    tarih: datetime
    yer: Optional[str] = None
    video_url: Optional[str] = None
    durum: str = "planlandi"
    gundem: List[GundemCreate] = []


class ToplantiUpdate(BaseModel):
    baslik: Optional[str] = None
    aciklama: Optional[str] = None
    tarih: Optional[datetime] = None
    yer: Optional[str] = None
    video_url: Optional[str] = None
    tutanak: Optional[str] = None
    durum: Optional[str] = None
    gundem: Optional[List[GundemCreate]] = None


class ToplantiResponse(BaseModel):
    id: int
    baslik: str
    aciklama: Optional[str]
    tarih: datetime
    yer: Optional[str]
    video_url: Optional[str]
    tutanak: Optional[str]
    durum: str
    gundem: List[GundemResponse] = []
    oylamalar: List[OylamaResponse] = []
    olusturulma_tarihi: datetime

    class Config:
        from_attributes = True