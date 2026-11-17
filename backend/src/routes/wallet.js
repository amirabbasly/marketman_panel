const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { authenticate, requireManager } = require('../middleware/auth');

const prisma = new PrismaClient();
const num = (v) => (v ? Number(v) : 0);

// کیف پول اپراتور (خودش) — چقدر فروخته، چقدر از شرکت طلب دارد
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const operatorId = req.user.id;
    const [transactions, completed, pending] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { operatorId },
        include: { lead: { select: { id: true, brandName: true, personName: true, city: true, businessArea: true, suggestedAmount: true, meetingAt: true, completedAt: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { projectStage: 'COMPLETED', OR: [{ contactedById: operatorId }, { assignedToId: operatorId }] },
        select: { id: true, brandName: true, suggestedAmount: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.lead.count({ where: { projectStage: 'PENDING_APPROVAL', OR: [{ contactedById: operatorId }, { assignedToId: operatorId }] } }),
    ]);

    const totalEarned = transactions.reduce((a, t) => a + num(t.amount), 0); // طلب از شرکت (کمیسیون‌های شارژشده)
    const totalSold = completed.reduce((a, l) => a + num(l.suggestedAmount), 0); // مبلغ فروش پروژه‌های تکمیل‌شده

    res.json({
      totalEarned,
      totalSold,
      completedCount: completed.length,
      pendingCount: pending,
      transactions: transactions.map((t) => ({ ...t, amount: num(t.amount), lead: t.lead ? { ...t.lead, suggestedAmount: num(t.lead.suggestedAmount) } : null })),
      completedProjects: completed.map((l) => ({ ...l, suggestedAmount: num(l.suggestedAmount) })),
    });
  })
);

// نمای مدیر: موجودی و طلب همه اپراتورها
router.get(
  '/operators',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const operators = await prisma.user.findMany({
      where: { role: 'OPERATOR' },
      select: { id: true, firstName: true, lastName: true, phone: true, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    const txns = await prisma.walletTransaction.findMany({ select: { operatorId: true, amount: true } });
    const completed = await prisma.lead.findMany({
      where: { projectStage: 'COMPLETED' },
      select: { contactedById: true, assignedToId: true, suggestedAmount: true },
    });

    const balance = {};
    for (const t of txns) balance[t.operatorId] = (balance[t.operatorId] || 0) + num(t.amount);
    const sold = {};
    const counts = {};
    for (const l of completed) {
      const op = l.contactedById || l.assignedToId;
      if (!op) continue;
      sold[op] = (sold[op] || 0) + num(l.suggestedAmount);
      counts[op] = (counts[op] || 0) + 1;
    }

    res.json({
      operators: operators.map((o) => ({
        operatorId: o.id,
        name: `${o.firstName} ${o.lastName}`,
        phone: o.phone,
        isActive: o.isActive,
        balance: balance[o.id] || 0,
        totalSold: sold[o.id] || 0,
        completedCount: counts[o.id] || 0,
      })).sort((a, b) => b.balance - a.balance),
      totalPayable: Object.values(balance).reduce((a, b) => a + b, 0),
    });
  })
);

module.exports = router;
