#!/bin/bash
# Veri yedeğini paketler: DB + uploads.
# Çıktı: /root/koy-dernegi-data-YYYY-MM-DD.tar.gz
set -e

KOK=$(cd "$(dirname "$0")/.." && pwd)
CIKTI="${CIKTI:-$HOME/koy-dernegi-data-$(date +%F).tar.gz}"

cd "$KOK"

# DB dosyası volume içinde (/app/data) olduğundan sunucuda önce kopyalanır:
#   sudo docker cp koy-dernegi-backend:/app/data/koydernegi.db .
#   sudo docker cp koy-dernegi-backend:/app/data/uploads ./uploads
# Aşağıdaki tar, bu iki kopya varken çalışır.
tar -czf "$CIKTI" \
  koydernegi.db \
  uploads 2>/dev/null || true

echo "Yedek oluşturuldu: $CIKTI"
ls -lh "$CIKTI"