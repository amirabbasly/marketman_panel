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

echo ">>> دریافت آخرین کد از گیت..."
git pull --ff-only || echo "!! git pull انجام نشد (ادامه با کد فعلی)"

# خواندن پورت‌ها از .env (با همان پیش‌فرض‌های docker-compose)
FRONTEND_PORT=$(grep -E '^FRONTEND_PORT=' .env | cut -d= -f2); FRONTEND_PORT=${FRONTEND_PORT:-3001}
BACKEND_PORT=$(grep -E '^BACKEND_PORT=' .env | cut -d= -f2); BACKEND_PORT=${BACKEND_PORT:-5100}
DB_PORT=$(grep -E '^DB_PORT=' .env | cut -d= -f2); DB_PORT=${DB_PORT:-5433}

# هماهنگ‌کردن خودکار پورت‌های nginx داخل ریپو با .env (اولین proxy_pass = فرانت، بقیه = بک‌اند)
awk -v fe="$FRONTEND_PORT" -v be="$BACKEND_PORT" '
  $0 !~ /^[[:space:]]*#/ && /proxy_pass http:\/\/127\.0\.0\.1:/ { n++; if (n==1) sub(/:[0-9]+;/, ":" fe ";"); else sub(/:[0-9]+;/, ":" be ";") }
  { print }' nginx/marketman.conf > nginx/marketman.conf.tmp && mv nginx/marketman.conf.tmp nginx/marketman.conf

echo ">>> ساخت و راه‌اندازی کانتینرها (PostgreSQL + Backend + Frontend)..."
if ! docker compose up -d --build; then
  echo ""
  echo "❌ خطا در بالا آمدن کانتینرها — اگر خطای «address already in use» دیدید،"
  echo "   یعنی یکی از پورت‌های ${FRONTEND_PORT} (فرانت) / ${BACKEND_PORT} (بک‌اند) / ${DB_PORT} (دیتابیس) روی سرور اشغال است."
  echo "   پورت اشغال را پیدا کنید:   sudo ss -tlnp | grep -E '${FRONTEND_PORT}|${BACKEND_PORT}|${DB_PORT}'"
  echo "   سپس در فایل .env پورت آزاد دیگری بگذارید و دوباره ./deploy.sh را اجرا کنید."
  exit 1
fi

# ---------- بررسی سلامت سرویس‌ها (جلوگیری از 502 مبهم) ----------
echo ">>> بررسی سلامت بک‌اند و فرانت‌اند..."
BACKEND_OK=0; FRONTEND_OK=0
for i in $(seq 1 45); do
  if [ "$BACKEND_OK" = 0 ] && curl -sf "http://127.0.0.1:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then BACKEND_OK=1; echo "   ✔ بک‌اند سالم است (پورت ${BACKEND_PORT})"; fi
  if [ "$FRONTEND_OK" = 0 ] && curl -sf "http://127.0.0.1:${FRONTEND_PORT}/login" >/dev/null 2>&1; then FRONTEND_OK=1; echo "   ✔ فرانت‌اند سالم است (پورت ${FRONTEND_PORT})"; fi
  [ "$BACKEND_OK" = 1 ] && [ "$FRONTEND_OK" = 1 ] && break
  sleep 2
done

if [ "$BACKEND_OK" = 0 ] || [ "$FRONTEND_OK" = 0 ]; then
  echo ""
  echo "❌ یکی از سرویس‌ها بالا نیامد (بک‌اند: ${BACKEND_OK} / فرانت‌اند: ${FRONTEND_OK}) — آخرین لاگ‌ها:"
  docker compose ps || true
  echo "----- لاگ بک‌اند -----";  docker compose logs --tail=60 backend  || true
  echo "----- لاگ فرانت‌اند -----"; docker compose logs --tail=30 frontend || true
  echo ""
  echo "راهنما: علت خطا در لاگ‌های بالا مشخص است. بعد از رفع آن، دوباره ./deploy.sh را اجرا کنید."
  exit 1
fi

