#!/usr/bin/env bash
# Marketman CRM — اجرا / آپدیت با یک دستور:  ./deploy.sh
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo ">>> ساخت خودکار فایل .env ..."
  cp .env.example .env
  if command -v openssl >/dev/null 2>&1; then
    SECRET=$(openssl rand -hex 32)
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${SECRET}|" .env || true
  fi
  echo ">>> فایل .env ساخته شد. در صورت نیاز ADMIN_PASSWORD و پورت‌ها را در آن تغییر دهید."
fi

# خواندن پورت‌ها از .env (با همان پیش‌فرض‌های docker-compose)
FRONTEND_PORT=$(grep -E '^FRONTEND_PORT=' .env | cut -d= -f2); FRONTEND_PORT=${FRONTEND_PORT:-3001}
BACKEND_PORT=$(grep -E '^BACKEND_PORT=' .env | cut -d= -f2); BACKEND_PORT=${BACKEND_PORT:-5100}

# هماهنگ‌کردن خودکار پورت‌های nginx با .env (اولین proxy_pass = فرانت، بقیه = بک‌اند؛ خطوط کامنت دست نمی‌خورند)
awk -v fe="$FRONTEND_PORT" -v be="$BACKEND_PORT" '
  $0 !~ /^[[:space:]]*#/ && /proxy_pass http:\/\/127\.0\.0\.1:/ { n++; if (n==1) sub(/:[0-9]+;/, ":" fe ";"); else sub(/:[0-9]+;/, ":" be ";") }
  { print }' nginx/marketman.conf > nginx/marketman.conf.tmp && mv nginx/marketman.conf.tmp nginx/marketman.conf

echo ">>> دریافت آخرین کد از گیت..."
git pull --ff-only || echo "!! git pull انجام نشد (ادامه با کد فعلی)"

echo ">>> ساخت و راه‌اندازی کانتینرها (PostgreSQL + Backend + Frontend)..."
if ! docker compose up -d --build; then
  echo ""
  echo "❌ خطا در بالا آمدن کانتینرها — اگر خطای «address already in use» دیدید،"
  echo "   یعنی یکی از پورت‌های ${FRONTEND_PORT} (فرانت) / ${BACKEND_PORT} (بک‌اند) روی سرور اشغال است."
  echo "   پورت اشغال را پیدا کنید:   sudo ss -tlnp | grep -E '${FRONTEND_PORT}|${BACKEND_PORT}'"
  echo "   سپس در فایل .env پورت آزاد دیگری بگذارید و دوباره ./deploy.sh را اجرا کنید"
  echo "   (پورت‌های nginx به‌صورت خودکار با .env هماهنگ می‌شوند)."
  exit 1
fi

echo ">>> وضعیت سرویس‌ها:"
docker compose ps
echo ""
echo "✅ پنل مارکت‌من آماده است: https://panel.marketmanai.ir"
echo "   فرانت‌اند: http://127.0.0.1:${FRONTEND_PORT}   بک‌اند: http://127.0.0.1:${BACKEND_PORT}/api/health"
echo "   مدیر پیش‌فرض: مقادیر ADMIN_EMAIL / ADMIN_PASSWORD در فایل .env"
