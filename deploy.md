# راهنمای دیپلوی پنل CRM مارکت‌من (Marketman)

- **دامنه:** `panel.marketmanai.ir`
- **مسیر روی سرور:** `/var/www/marketman_panel` (کنار دو سایت دیگر شما؛ هیچ تداخلی ندارد، چون فقط پورت‌های داخلی **3001 (فرانت) / 5100 (بک‌اند) / 5433 (دیتابیس)** روی `127.0.0.1` استفاده می‌شود تا با سایت‌های دیگر (که معمولاً 3000/5000 هستند) تداخل نکند)
- **استک:** Next.js 14 + Node.js/Express + PostgreSQL 15 + Docker Compose + Nginx + Cloudflare
- **ریپو:** https://github.com/amirabbasly/marketman_panel

---

## ۱) پیش‌نیاز سرور (فقط یک‌بار)

```bash
sudo apt update && sudo apt install -y curl git nginx
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
docker --version && docker compose version
```

## ۲) کلون پروژه

```bash
cd /var/www
sudo git clone https://github.com/amirabbasly/marketman_panel.git marketman_panel
cd marketman_panel
sudo chown -R $USER:$USER /var/www/marketman_panel
```

## ۳) اجرا — فقط یک دستور 🚀

```bash
./deploy.sh
```

این اسکریپت به‌صورت **خودکار**: فایل `.env` را می‌سازد + یک `JWT_SECRET` تصادفی امن تولید می‌کند + آخرین کد را از گیت می‌گیرد + هر سه کانتینر (دیتابیس، بک‌اند، فرانت‌اند) را می‌سازد و بالا می‌آورد. دیتابیس و جداول و حساب مدیر پیش‌فرض هم خودکار ساخته می‌شوند.

> قبل از اجرا، در صورت تمایل `ADMIN_PASSWORD` و `POSTGRES_PASSWORD` را در `.env` عوض کنید.
> ورود مدیر: `admin@marketman.ir` / رمز داخل `.env` (پیش‌فرض `admin123456`) — بعد از اولین ورود از بخش مدیریت اپراتورها رمز را عوض کنید.

## ۴) آپدیت — فقط یک دستور 🔄

```bash
cd /var/www/marketman_panel && ./deploy.sh
```

## ۵) Nginx (سایت سوم کنار سایت‌های فعلی)

```bash
sudo cp nginx/marketman.conf /etc/nginx/sites-available/marketman
sudo ln -s /etc/nginx/sites-available/marketman /etc/nginx/sites-enabled/marketman
sudo nginx -t && sudo systemctl reload nginx
```

Nginx: درخواست `/` ← Next.js ‏(3001)، `/api` و `/uploads` ← Express ‏(5100). این پورت‌ها از `FRONTEND_PORT` و `BACKEND_PORT` در `.env` خوانده می‌شوند؛ اگر عوضشان کردید، `proxy_pass`های فایل nginx را هم به همان پورت‌ها تغییر دهید.

## ۶) Cloudflare

1. در پنل کلادفلر برای دامنه `marketmanai.ir`: ‏**DNS → Add record**
   - Type: `A` — Name: `panel` — Content: آی‌پی سرور شما — Proxy: **Proxied (نارنجی)** ✅
