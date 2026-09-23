#!/bin/bash

echo "== Köy Derneği Web Portalı =="

cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
  echo "Backend venv oluşturuluyor..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt

echo "Backend başlatılıyor (http://localhost:8000)..."
(uvicorn main:app --host 127.0.0.1 --port 8000 &> /tmp/koydernegi-backend.log &) &

cd ../frontend
if [ ! -d "node_modules" ]; then
  echo "Frontend bağımlılıkları yükleniyor..."
  npm install
fi

echo "Frontend başlatılıyor (http://localhost:5173)..."
npm run dev &> /tmp/koydernegi-frontend.log &

echo ""
echo "Web portalı hazır: http://localhost:5173"
echo "API: http://localhost:8000 (dokümantasyon: /docs)"
echo ""
echo "Yönetici giriş bilgileri:"
echo "  E-posta: ahmet@koyumegonul.org"
echo "  Şifre:   admin123"