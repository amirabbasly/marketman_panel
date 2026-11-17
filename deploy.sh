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
  echo ">>> فایل .env ساخته شد. در صورت نیاز ADMIN_PASSWORD را در آن تغییر دهید."
fi
echo ">>> دریافت آخرین کد از گیت..."
git pull --ff-only || echo "!! git pull انجام نشد (ادامه با کد فعلی)"
echo ">>> ساخت و راه‌اندازی کانتینرها (PostgreSQL + Backend + Frontend)..."
docker compose up -d --build
echo ">>> وضعیت سرویس‌ها:"
docker compose ps
echo ""
echo "✅ پنل مارکت‌من آماده است: https://panel.marketmanai.ir"
echo "   مدیر پیش‌فرض: مقادیر ADMIN_EMAIL / ADMIN_PASSWORD در فایل .env"
