const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000; // Asia/Tehran = UTC+3:30

function tehranParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short',
  }).formatToParts(date);
  const get = (t) => parts.find((x) => x.type === t)?.value;
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')), weekday: get('weekday') };
}
const tehranMidnight = (y, m, d) => new Date(Date.UTC(y, m - 1, d) - TEHRAN_OFFSET_MS);

function bounds() {
  const { year, month, day, weekday } = tehranParts();
  const monthStart = tehranMidnight(year, month, 1);
  const nextMonthStart = month === 12 ? tehranMidnight(year + 1, 1, 1) : tehranMidnight(year, month + 1, 1);
  const sinceSaturday = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 }[weekday] ?? 0;
  const weekStart = new Date(tehranMidnight(year, month, day).getTime() - sinceSaturday * 86400000);
  return { monthStart, nextMonthStart, weekStart };
}

const { TIERS, tierFor } = require('../lib/tiers');

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { monthStart, nextMonthStart, weekStart } = bounds();

    const operators = await prisma.user.findMany({
      where: { role: 'OPERATOR' },
      select: { id: true, firstName: true, lastName: true, phone: true, isActive: true, levelOverride: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthLeads = await prisma.lead.findMany({
      where: { status: 'CONTACTED', contactedById: { not: null }, contactedAt: { gte: monthStart, lt: nextMonthStart } },
      select: { contactedById: true, suggestedAmount: true },
    });
    const weekLeads = await prisma.lead.findMany({
      where: { status: 'CONTACTED', contactedById: { not: null }, contactedAt: { gte: weekStart } },
      select: { contactedById: true },
    });

    const agg = (rows, withAmount) => {
      const map = {};
      for (const r of rows) {
        if (!map[r.contactedById]) map[r.contactedById] = { sales: 0, amount: 0 };
        map[r.contactedById].sales += 1;
        if (withAmount) map[r.contactedById].amount += Number(r.suggestedAmount) || 0;
      }
      return map;
    };
    const mAgg = agg(monthLeads, true);
    const wAgg = agg(weekLeads, false);

    const ranking = operators.map((op) => {
      const sales = mAgg[op.id]?.sales || 0;
      const autoTier = tierFor(sales);
      const overrideTier = op.levelOverride ? TIERS.find((t) => t.level === op.levelOverride) : null;
      const tier = overrideTier || autoTier;
      const nextTier = TIERS.find((t) => t.level === tier.level + 1) || null;
      return {
        operatorId: op.id,
        name: `${op.firstName} ${op.lastName}`,
        phone: op.phone,
        isActive: op.isActive,
        monthSales: sales,
        weekSales: wAgg[op.id]?.sales || 0,
        suggestedAmount: mAgg[op.id]?.amount || 0,
        estimatedIncome: sales * tier.rate,
        level: tier.level,
        levelName: tier.name,
        levelColor: tier.color,
        levelOverride: op.levelOverride ?? null,
        isOverride: Boolean(overrideTier),
        nextLevel: nextTier ? { level: nextTier.level, name: nextTier.name, salesNeeded: Math.max(0, nextTier.minSales - sales) } : null,
        progressToNext: nextTier ? Math.min(100, Math.round((sales / nextTier.minSales) * 100)) : 100,
      };
    }).sort((a, b) => b.monthSales - a.monthSales || b.suggestedAmount - a.suggestedAmount);

    ranking.forEach((r, i) => { r.rank = i + 1; });

    const weekRanking = [...ranking].sort((a, b) => b.weekSales - a.weekSales);
    const topOfWeek = weekRanking.length && weekRanking[0].weekSales > 0 ? weekRanking[0] : null;
    const me = ranking.find((r) => r.operatorId === req.user.id) || null;

    const monthLabel = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', month: 'long', year: 'numeric' }).format(new Date());

    res.json({ monthLabel, weekStart, tiers: TIERS, ranking, topOfWeek, me });
  })
);

module.exports = router;
