# راهنمای کامل دیپلوی پنل CRM بازاریمن

دامنه سایت: **panel.marketmanai.ir**
مسیر سایت روی سرور: `/var/www/marketman_panel`

استک: **Next.js 14 (فرانت‌اند ریسپانسیو، فارسی/ RTL) + Node.js و Express (بک‌اند) + PostgreSQL + Docker + Nginx**

---

## ۱. پیش‌نیازهای سرور (اوبونتو ۲۰.۰۴ یا جدیدتر)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# نصب داکر
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# نصب داکر کامپوز
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

تأیید:
```bash
docker --version && docker compose version
```

---

## ۲. کلون پروژه روی سرور

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone <آدرس-שחاب-레پازیتوری> marketman_panel
cd marketman_panel
sudo chown -R $USER:$USER /var/www/marketman_panel
```

> این پروژه روی شاکه `arena/eaf3a447-marketman_panel` ساخته شده است.

---

## ۳. متغیرهای محیطی

```bash
cp .env.example .env
nano .env
```

مقادیر مهم:
- `JWT_SECRET`: یک رشته بلند و تصادفی (لازمه در محیط تولید تغییر یابد)
- `NEXT_PUBLIC_API_URL`: روی سرور با نginx مقدار `/api` است
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: حساب مدیر پیش‌فرض

---

## ۴. کانفیگ Nginx (سایت سوم کنار سایت‌های فعال شما)

```bash
sudo cp nginx/marketman.conf /etc/nginx/sites-available/marketman
sudo nano /etc/nginx/sites-available/marketman
# server_name اکنون panel.marketmanai.ir است (تغییری نیاز نیست)

sudo ln -s /etc/nginx/sites-available/marketman /etc/nginx/sites-enabled/marketman
sudo nginx -t
sudo systemctl reload nginx
```

نginx درخواست `/` را به Next.js (پورت ۳۰۰۰)، `/api` را به Express (پورت ۵۰۰۰) و `/uploads` را هم به بک‌اند می‌فرستد. هر دو پورت فقط روی `127.0.0.1` باز هستند.

---

## ۵. کلادفلر (Cloudflare)

۱. دامنه `marketmanai.ir` را به کلادفلر اضافه کنید (Add Site) و NS سرورهای ثبت‌نام دامنه را به NSهای کلادفلر تغییر دهید.
۲. منوی **DNS** → رکورد A بسازید:
   - نوع: `A`
   - نام: `panel` (برای ساب‌دامین panel.marketmanai.ir)
   - محتوا: آدرس IP سرور
   - Proxy status: **Proxied** (سبز/نقره‌ای)
۳. منوی **SSL/TLS** → **Overview**:
   - **Flexible**: ساده‌ترین حالت (بدون گواهینامه روی سرور) — برای شروع سریع recommand می‌شود.
   - **Full**: اگر گواهینامه SSL روی سرور دارید (مثلاً Certbot). در این geval نginx را به پورت ۴۴۳ و SSL تنظیم کنید (بخش commented در فایل nginx).

تأیید Auflösung:
```bash
ping panel.marketmanai.ir
curl -I http://panel.marketmanai.ir
```

---

## ۶. اجرا (یک دستور)

```bash
cd /var/www/marketman_panel
chmod +x deploy.sh
./deploy.sh
```

`deploy.sh` این کارها را می‌کند:
1. `git pull` آخرین کد
2. `docker compose up -d --build` — ساخت PostgreSQL، بک‌اند، فرانت‌اند

بعد از اجرا:
- سایت: `http://panel.marketmanai.ir`
- حساب مدیر پیش‌فرض: `admin@marketman.ir` / `12345678` (بعد از اولین ورود تغییر دهید)

---

## ۷. بروزرسانی (فقط یک دستور)

هر بار که کد جدید 푸ش شد:
```bash
cd /var/www/marketman_panel
./deploy.sh
```
یا به صورت دستی:
```bash
git pull origin main
docker compose up -d --build
```

---

## ۸. دستورات مدیریت

```bash
# لاگ‌های زنده همه سرویس‌ها
docker compose logs -f

# لاگ فقط بک‌اند
docker compose logs -f backend

# ریستارت همه سرویس‌ها
docker compose restart

# ورود به کنسول دیتابیس
docker exec -it marketman_db psql -U marketman -d marketman

# بکاپ دیتابیس
docker exec marketman_db pg_dump -U marketman marketman > backup_$(date +%F).sql

# بازگردانی بکاپ
cat backup_YYYY-MM-DD.sql | docker exec -i marketman_db psql -U marketman -d marketman
```

---

## ۹. قابلیت‌های پنل

**صفحه ورود:** انتخاب نقش (مدیر / اپراتور)

**مدیر:**
- ایجاد اپراتور: نام، نام خانوادگی، کد ملی، عکس کارت ملی/شناسنامه، تاریخ تولد، تلفن، رمز عبور (قابل ویرایش)
- لیست اپراتورها و ویرایش اطلاعاتشان
- تایید / رد درخواست تغییرات اپراتورها
- ثبت لیست مشتریان روزانه (نام برند، نام شخص، آدرس، شهر، حوزه فعالیت، توضیحات، تلفن)
- دیشبورد آماری: بیشترین فروش و کنسلی به حوزه فعالیت، برترین و ضعیف‌ترین اپراتور، شهرهای فعال، درآمد و نرخ تبدیل

**اپراتور:**
- مشاهده لیست مشتریان
- دکمه «تماس گرفتـم» → مودال (توضیحات، مبلغ پیشنهادی اختیاری، تایید/لغو)
- درخواست تغییر اطلاعات شخصی (نیاز به تایید مدیر)
- پروفایل نمایشی (غیرقابل ویرایش مستقیم)

---

با تشکر از استفاده از پنل CRM بازاریمن 🚀
