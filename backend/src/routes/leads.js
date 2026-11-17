const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { authenticate, requireManager } = require('../middleware/auth');

const prisma = new PrismaClient();

const userSelect = { id: true, firstName: true, lastName: true };
const leadInclude = {
  createdBy: { select: userSelect },
  contactedBy: { select: userSelect },
  assignedTo: { select: userSelect },
};

function todayBounds() {
  const now = new Date();
  const tehran = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
  const start = new Date(tehran.getFullYear(), tehran.getMonth(), tehran.getDate(), 0, 0, 0, 0);
  const end = new Date(tehran.getFullYear(), tehran.getMonth(), tehran.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function guardOperatorOwnership(req, lead) {
  if (req.user.role !== 'OPERATOR') return null;
  if (!lead.assignedToId) return 'این مشتری آزاد است؛ ابتدا باید آن را از درخواست‌های آزاد قبول کنید';
  if (lead.assignedToId !== req.user.id) return 'این مشتری به اپراتور دیگری اختصاص داده شده است';
  return null;
}

// استخر مشتریان آزاد — برای اپراتورها (مودال درخواست)
router.get(
  '/pool',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'OPERATOR') return res.json({ leads: [] });
    const leads = await prisma.lead.findMany({
      where: { assignmentMode: 'OPEN', assignedToId: null, status: 'NEW' },
      include: leadInclude,
      orderBy: { createdAt: 'asc' },
    });
    res.json({ leads });
  })
);

// قبول مشتری آزاد — اتمیک: فقط اولین اپراتور موفق می‌شود
router.post(
  '/:id/claim',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'OPERATOR') return res.status(403).json({ error: 'فقط اپراتور می‌تواند مشتری آزاد را قبول کند' });
    const { id } = req.params;
    const result = await prisma.lead.updateMany({
      where: { id, assignmentMode: 'OPEN', assignedToId: null, status: 'NEW' },
      data: { assignedToId: req.user.id, assignmentMode: 'ASSIGNED', claimedAt: new Date() },
    });
    if (result.count === 0) {
      const exists = await prisma.lead.findUnique({ where: { id } });
      if (!exists) return res.status(404).json({ error: 'مشتری یافت نشد' });
      return res.status(409).json({ error: 'این مشتری قبلاً توسط اپراتور دیگری قبول شده است' });
    }
    const lead = await prisma.lead.findUnique({ where: { id }, include: leadInclude });
    res.json({ lead });
  })
);

// جلسات ثبت‌شده — برای مدیریت
router.get(
  '/meetings',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const meetings = await prisma.lead.findMany({
      where: { meetingAt: { not: null, gte: new Date(Date.now() - 24 * 3600 * 1000) }, status: 'CONTACTED' },
      include: leadInclude,
      orderBy: { meetingAt: 'asc' },
      take: 100,
    });
    res.json({ meetings });
  })
);

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { from, to, mine, scope, mode, assignedTo, status, search } = req.query;
    const where = {};
    const and = [];

    if (req.user.role === 'OPERATOR') {
      if (scope === 'exclusive') {
        // مشتریان اختصاصی من — بدون محدودیت تاریخ
        where.assignedToId = req.user.id;
      } else if (mine) {
        where.contactedById = req.user.id;
      } else {
        // لیست امروز من: اختصاصی‌های امروز + تماس‌های امروز خودم
        const { start, end } = todayBounds();
        where.createdAt = { gte: start, lte: end };
        and.push({ OR: [{ assignedToId: req.user.id }, { contactedById: req.user.id }] });
      }
    } else {
      if (mode === 'open') { where.assignmentMode = 'OPEN'; where.assignedToId = null; }
      else if (mode === 'assigned') { where.assignmentMode = 'ASSIGNED'; }
      if (assignedTo) where.assignedToId = String(assignedTo);
    }

    if (status) where.status = status;
    if (search) {
      and.push({
        OR: [
          { brandName: { contains: String(search) } },
          { personName: { contains: String(search) } },
          { phone: { contains: String(search) } },
          { businessArea: { contains: String(search) } },
          { city: { contains: String(search) } },
        ],
      });
    }
    if (from || to) {
      where.createdAt = where.createdAt || {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (and.length) where.AND = and;

    const leads = await prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ leads });
  })
);

