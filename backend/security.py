from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "koydernegi-gizli-anahtar-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def sifre_hash_olustur(sifre: str) -> str:
    return pwd_context.hash(sifre)


def sifre_dogrula(duz_sifre: str, hash_sifre: str) -> bool:
    return pwd_context.verify(duz_sifre, hash_sifre)


def token_olustur(data: dict, expires_delta: Optional[timedelta] = None, surum: int = 1) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "surum": surum})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def token_dogrula(token: str, credentials_exception) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        kullanici_id: int = payload.get("sub")
        if kullanici_id is None:
            raise credentials_exception
        return {"user_id": int(kullanici_id), "surum": payload.get("surum", 1)}
    except JWTError:
        raise credentials_exception