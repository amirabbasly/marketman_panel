const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { authenticate, requireManager } = require('../middleware/auth');

const prisma = new PrismaClient();
const num = (v) => (v ? Number(v) : 0);

const uploadDir = path.join(__dirname, '../../uploads/accounting');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authenticate, requireManager);

// خلاصه حسابداری: درآمد، پورسانت تیم فروش، هزینه‌ها، سود خالص
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDate = Boolean(from || to);

    const completed = await prisma.lead.findMany({
      where: { projectStage: 'COMPLETED', ...(hasDate ? { completedAt: dateFilter } : {}) },
      select: {
        id: true, brandName: true, personName: true, city: true, businessArea: true,
        suggestedAmount: true, finalPrice: true, completedAt: true, meetingAt: true,
        contactedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        invoice: { select: { id: true, number: true } },
        walletTransaction: { select: { amount: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    const revenue = completed.reduce((a, l) => a + (num(l.finalPrice) || num(l.suggestedAmount)), 0);
    const salesCommission = completed.reduce((a, l) => a + num(l.walletTransaction?.amount), 0);

    const expenses = await prisma.expense.findMany({
      where: hasDate ? { expenseDate: dateFilter } : undefined,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { expenseDate: 'desc' },
    });
    const totalExpenses = expenses.reduce((a, e) => a + num(e.amount), 0);

    const invoices = await prisma.invoice.findMany({
      include: {
        lead: {
          select: {
            id: true, brandName: true, personName: true,
            contactedBy: { select: { firstName: true, lastName: true } },
            assignedTo: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      summary: {
        revenue,                       // درآمد از پروژه‌های تکمیل‌شده (قیمت نهایی)
        salesCommission,               // پورسانت تیم فروش (کسرشده از درآمد)
        totalExpenses,                 // سایر هزینه‌های ثبت‌شده
        netProfit: revenue - salesCommission - totalExpenses,
        completedCount: completed.length,
        invoicedCount: invoices.length,
      },
      projects: completed.map((l) => ({
        ...l,
        suggestedAmount: num(l.suggestedAmount),
        finalPrice: num(l.finalPrice) || num(l.suggestedAmount),
        commission: num(l.walletTransaction?.amount),
      })),
      expenses: expenses.map((e) => ({ ...e, amount: num(e.amount) })),
      invoices: invoices.map((i) => ({ ...i, grossAmount: num(i.grossAmount), commissionAmount: num(i.commissionAmount), netAmount: num(i.netAmount) })),
    });
  })
);

// ثبت هزینه (با آپلود فاکتور هزینه)
router.post(
  '/expenses',
  upload.single('invoice'),
  asyncHandler(async (req, res) => {
    const { title, amount, category, description, expenseDate } = req.body || {};
    if (!title || !amount) return res.status(400).json({ error: 'عنوان و مبلغ هزینه الزامی است' });
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category: category || null,
        description: description || null,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        invoiceUrl: req.file ? `/uploads/accounting/${req.file.filename}` : null,
        createdById: req.user.id,
      },
    });
    res.status(201).json({ expense: { ...expense, amount: num(expense.amount) } });
  })
);

router.delete(
  '/expenses/:id',
  asyncHandler(async (req, res) => {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// صدور فاکتور برای پروژه تکمیل‌شده: مبلغ نهایی − پورسانت تیم فروش = خالص
router.post(
  '/invoices/:leadId',
  asyncHandler(async (req, res) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.leadId },
      include: { walletTransaction: true },
    });
    if (!lead) return res.status(404).json({ error: 'پروژه یافت نشد' });
    if (lead.projectStage !== 'COMPLETED') return res.status(400).json({ error: 'فاکتور فقط برای پروژه تکمیل‌شده صادر می‌شود' });
    const exists = await prisma.invoice.findUnique({ where: { leadId: lead.id } });
    if (exists) return res.status(400).json({ error: `برای این پروژه قبلاً فاکتور ${exists.number} صادر شده است` });

    const gross = num(lead.finalPrice) || num(lead.suggestedAmount);
    const commission = num(lead.walletTransaction?.amount);
    const count = await prisma.invoice.count();
    const invoice = await prisma.invoice.create({
      data: {
        number: `MM-${String(count + 1).padStart(4, '0')}`,
        leadId: lead.id,
        operatorId: lead.contactedById || lead.assignedToId || null,
        grossAmount: gross,
        commissionAmount: commission,
        netAmount: gross - commission,
        createdById: req.user.id,
      },
    });
    res.status(201).json({ invoice: { ...invoice, grossAmount: num(invoice.grossAmount), commissionAmount: num(invoice.commissionAmount), netAmount: num(invoice.netAmount) } });
  })
);

// آپلود فایل فاکتور صادرشده (اسکن/تصویر)
router.post(
  '/invoices/:id/upload',
  upload.single('invoice'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'فایل فاکتور را انتخاب کنید' });
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { fileUrl: `/uploads/accounting/${req.file.filename}` },
    });
    res.json({ invoice });
  })
);

module.exports = router;