router.post(
  '/',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { brandName, personName, address, city, businessArea, description, phone, assignmentMode, assignedToId } = req.body || {};
    if (!brandName || !personName || !address || !businessArea || !phone) {
      return res.status(400).json({ error: 'تمام فیلدهای الزامی را پر کنید' });
    }
    const mode = assignmentMode === 'ASSIGNED' ? 'ASSIGNED' : 'OPEN';
    let assignee = null;
    if (mode === 'ASSIGNED') {
      if (!assignedToId) return res.status(400).json({ error: 'برای حالت اختصاصی، اپراتور را انتخاب کنید' });
      assignee = await prisma.user.findFirst({ where: { id: String(assignedToId), role: 'OPERATOR', isActive: true } });
      if (!assignee) return res.status(400).json({ error: 'اپراتور انتخاب‌شده یافت نشد یا غیرفعال است' });
    }

    const lead = await prisma.lead.create({
      data: {
        brandName, personName, address,
        city: city || null,
        businessArea,
        description: description || null,
        phone,
        status: 'NEW',
        createdById: req.user.id,
        assignmentMode: mode,
        assignedToId: assignee ? assignee.id : null,
        claimedAt: assignee ? new Date() : null,
      },
      include: leadInclude,
    });
    res.status(201).json({ lead });
  })
);

router.patch(
  '/:id/contact',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { contactNote, suggestedAmount, meetingAt } = req.body || {};
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ error: 'مشتری یافت نشد' });
    const guard = guardOperatorOwnership(req, lead);
    if (guard) return res.status(403).json({ error: guard });

    // تایم جلسه برای مشتری تأییدشده الزامی است و نباید با جلسه دیگری تداخل داشته باشد
    let meetingDate = null;
    if (meetingAt) {
      meetingDate = new Date(meetingAt);
      if (isNaN(meetingDate.getTime())) return res.status(400).json({ error: 'تاریخ و ساعت جلسه معتبر نیست' });
      const conflict = await prisma.lead.findFirst({
        where: {
          id: { not: id },
          meetingAt: { gt: new Date(meetingDate.getTime() - 3600 * 1000), lt: new Date(meetingDate.getTime() + 3600 * 1000) },
        },
        include: leadInclude,
      });
      if (conflict) {
        const when = conflict.meetingAt.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
        const who = conflict.contactedBy ? `${conflict.contactedBy.firstName} ${conflict.contactedBy.lastName}` : (conflict.assignedTo ? `${conflict.assignedTo.firstName} ${conflict.assignedTo.lastName}` : '—');
        return res.status(409).json({ error: `تداخل جلسه: برای «${conflict.brandName}» (اپراتور: ${who}) در ${when} جلسه ثبت شده است. بین یک ساعت قبل و بعد از آن تایم، جلسه دیگری نمی‌توان ثبت کرد؛ ساعت دیگری انتخاب کنید.` });
      }
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: 'CONTACTED',
        contactNote: contactNote || null,
        suggestedAmount: suggestedAmount ? Number(suggestedAmount) : null,
        contactedAt: new Date(),
        contactedById: req.user.id,
        meetingAt: meetingDate,
      },
      include: leadInclude,
    });
    res.json({ lead: updated });
  })
);

router.patch(
  '/:id/cancel',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { contactNote } = req.body || {};
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ error: 'مشتری یافت نشد' });
    const guard = guardOperatorOwnership(req, lead);
    if (guard) return res.status(403).json({ error: guard });

    const updated = await prisma.lead.update({
      where: { id },
      data: { status: 'CANCELLED', contactNote: contactNote || null, contactedAt: new Date(), contactedById: req.user.id },
      include: leadInclude,
    });
    res.json({ lead: updated });
  })
);

router.patch(
  '/:id',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { brandName, personName, address, city, businessArea, description, phone, status, assignmentMode, assignedToId } = req.body || {};
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ error: 'مشتری یافت نشد' });

    const data = {};
    if (brandName !== undefined) data.brandName = brandName;
    if (personName !== undefined) data.personName = personName;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (businessArea !== undefined) data.businessArea = businessArea;
    if (description !== undefined) data.description = description;
    if (phone !== undefined) data.phone = phone;
    if (status) data.status = status;
    if (assignmentMode === 'OPEN') { data.assignmentMode = 'OPEN'; data.assignedToId = null; data.claimedAt = null; }
    if (assignmentMode === 'ASSIGNED' || assignedToId !== undefined) {
      if (!assignedToId) return res.status(400).json({ error: 'برای حالت اختصاصی، اپراتور را انتخاب کنید' });
      data.assignmentMode = 'ASSIGNED';
      data.assignedToId = String(assignedToId);
      data.claimedAt = new Date();
    }

    const updated = await prisma.lead.update({ where: { id }, data, include: leadInclude });
    res.json({ lead: updated });
  })
);

router.delete(
  '/:id',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

module.exports = router;
