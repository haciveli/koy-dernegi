#!/bin/bash
# Sunucuya ilk kurulum scripti (Docker Compose tabanlı).
# Kullanım: sudo bash kur.sh sunucu-alanadi.com
# NOT: Çalıştırılırken nginx henüz AÇIK OLMAMALI (80 portu certbot'a ait).
set -e

ALAN_ADI="${1:?Kullanım: sudo bash $(basename "$0") alanadi.com}"
KOK=$(cd "$(dirname "$0")/.." && pwd)   # paket kökü (backend/ + deploy/ + frontend/ yan yana)
COMPOSE="-f $KOK/deploy/docker-compose.yml"

echo "== 1/4: Docker kuruluyor (yoksa) =="
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
if ! command -v docker compose >/dev/null 2>&1; then
  apt-get update -y && apt-get install -y docker-compose-plugin
fi

echo "== 2/4: nginx SSL config alan adı ile güncelleniyor =="
sed -i "s/DOMAIN_ADINIZ/$ALAN_ADI/g; s/server_name _;/server_name $ALAN_ADI;/" "$KOK/deploy/nginx-ssl.conf"

echo "== 3/4: SSL sertifikası alınıyor (standalone, 80 portu boşken) =="
cd "$KOK"
docker compose $COMPOSE run --rm --service-ports certbot certonly --standalone \
  --email "admin@$ALAN_ADI" --agree-tos --no-eff-email -d "$ALAN_ADI"

echo "== 4/4: Tüm servisler başlatılıyor (nginx + backend) =="
docker compose $COMPOSE up -d --build

# Veri aktarımı (opsiyonel): paket kökünde koy-dernegi-data.tar.gz varsa
# DB ve uploads otomatik kopyalanır.
VERI_TAR="$KOK/koy-dernegi-data.tar.gz"
if [ -f "$VERI_TAR" ]; then
  echo "== Veri yedeği bulundu, aktarılıyor =="
  mkdir -p /tmp/koy-data
  tar -xzf "$VERI_TAR" -C /tmp/koy-data
  if [ -f /tmp/koy-data/backend/koydernegi.db ]; then
    docker compose $COMPOSE exec -T backend sh -c 'cat > /app/data/koydernegi.db' \
      < /tmp/koy-data/backend/koydernegi.db
    echo "Veritabanı aktarıldı."
  fi
  if [ -d /tmp/koy-data/backend/uploads ] && [ "$(ls -A /tmp/koy-data/backend/uploads 2>/dev/null)" ]; then
    tar -C /tmp/koy-data/backend/uploads -cf - . \
      | docker compose $COMPOSE exec -T backend sh -c 'mkdir -p /app/data/uploads && tar -C /app/data/uploads -xf -'
    echo "Uploads aktarıldı."
  fi
  rm -rf /tmp/koy-data
  echo "== Backend yeniden başlatılıyor (veri yüklenmiş olarak) =="
  docker compose $COMPOSE restart backend
fi

echo
echo "Kurulum tamam. Site: https://$ALAN_ADI"
echo "Doğrulama: curl -I https://$ALAN_ADI"
echo "Yönetim paneli: https://$ALAN_ADI/yonetim"