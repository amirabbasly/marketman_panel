// سطوح لیگ فروش — منبع مشترک بین ماژول لیگ، پروژه‌ها و کیف پول
const TIERS = [
  { level: 1, name: 'برنزی', minSales: 0, rate: 5000000, color: '#b45309' },
  { level: 2, name: 'نقره‌ای', minSales: 3, rate: 8000000, color: '#64748b' },
  { level: 3, name: 'طلایی', minSales: 6, rate: 12000000, color: '#d97706' },
  { level: 4, name: 'پلاتینیوم', minSales: 10, rate: 15000000, color: '#0ea5e9' },
  { level: 5, name: 'الماس', minSales: 15, rate: 20000000, color: '#7c3aed' },
];
const tierFor = (sales) => [...TIERS].reverse().find((t) => sales >= t.minSales) || TIERS[0];

const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000;
function tehranMonthBounds(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tehran', year: 'numeric', month: 'numeric' }).formatToParts(date);
  const get = (t) => Number(parts.find((x) => x.type === t)?.value);
  const y = get('year'), m = get('month');
  const start = new Date(Date.UTC(y, m - 1, 1) - TEHRAN_OFFSET_MS);
  const end = m === 12 ? new Date(Date.UTC(y + 1, 0, 1) - TEHRAN_OFFSET_MS) : new Date(Date.UTC(y, m, 1) - TEHRAN_OFFSET_MS);
  return { start, end };
}

module.exports = { TIERS, tierFor, tehranMonthBounds };
