'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Wallet, Clock, Palmtree, ListChecks, Scale, TrendingUp, MapPin, PhoneCall, Globe } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-ink-900 via-ink-950 to-brand-900 p-7 text-white shadow-card sm:p-9">
        <Badge variant="success" className="mb-4">همکاری با مارکت‌من</Badge>
        <h1 className="text-2xl font-black leading-9 sm:text-3xl sm:leading-[3rem]">کسب درآمد و قوانین همکاری با مارکت‌من</h1>
        <p className="mt-3 text-base font-bold text-brand-300">آینده شغلی شما می‌تواند فراتر از یک حقوق ثابت باشد!</p>
        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          <p>در مارکت‌من، ما به دنبال ساختن یک تیم حرفه‌ای، متخصص و نتیجه‌محور هستیم. اعتقاد داریم درآمد افراد باید متناسب با توانایی، عملکرد و ارزشی باشد که برای مجموعه و مشتریان ایجاد می‌کنند.</p>
          <p>همکاری با مارکت‌من فقط یک موقعیت شغلی معمولی نیست؛ بلکه فرصتی برای فعالیت در یک مجموعه فعال در حوزه فناوری اطلاعات، توسعه کسب‌وکار، بازاریابی دیجیتال و فروش خدمات تخصصی است.</p>
          <p>ما به جای فروش وعده‌های غیرواقعی، روی پروژه‌های واقعی، زیرساخت تخصصی و نتیجه قابل اندازه‌گیری تمرکز داریم.</p>
        </div>
      </div>

      <Section n="۱" title="مارکت‌من چه مجموعه‌ای است؟" icon={<Globe className="h-5 w-5" />}>
        <p>مارکت‌من یک مجموعه فعال در حوزه فناوری اطلاعات، برنامه‌نویسی و توسعه کسب‌وکارهای دیجیتال است که خدمات خود را به بازار ایران و بازارهای بین‌المللی ارائه می‌دهد.</p>
        <p>تا امروز بیش از <b>۱۲۰ پروژه فعال و لانچ‌شده</b> در کارنامه مجموعه قرار گرفته است که برای کسب‌وکارها و شرکت‌های مختلف در بازار ایران و بین‌المللی اجرا شده‌اند.</p>
        <p>حوزه فعالیت ما محدود به طراحی سایت نیست. خدمات مارکت‌من از مرحله تحلیل و طراحی زیرساخت تا توسعه نرم‌افزار، طراحی سایت و اپلیکیشن، بازاریابی دیجیتال و توسعه فروش را شامل می‌شود.</p>
        <p className="font-bold text-slate-800">مزیت رقابتی ما چیست؟</p>
        <ul className="list-inside space-y-1.5">
          {['تضمین فروش برای پروژه‌های واجد شرایط بر اساس پلن اجرایی و توافق همکاری','تضمین کف قیمت در کنار بالاترین کیفیت اجرایی','توسعه اختصاصی وب‌سایت و اپلیکیشن','طراحی و پیاده‌سازی زیرساخت‌های نرم‌افزاری و سیستم‌های مدیریتی','خدمات تخصصی سئو و بازاریابی دیجیتال','ارائه راهکارهای افزایش فروش و توسعه کسب‌وکار','پشتیبانی و همراهی در مسیر رشد کسب‌وکار مشتریان'].map((x) => <li key={x}>✔ {x}</li>)}
        </ul>
        <p className="rounded-2xl bg-brand-50 px-4 py-3 font-bold text-brand-800 ring-1 ring-brand-100">هدف ما صرفاً تحویل یک وب‌سایت یا اپلیکیشن نیست؛ هدف ما تبدیل پروژه مشتری به یک کسب‌وکار درآمدزا است.</p>
        <p className="font-bold text-slate-800">پروژه انحصاری خودروچاره</p>
        <p>در حال حاضر تمرکز انحصاری مجموعه روی توسعه و گسترش پروژه <b>خودروچاره</b> است؛ یک پلتفرم جامع در حوزه خودرو که زنجیره‌ای از خدمات این بازار را پوشش می‌دهد؛ از واردات خودرو و تأمین قطعات گرفته تا خدمات امدادی، تعمیرات، حمل خودرو و سایر نیازهای مالکین خودرو.</p>
        <p>این پروژه با هدف ایجاد یک زیرساخت یکپارچه برای بازار خودرو در حال توسعه است و یکی از مهم‌ترین ظرفیت‌های رشد و فروش مجموعه محسوب می‌شود.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href="https://khodrochare.ir" target="_blank" rel="noreferrer" className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-ink-800">🌐 khodrochare.ir — پروژه خودروچاره</a>
          <a href="https://marketmanai.ir" target="_blank" rel="noreferrer" className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700">🌐 marketmanai.ir — وب‌سایت مارکت‌من</a>
        </div>
      </Section>

      <Section n="۲" title="روش‌های کسب درآمد" icon={<Wallet className="h-5 w-5" />}>
        <p>در مارکت‌من دو مسیر اصلی برای کسب درآمد در نظر گرفته شده است. شما می‌توانید متناسب با شرایط همکاری و عملکرد خود از این مدل‌ها استفاده کنید.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="font-black text-slate-900">مدل اول: درآمد ثابت + مزایا</p>
            <p className="mt-2">در این مدل، شما علاوه بر دریافت حقوق ثابت ماهانه، از مزایای شغلی و پاداش عملکرد نیز برخوردار خواهید شد:</p>
            <ul className="mt-2 list-inside space-y-1.5"><li>✔ حقوق ثابت ماهانه: <b>۲۲ میلیون تومان</b></li><li>✔ بیمه</li><li>✔ پاداش عملکرد</li><li>✔ امکان دریافت پاداش‌های مرتبط با فروش</li></ul>
            <p className="mt-2 text-slate-500">این مدل برای افرادی مناسب است که به دنبال درآمد ماهانه مشخص در کنار فعالیت حرفه‌ای و مستمر هستند.</p>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
            <p className="font-black text-slate-900">مدل دوم: درآمد مبتنی بر فروش و عملکرد</p>
            <p className="mt-2">در این مدل، درآمد شما مستقیماً به میزان فروش و عملکردتان وابسته است. به ازای هر فروش موفق، بسته به نوع پکیج و شرایط پروژه، مبلغی بین <b>۵ تا ۸ میلیون تومان</b> سهم درآمدی شماست.</p>
            <p className="mt-2 text-slate-500">میزان دقیق درآمد به نوع پکیج‌های فروخته‌شده و نرخ کمیسیون هرکدام بستگی دارد.</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table><thead><tr><th>تعداد فروش موفق</th><th>درآمد قابل محاسبه</th></tr></thead>
          <tbody>
            <tr><td>۱ فروش</td><td className="font-bold">۵ تا ۸ میلیون تومان</td></tr>
            <tr><td>۳ فروش</td><td className="font-bold">۱۵ تا ۲۴ میلیون تومان</td></tr>
            <tr><td>۵ فروش</td><td className="font-bold">۲۵ تا ۴۰ میلیون تومان</td></tr>
            <tr><td>۱۰ فروش</td><td className="font-bold text-brand-700">تا ۸۰ میلیون تومان</td></tr>
          </tbody></table>
        </div>
        <p className="rounded-2xl bg-amber-50 px-4 py-3 font-bold text-amber-800 ring-1 ring-amber-100">با فروش تنها ۱۰ پکیج، امکان کسب درآمد ۸۰ میلیون تومانی وجود دارد.</p>
        <p className="flex items-center gap-2 font-bold text-slate-800"><Trophy className="h-4 w-4 text-amber-500" /> سیستم درآمدی لیگ و سطح کاربری</p>
        <p>علاوه بر درآمد مبتنی بر فروش، در مارکت‌من سیستم سطح‌بندی و لیگ عملکرد نیز فعال است. با افزایش سطح حساب کاربری و ارتقای جایگاه شما، نرخ تبدیل عملکرد به درآمد نیز افزایش پیدا می‌کند؛ افراد فعال و موفق می‌توانند با ارتقای سطح خود از نرخ‌های درآمدی بالاتری بهره‌مند شوند.</p>
        <p className="rounded-2xl bg-violet-50 px-4 py-3 font-bold text-violet-800 ring-1 ring-violet-100">درآمد پروژه‌ای در سطوح بالاتر می‌تواند تا سقف ۲۰ میلیون تومان به ازای هر پروژه برسد.</p>
        <p>این سیستم با هدف ایجاد انگیزه، رقابت سالم و افزایش درآمد متناسب با عملکرد طراحی شده است. <Link href="/league" className="font-bold text-brand-700 underline">مشاهده لیگ و سطح فعلی شما ←</Link></p>
      </Section>

      <Section n="۳" title="ساعت کاری و برنامه حضور" icon={<Clock className="h-5 w-5" />}>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table><thead><tr><th>روز هفته</th><th>ساعت کاری</th></tr></thead>
          <tbody>
            {[['شنبه','۹:۰۰ تا ۱۶:۰۰'],['یکشنبه','۹:۰۰ تا ۱۶:۰۰'],['دوشنبه','۹:۰۰ تا ۱۶:۰۰'],['سه‌شنبه','۹:۰۰ تا ۱۶:۰۰'],['چهارشنبه','۹:۰۰ تا ۱۶:۰۰'],['پنج‌شنبه','۹:۰۰ تا ۱۳:۰۰ (نیمه‌وقت)'],['جمعه','تعطیل']].map(([d,h]) => <tr key={d}><td>{d}</td><td className="font-bold">{h}</td></tr>)}
          </tbody></table>
        </div>
        <p><b>توجه:</b> روزهای پنج‌شنبه به صورت نیمه‌وقت فعالیت خواهیم داشت و جمعه‌ها تعطیل رسمی مجموعه هستند.</p>
      </Section>

      <Section n="۴" title="مرخصی و تسهیلات رفاهی" icon={<Palmtree className="h-5 w-5" />}>
        <p>مارکت‌من در کنار توجه به عملکرد و بهره‌وری، برای رفاه و شرایط کاری اعضای تیم نیز اهمیت قائل است. مزایای همکاری:</p>
        <ul className="grid list-inside gap-1.5 sm:grid-cols-2">
          {['۲.۵ روز مرخصی ماهانه','تعطیلی روزهای جمعه','فعالیت نیمه‌وقت در روزهای پنج‌شنبه','امکان استفاده از وام طبق شرایط و ضوابط مجموعه','بیمه در مدل همکاری دارای حقوق ثابت','پاداش‌های عملکردی و فروش','امکان ارتقای سطح درآمدی بر اساس عملکرد','فرصت پیشرفت شغلی و افزایش مسئولیت در مجموعه'].map((x) => <li key={x}>✔ {x}</li>)}
        </ul>
      </Section>

      <Section n="۵" title="شرح وظایف اپراتورها" icon={<ListChecks className="h-5 w-5" />}>
        <p>وظیفه اصلی اپراتورها برقراری ارتباط مؤثر با مشتریان بالقوه، معرفی خدمات مارکت‌من و تبدیل فرصت‌های ارتباطی به همکاری و فروش موفق است. مهم‌ترین مسئولیت‌ها:</p>
        <ol className="list-inside space-y-1.5">
          {['پاسخ‌گویی به مشتریان و متقاضیان خدمات مجموعه','شناسایی نیازهای مشتری و بررسی نوع کسب‌وکار او','معرفی خدمات مارکت‌من متناسب با نیاز مشتری','ارائه توضیحات اولیه درباره خدمات طراحی سایت، اپلیکیشن، برنامه‌نویسی و بازاریابی دیجیتال','معرفی مزیت رقابتی مجموعه، سوابق اجرایی و پروژه‌های فعال','پیگیری مشتریان و مدیریت ارتباط تا مرحله نهایی فروش','ثبت اطلاعات مشتریان و گزارش عملکرد روزانه','هماهنگی با تیم فنی و فروش برای بررسی نیازهای تخصصی مشتریان','پیگیری فرصت‌های فروش و تلاش برای افزایش نرخ تبدیل مشتریان'].map((x,i) => <li key={x}>{(i+1).toLocaleString('fa-IR')}. {x}</li>)}
        </ol>
        <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sky-800 ring-1 ring-sky-100"><b>نکته مهم:</b> شما قرار نیست برنامه‌نویس یا متخصص فنی باشید. وظیفه شما شناخت خدمات، درک نیاز مشتری و ایجاد یک ارتباط حرفه‌ای برای شکل‌گیری همکاری است. بررسی‌های تخصصی و اجرای پروژه توسط تیم مربوطه انجام می‌شود.</p>
      </Section>

      <Section n="۶" title="قوانین و اصول همکاری" icon={<Scale className="h-5 w-5" />}>
        <p>برای حفظ کیفیت خدمات و ایجاد یک محیط کاری حرفه‌ای، رعایت موارد زیر برای تمامی اعضای تیم ضروری است:</p>
        <ul className="list-inside space-y-1.5">
          {['حضور منظم و رعایت ساعت کاری تعیین‌شده','برخورد محترمانه و حرفه‌ای با مشتریان','ارائه اطلاعات صحیح و خودداری از وعده‌های غیرواقعی','حفظ محرمانگی اطلاعات مشتریان و مجموعه','ثبت دقیق اطلاعات و پیگیری‌های انجام‌شده','رعایت اصول ارتباطی و استانداردهای فروش','عدم ارائه قیمت یا تعهد خارج از تعرفه و اختیارات تعیین‌شده','همکاری با سایر اعضای تیم برای بهبود عملکرد مجموعه','رعایت نظم، مسئولیت‌پذیری و تعهد کاری'].map((x) => <li key={x}>✔ {x}</li>)}
        </ul>
        <p className="font-bold text-slate-800">تمامی فروش‌ها و محاسبات درآمدی بر اساس ثبت و تأیید نهایی در سیستم مجموعه محاسبه خواهند شد.</p>
      </Section>

      <Section n="۷" title="مسیر پیشرفت شما در مارکت‌من" icon={<TrendingUp className="h-5 w-5" />}>
        <p>در مارکت‌من، عملکرد شما می‌تواند مسیر شغلی و درآمدی‌تان را تغییر دهد. هدف ما ایجاد فضایی است که افراد توانمند بتوانند با افزایش مهارت، تجربه و نتایج فروش، جایگاه بالاتری در مجموعه به دست بیاورند.</p>
        <p>ارتقای سطح کاربری، افزایش نرخ درآمد پروژه‌ای و دسترسی به فرصت‌های بیشتر، بخشی از این مسیر است.</p>
        <p>ما به دنبال افرادی هستیم که صرفاً به دنبال گذراندن ساعت کاری نباشند؛ بلکه بخواهند رشد کنند، درآمد بیشتری به دست بیاورند و در توسعه یک مجموعه واقعی سهیم باشند.</p>
        <p className="text-base font-black text-slate-900">مارکت‌من؛ فروش واقعی، درآمد واقعی، فرصت رشد واقعی.</p>
        <p>ما زیرساخت، تخصص، تجربه و خدمات موردنیاز را فراهم کرده‌ایم. شما با عملکرد، پیگیری و مهارت ارتباطی خود می‌توانید از این ظرفیت برای ساختن یک مسیر درآمدی موفق استفاده کنید.</p>
        <p className="text-center text-lg font-black text-brand-700">به خانواده مارکت‌من خوش آمدید 🌿</p>
      </Section>

      <Card className="p-6 sm:p-7">
        <p className="mb-4 flex items-center gap-2 font-black text-slate-900"><MapPin className="h-5 w-5 text-brand-600" /> اطلاعات تماس مجموعه</p>
        <div className="space-y-3 text-sm leading-7 text-slate-600">
          <p><b className="text-slate-800">آدرس:</b> تهران، نیاوران، خیابان جماران، خیابان دوم، پلاک ۵۵، واحد ۵</p>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5"><PhoneCall className="h-4 w-4 text-brand-600" /><b className="text-slate-800">تلفن همراه:</b> <span dir="ltr">0912 302 2064</span></span>
            <span className="flex items-center gap-1.5"><PhoneCall className="h-4 w-4 text-brand-600" /><b className="text-slate-800">تلفن ثابت:</b> <span dir="ltr">021 8280 1043</span></span>
            <span className="flex items-center gap-1.5"><PhoneCall className="h-4 w-4 text-slate-400" /><b className="text-slate-800">خط 091855:</b> به‌زودی فعال می‌شود</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

function Section({ n, title, icon, children }: { n: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-7">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-black text-slate-900">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">{icon}</span>
        {n}. {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </Card>
  );
}