# ---------- هماهنگ‌کردن خودکار nginx روی سرور ----------
if [ -d /etc/nginx/sites-available ] && sudo -n true 2>/dev/null; then
  echo ">>> نصب/به‌روزرسانی کانفیگ nginx و ریلود..."
  if sudo test -f /etc/nginx/sites-available/marketman && sudo grep -q "ssl_certificate" /etc/nginx/sites-available/marketman; then
    # گواهی SSL (certbot) روی کانفیگ نصب‌شده هست؛ آن را پاک نمی‌کنیم، فقط پورت‌ها را هماهنگ می‌کنیم
    echo "   (گواهی SSL روی کانفیگ فعلی هست؛ فقط پورت‌ها به‌روز می‌شوند تا HTTPS از کار نیفتد)"
    # روش ساده و مطمئن: همه proxy_pass ها را بر اساس ترتیب (اول فرانت، بقیه بک‌اند) تنظیم کن
    sudo awk -v fe="$FRONTEND_PORT" -v be="$BACKEND_PORT" '
      $0 !~ /^[[:space:]]*#/ && /proxy_pass http:\/\/127\.0\.0\.1:/ { n++; if (n==1) sub(/:[0-9]+;/, ":" fe ";"); else sub(/:[0-9]+;/, ":" be ";") }
      { print }' /etc/nginx/sites-available/marketman > /tmp/marketman.nginx
    sudo cp /tmp/marketman.nginx /etc/nginx/sites-available/marketman
  else
    sudo cp nginx/marketman.conf /etc/nginx/sites-available/marketman
  fi
  sudo ln -sf /etc/nginx/sites-available/marketman /etc/nginx/sites-enabled/marketman
  if sudo nginx -t; then
    sudo systemctl reload nginx && echo "   ✔ nginx ریلود شد"
  else
    echo "   !! تست nginx ناموفق بود؛ خروجی خطای بالا را بررسی کنید (کانفیگ قبلی دست نخورده است)"
  fi
else
  echo ">>> نکته: برای هماهنگی nginx این دستورات را یک‌بار با sudo اجرا کنید:"
  echo "   sudo cp nginx/marketman.conf /etc/nginx/sites-available/marketman"
  echo "   sudo ln -sf /etc/nginx/sites-available/marketman /etc/nginx/sites-enabled/marketman"
  echo "   sudo nginx -t && sudo systemctl reload nginx"
fi

# ---------- بررسی اینکه دامنه واقعاً به همین پنل می‌رسد ----------
echo ">>> بررسی پاسخ nginx برای دامنه panel.marketmanai.ir روی خود سرور..."
DOMAIN_HTML=$(curl -s -m 10 -H "Host: panel.marketmanai.ir" http://127.0.0.1/ || true)
if echo "$DOMAIN_HTML" | grep -qi "marketman\|مارکت"; then
  echo "   ✔ nginx برای این دامنه همین پنل را سرو می‌کند"
else
  echo "   !! هشدار: nginx روی این سرور برای دامنه panel.marketmanai.ir پاسخ این پنل را نداد."
  echo "      یعنی یک سایت دیگر به‌عنوان پیش‌فرض جواب می‌دهد. این موارد را بررسی کنید:"
  echo "      1) sudo nginx -T | grep -n server_name     (ببینید panel.marketmanai.ir چند بار و کجا تعریف شده)"
  echo "      2) ls /etc/nginx/sites-enabled/            (فایل تکراری یا default را اصلاح کنید)"
  echo "      3) اگر در Cloudflare حالت SSL روی Full است، کلادفلر به پورت 443 سرور می‌رود؛"
  echo "         برای این ساب‌دامین گواهی بگیرید: sudo certbot --nginx -d panel.marketmanai.ir"
  echo "         یا موقتاً در Cloudflare حالت SSL را Flexible بگذارید."
fi

echo ""
echo ">>> وضعیت نهایی سرویس‌ها:"
docker compose ps
echo ""
echo "✅ پنل مارکت‌من آماده است: https://panel.marketmanai.ir"
echo "   فرانت‌اند: http://127.0.0.1:${FRONTEND_PORT}   بک‌اند: http://127.0.0.1:${BACKEND_PORT}/api/health"
echo "   مدیر پیش‌فرض: مقادیر ADMIN_EMAIL / ADMIN_PASSWORD در فایل .env"