2. **SSL/TLS → Overview** را روی **Full** بگذارید و روی سرور گواهی بگیرید:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d panel.marketmanai.ir
   ```
   (اگر فعلاً گواهی نمی‌خواهید، موقتاً حالت **Flexible** هم کار می‌کند.)

## ۷) خطای «address already in use» (پورت اشغال است)

یعنی آن پورت روی سرور قبلاً توسط سایت/سرویس دیگری گرفته شده است. پیدا کنید چه چیزی روی پورت است:

```bash
sudo ss -tlnp | grep -E '3001|5100|5433'
docker ps   # اگر کانتینر قدیمی همین پروژه بود: docker compose down و دوباره ./deploy.sh
```

راه‌حل دائمی: در فایل `.env` پورت آزاد دیگری بگذارید (مثلاً `FRONTEND_PORT=3200`)، همان پورت را در `nginx/marketman.conf` هم عوض کنید و دوباره اجرا کنید:

```bash
nano .env                       # FRONTEND_PORT / BACKEND_PORT / DB_PORT
sudo nano /etc/nginx/sites-available/marketman   # proxy_pass ها را هماهنگ کنید
./deploy.sh && sudo nginx -t && sudo systemctl reload nginx
```

## ۸) خطای 502 Bad Gateway

یعنی nginx سالم است ولی به بک‌اند/فرانت‌اند نمی‌رسد. قدم‌به‌قدم:

```bash
cd /var/www/marketman_panel
docker compose ps                          # هر سه کانتینر باید Up باشند
curl http://127.0.0.1:5100/api/health      # بک‌اند مستقیم: باید {"ok":true} بدهد
curl -I http://127.0.0.1:3001              # فرانت مستقیم: باید 200 بدهد
grep -n proxy_pass /etc/nginx/sites-available/marketman   # باید 3001 و 5100 باشند
```

- اگر `curl` مستقیم جواب نداد → کانتینر پایین است: `docker compose logs --tail=80 backend` علت را نشان می‌دهد؛ بعد `./deploy.sh` را دوباره بزنید (اسکریپت خودش سلامت سرویس‌ها را چک و لاگ چاپ می‌کند).
- اگر مستقیم جواب داد ولی از دامنه 502 بود → کانفیگ nginx روی سرور قدیمی است؛ `./deploy.sh` جدید آن را خودکار نصب و ریلود می‌کند (اگر دسترسی sudo بدون رمز داشته باشد)، وگرنه دستوراتی که در انتهای اسکریپت چاپ می‌شود را دستی اجرا کنید:

```bash
sudo cp nginx/marketman.conf /etc/nginx/sites-available/marketman
sudo nginx -t && sudo systemctl reload nginx
```

## ۹) دستورات کاربردی

```bash
docker compose ps                     # وضعیت سرویس‌ها
docker compose logs -f backend        # لاگ بک‌اند
docker compose restart                # ری‌استارت
docker exec marketman_db pg_dump -U marketman marketman > backup_$(date +%F).sql   # بکاپ دیتابیس
```

## قابلیت‌های پنل

**ورود:** دو حالت «مدیر» و «اپراتور» (نقش در سرور هم بررسی می‌شود؛ اپراتور با شماره تماس + رمز وارد می‌شود).

**مدیر:** ساخت/ویرایش اپراتور (نام، نام خانوادگی، کد ملی، عکس کارت ملی/شناسنامه، تاریخ تولد، شماره تماس، رمز) • تایید/رد درخواست تغییر اطلاعات اپراتورها • ثبت لیست روزانه مشتریان (نام برند، نام شخص، آدرس، شهر، حوزه فعالیت، توضیحات، شماره تماس) با جستجو و فیلتر • داشبورد آماری کامل: بیشترین/کمترین فروش و کنسلی بر اساس حوزه فعالیت، بهترین و ضعیف‌ترین اپراتور، پرفروش‌ترین/کم‌فروش‌ترین شهر، مبلغ پیشنهادی کل و نرخ تبدیل + نمودار.

**اپراتور:** فقط مشاهده اطلاعات خودش (بدون امکان ویرایش؛ تغییر فقط با «درخواست تغییر» و تایید مدیر) • مشاهده لیست مشتریان امروز • دکمه «تماس گرفتم» برای هر ردیف → مودال با توضیحات + مبلغ پیشنهادی (اختیاری) + دکمه‌های تایید/کنسل، و آیتم بلافاصله آپدیت می‌شود.

## صفحات و ماژول‌های جدید

- **قوانین و کسب درآمد** (`/rules`، اپراتور): متن کامل همکاری، مدل‌های درآمدی، ساعت کاری، مرخصی، وظایف و قوانین + آدرس و تلفن‌های مجموعه.
- **لیگ و سطوح فروش** (`/league`): سطح خودکار بر اساس فروش ماه شمسی (برنزی تا الماس، ۵ تا ۲۰ میلیون تومان به‌ازای هر پروژه)، رتبه‌بندی ماه، کارشناس فروش برتر هفته (بنر بالای همه صفحات اپراتور) و امکان تنظیم دستی سطح توسط مدیر.
- **اختصاص مشتری** (`/assignments`، مدیر): ثبت مشتری «اختصاصی» برای یک اپراتور مشخص، یا «آزاد» که به‌صورت مودال برای همه اپراتورها می‌رود و اولین قبول‌کننده صاحب آن می‌شود؛ آزاد کردن یا اختصاص دستی مشتری‌ها هم از همین صفحه است.
- **مشتریان اختصاصی من** (`/my-customers`، اپراتور): لیست اختصاصی هر اپراتور.
- **شماره‌گیر** (`/dialer`): صفحه‌کلید شماره‌گیر (فعلاً فقط UI با برچسب «ماژول در حال تکمیل است»).
- **کاربران سیستم** (`/operators`): مدیر همه کاربران (مدیر و اپراتور) را می‌بیند و نام کاربری و رمز عبور را مستقیم و بدون درخواست تغییر می‌دهد.
- همه تاریخ‌ها و ساعت‌ها در پنل شمسی (fa-IR) نمایش داده می‌شوند.

## عیب‌یابی: دامنه باز می‌شود ولی سایت دیگری نمایش داده می‌شود

کانتینرها سالم‌اند ولی `panel.marketmanai.ir` سایت دیگری را نشان می‌دهد؟ قدم‌به‌قدم:

```bash
# ۱) آیا nginx روی خود سرور برای این دامنه همین پنل را می‌دهد؟
curl -s -H "Host: panel.marketmanai.ir" http://127.0.0.1/ | head -c 300
# باید HTML پنل مارکت‌من (Next.js) برگردد.

# ۲) کدام سایت‌ها روی سرور فعال‌اند و server_name ها چیست؟
sudo nginx -T | grep -n "server_name"
ls -la /etc/nginx/sites-enabled/
```

- اگر تست قدم ۱ **پنل ما** را داد ولی از اینترنت سایت دیگری باز می‌شود → مشکل از DNS/Cloudflare است: رکورد `A` برای `panel` باید به آی‌پی همین سرور باشد. همچنین اگر SSL کلادفلر روی **Full** است، کلادفلر به پورت **443** سرور وصل می‌شود و چون برای این ساب‌دامین روی سرور 443 تعریف نشده، سایت پیش‌فرض دیگری جواب می‌دهد. راه‌حل: `sudo certbot --nginx -d panel.marketmanai.ir` (گواهی + ساخت خودکار 443) یا موقتاً گذاشتن SSL روی **Flexible**.
- اگر تست قدم ۱ هم **سایت دیگری** را داد → یک کانفیگ دیگر در nginx به‌عنوان پیش‌فرض (`default_server`) یا با همین `server_name` زودتر لود می‌شود؛ فایل‌های `sites-enabled` را بررسی و مورد تکراری/پیش‌فرض را اصلاح کنید، بعد: `sudo nginx -t && sudo systemctl reload nginx`
