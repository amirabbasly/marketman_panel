#!/usr/bin/env bash
# Marketman CRM — یک دستور اجرا/بروزرسانی
set -e

echo ">>> دریافت آخرین کد..."
git pull origin main

echo ">>> ساخت و راه‌اندازی کانتینرها..."
docker compose up -d --build

echo ">>> انجام شد! پنل بازاریمن اجرا شد."
echo "   سایت: http://panel.marketmanai.ir  (از طریق nginx)"
echo "   بک‌اند: http://localhost:5000/api"
