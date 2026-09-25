from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Kullanici(Base):
    __tablename__ = "kullanicilar"

    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String, index=True)
    soyad = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    telefon = Column(String)
    sifre_hash = Column(String)
    rol = Column(String, default="uye")
    durum = Column(String, default="beklemede")
    koy = Column(String)
    token_surumu = Column(Integer, default=1)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    bildirimler = relationship("Duyuru", back_populates="yazar")
    etkinlikler = relationship("Etkinlik", back_populates="duzenleyen")


class Cihaz(Base):
    __tablename__ = "cihazlar"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"), index=True)
    expo_token = Column(String, unique=True, index=True)
    platform = Column(String, default="android")
    son_kullanma_tarihi = Column(DateTime(timezone=True))
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    kullanici = relationship("Kullanici")


class BildirimTercihi(Base):
    __tablename__ = "bildirim_tercihleri"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"), index=True)
    tur = Column(String, index=True)
    aktif = Column(Boolean, default=True)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    kullanici = relationship("Kullanici")


class GirisDeneme(Base):
    __tablename__ = "giris_denemeleri"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    basarisiz_sayi = Column(Integer, default=0)
    kilitli_ta = Column(DateTime(timezone=True))
    son_deneme = Column(DateTime(timezone=True), server_default=func.now())


class Duyuru(Base):
    __tablename__ = "duyurular"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    icerik = Column(Text)
    kategori = Column(String, default="Genel")
    yazar_id = Column(Integer, ForeignKey("kullanicilar.id"))
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    yazar = relationship("Kullanici", back_populates="bildirimler")


class Etkinlik(Base):
    __tablename__ = "etkinlikler"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    aciklama = Column(Text)
    tarih = Column(DateTime)
    yer = Column(String)
    kontenjan = Column(Integer, default=50)
    kayitli = Column(Integer, default=0)
    duzenleyen_id = Column(Integer, ForeignKey("kullanicilar.id"))
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    duzenleyen = relationship("Kullanici", back_populates="etkinlikler")


class Galeri(Base):
    __tablename__ = "galeri"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    resim_url = Column(String)
    aciklama = Column(Text)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())


class Video(Base):
    __tablename__ = "videolar"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    video_url = Column(String)
    kapak_url = Column(String)
    aciklama = Column(Text)
    kategori = Column(String, default="Genel")
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())


class Iletisim(Base):
    __tablename__ = "iletisim"

    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String)
    email = Column(String)
    konu = Column(String)
    mesaj = Column(Text)
    durum = Column(String, default="yeni")
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())


class EtkinlikKayit(Base):
    __tablename__ = "etkinlik_kayitlari"

    id = Column(Integer, primary_key=True, index=True)
    etkinlik_id = Column(Integer, ForeignKey("etkinlikler.id"))
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"))
    kayit_tarihi = Column(DateTime(timezone=True), server_default=func.now())


class SiteAyar(Base):
    __tablename__ = "site_ayarlari"

    id = Column(Integer, primary_key=True, index=True)
    anahtar = Column(String, unique=True, index=True)
    deger = Column(Text)


class Mesaj(Base):
    __tablename__ = "chat_mesajlari"

    id = Column(Integer, primary_key=True, index=True)
    gonderen_id = Column(Integer, ForeignKey("kullanicilar.id"))
    alici_id = Column(Integer, ForeignKey("kullanicilar.id"), nullable=True)
    icerik = Column(Text)
    okundu = Column(Boolean, default=False)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    gonderen = relationship("Kullanici", foreign_keys=[gonderen_id])


class Reklam(Base):
    __tablename__ = "reklamlar"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    aciklama = Column(Text)
    resim_url = Column(String)
    link_url = Column(String)
    konum = Column(String, default="ana_sayfa")
    aktif = Column(Boolean, default=True)
    sira = Column(Integer, default=0)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())


class Aidat(Base):
    __tablename__ = "aidatlar"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"))
    yil = Column(Integer, index=True)
    ay = Column(Integer, default=1, index=True)
    tutar = Column(Integer, default=0)
    durum = Column(String, default="beklemede")
    aciklama = Column(Text)
    odeme_tarihi = Column(DateTime(timezone=True))
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    kullanici = relationship("Kullanici")


def _kullanici_ilişkisi():
    from sqlalchemy.orm import relationship as _rel
    return _rel


class Bagis(Base):
    __tablename__ = "bagislar"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"), nullable=True)
    ad = Column(String)
    email = Column(String)
    tutar = Column(Integer, default=0)
    aciklama = Column(Text)
    durum = Column(String, default="beklemede")
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    kullanici = relationship("Kullanici")


class Rehber(Base):
    __tablename__ = "rehber"

    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String)
    kategori = Column(String, default="Genel")
    aciklama = Column(Text)
    adres = Column(String)
    telefon = Column(String)
    fotograf_url = Column(String)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())


class Ilan(Base):
    __tablename__ = "ilanlar"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    aciklama = Column(Text)
    kategori = Column(String, default="Satılık")
    fiyat = Column(Integer, default=0)
    telefon = Column(String)
    fotograf_url = Column(String)
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"), nullable=True)
    durum = Column(String, default="aktif")
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    kullanici = relationship("Kullanici")


class Toplanti(Base):
    __tablename__ = "toplantilar"

    id = Column(Integer, primary_key=True, index=True)
    baslik = Column(String)
    aciklama = Column(Text)
    tarih = Column(DateTime)
    yer = Column(String)
    video_url = Column(String)
    tutanak = Column(Text)
    durum = Column(String, default="planlandi")
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    gundem = relationship("Gundem", back_populates="toplanti", cascade="all, delete-orphan", order_by="Gundem.sira")
    oylamalar = relationship("Oylama", back_populates="toplanti", cascade="all, delete-orphan")


class Gundem(Base):
    __tablename__ = "toplanti_gundem"

    id = Column(Integer, primary_key=True, index=True)
    toplanti_id = Column(Integer, ForeignKey("toplantilar.id"))
    baslik = Column(String)
    sira = Column(Integer, default=0)

    toplanti = relationship("Toplanti", back_populates="gundem")


class Oylama(Base):
    __tablename__ = "toplanti_oylamalari"

    id = Column(Integer, primary_key=True, index=True)
    toplanti_id = Column(Integer, ForeignKey("toplantilar.id"))
    konu = Column(String)
    secenekler = Column(Text)
    aktif = Column(Boolean, default=True)
    sonuc = Column(Text)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    toplanti = relationship("Toplanti", back_populates="oylamalar")
    oylar = relationship("Oy", back_populates="oylama", cascade="all, delete-orphan")


class Oy(Base):
    __tablename__ = "toplanti_oylari"

    id = Column(Integer, primary_key=True, index=True)
    oylama_id = Column(Integer, ForeignKey("toplanti_oylamalari.id"))
    kullanici_id = Column(Integer, ForeignKey("kullanicilar.id"))
    secim = Column(String)
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    oylama = relationship("Oylama", back_populates="oylar")
    kullanici = relationship("Kullanici")