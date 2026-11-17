const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { authenticate, requireManager } = require('../middleware/auth');

const prisma = new PrismaClient();

function todayBounds() {
  const now = new Date();
  const tehran = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
  const start = new Date(tehran.getFullYear(), tehran.getMonth(), tehran.getDate(), 0, 0, 0, 0);
  const end = new Date(tehran.getFullYear(), tehran.getMonth(), tehran.getDate(), 23, 59, 59, 999);
  return { start, end };
}

router.get(
  '/summary',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = from || to;

    const totalLeads = await prisma.lead.count(hasDateFilter ? { where: { createdAt: dateFilter } } : undefined);

    const byStatus = await prisma.lead.groupBy({
      by: ['status'],
      where: hasDateFilter ? { createdAt: dateFilter } : undefined,
      _count: { status: true },
    });

    const revenueRes = await prisma.lead.aggregate({
      where: {
        status: 'CONTACTED',
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        suggestedAmount: { not: null },
      },
      _sum: { suggestedAmount: true },
    });

    const topOperators = await prisma.lead.groupBy({
      by: ['contactedById'],
      where: {
        status: 'CONTACTED',
        contactedById: { not: null },
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { contactedById: true },
      orderBy: { _count: { contactedById: 'desc' } },
      take: 10,
    });

    const topAreas = await prisma.lead.groupBy({
      by: ['businessArea'],
      where: {
        status: 'CONTACTED',
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { businessArea: true },
      orderBy: { _count: { businessArea: 'desc' } },
      take: 10,
    });

    const topCancellations = await prisma.lead.groupBy({
      by: ['businessArea'],
      where: {
        status: 'CANCELLED',
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { businessArea: true },
      orderBy: { _count: { businessArea: 'desc' } },
      take: 10,
    });

    const topCities = await prisma.lead.groupBy({
      by: ['city'],
      where: {
        status: 'CONTACTED',
        city: { not: null },
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });

    const operatorIds = topOperators.map((o) => o.contactedById);
    const operators = await prisma.user.findMany({
      where: { id: { in: operatorIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const opMap = Object.fromEntries(operators.map((o) => [o.id, `${o.firstName} ${o.lastName}`]));

    const statusMap = Object.fromEntries(byStatus.map((b) => [b.status, b._count.status]));

    const totalContacted = statusMap['CONTACTED'] || 0;
    const totalCancelled = statusMap['CANCELLED'] || 0;
    const totalNew = statusMap['NEW'] || 0;

    const revenue = revenueRes._sum.suggestedAmount
      ? Number(revenueRes._sum.suggestedAmount)
      : 0;

    // آمار کامل همه اپراتورها (حتی بدون فروش) برای نمایش بهترین/ضعیف‌ترین
    const allOperators = await prisma.user.findMany({ where: { role: 'OPERATOR' }, select: { id: true, firstName: true, lastName: true } });
    const opSales = await prisma.lead.groupBy({ by: ['contactedById'], where: { status: 'CONTACTED', contactedById: { not: null }, ...(hasDateFilter ? { createdAt: dateFilter } : {}) }, _count: { contactedById: true }, _sum: { suggestedAmount: true } });
    const opCancels = await prisma.lead.groupBy({ by: ['contactedById'], where: { status: 'CANCELLED', contactedById: { not: null }, ...(hasDateFilter ? { createdAt: dateFilter } : {}) }, _count: { contactedById: true } });
    const salesMap = Object.fromEntries(opSales.map(o=>[o.contactedById,{count:o._count.contactedById, revenue:o._sum.suggestedAmount?Number(o._sum.suggestedAmount):0}]));
    const cancelMap = Object.fromEntries(opCancels.map(o=>[o.contactedById,o._count.contactedById]));
    const operatorStats = allOperators.map(o=>({ operatorId:o.id, operator:`${o.firstName} ${o.lastName}`, sales:salesMap[o.id]?.count||0, cancels:cancelMap[o.id]||0, revenue:salesMap[o.id]?.revenue||0 })).sort((a,b)=>b.sales-a.sales);
    const citySales = await prisma.lead.groupBy({ by: ['city'], where: { status: 'CONTACTED', city: { not: null }, ...(hasDateFilter ? { createdAt: dateFilter } : {}) }, _count: { city: true }, _sum: { suggestedAmount: true } });
    const cityCancels = await prisma.lead.groupBy({ by: ['city'], where: { status: 'CANCELLED', city: { not: null }, ...(hasDateFilter ? { createdAt: dateFilter } : {}) }, _count: { city: true } });
    const ccMap = Object.fromEntries(cityCancels.map(c=>[c.city,c._count.city]));
    const cityStats = citySales.map(c=>({ city:c.city, sales:c._count.city, cancels:ccMap[c.city]||0, revenue:c._sum.suggestedAmount?Number(c._sum.suggestedAmount):0 })).sort((a,b)=>b.sales-a.sales);
    const areaCancelsAll = topCancellations; // already computed above

    res.json({
      operatorStats,
      bestOperator: operatorStats[0] || null,
      worstOperator: operatorStats.length ? operatorStats[operatorStats.length-1] : null,
      cityStats,
      bestCity: cityStats[0] || null,
      worstCity: cityStats.length ? cityStats[cityStats.length-1] : null,
      summary: {
        totalLeads,
        totalNew,
        totalContacted,
        totalCancelled,
        revenue,
        conversionRate: totalLeads ? Math.round((totalContacted / totalLeads) * 100) : 0,
      },
      byStatus,
      topOperators: topOperators.map((o) => ({
        operator: opMap[o.contactedById] || 'نامشخص',
        contactedById: o.contactedById,
        count: o._count.contactedById,
      })),
      topAreas: topAreas.map((a) => ({ area: a.businessArea, count: a._count.businessArea })),
      topCancellations: topCancellations.map((c) => ({ area: c.businessArea, count: c._count.businessArea })),
      topCities: topCities.map((c) => ({ city: c.city || 'تشخیص نشده', count: c._count.city })),
    });
  })
);

router.get(
  '/operator/:id',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = from || to;

    const operator = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, nationalId: true, phone: true },
    });
    if (!operator) return res.status(404).json({ error: 'اپراتور یافت نشد' });

    const baseWhere = { contactedById: id, ...(hasDateFilter ? { contactedAt: dateFilter } : {}) };

    const total = await prisma.lead.count({ where: baseWhere });
    const contacted = await prisma.lead.count({ where: { ...baseWhere, status: 'CONTACTED' } });
    const cancelled = await prisma.lead.count({ where: { ...baseWhere, status: 'CANCELLED' } });

    const revenueRes = await prisma.lead.aggregate({
      where: { ...baseWhere, status: 'CONTACTED', suggestedAmount: { not: null } },
      _sum: { suggestedAmount: true },
    });

    const byArea = await prisma.lead.groupBy({
      by: ['businessArea'],
      where: { ...baseWhere, status: 'CONTACTED' },
      _count: { businessArea: true },
      orderBy: { _count: { businessArea: 'desc' } },
    });

    res.json({
      operator,
      total,
      contacted,
      cancelled,
      revenue: revenueRes._sum.suggestedAmount ? Number(revenueRes._sum.suggestedAmount) : 0,
      byArea: byArea.map((a) => ({ area: a.businessArea, count: a._count.businessArea })),
    });
  })
);

module.exports = router;
