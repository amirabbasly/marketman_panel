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
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { from, to, mine, status, search } = req.query;
    const where = {};

    if (req.user.role === 'OPERATOR') {
      const { start, end } = todayBounds();
      where.createdAt = { gte: start, lte: end };
    }

    if (mine && req.user.role === 'OPERATOR') {
      where.contactedById = req.user.id;
    }
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { brandName: { contains: String(search) } },
        { personName: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { businessArea: { contains: String(search) } },
        { city: { contains: String(search) } },
      ];
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        contactedBy: { select: { id: true, firstName: true, lastName: true } },
      },
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
    const { brandName, personName, address, city, businessArea, description, phone } = req.body || {};
    if (!brandName || !personName || !address || !businessArea || !phone) {
      return res.status(400).json({ error: 'تمام فیلدهای الزامی را پر کنید' });
    }

    const lead = await prisma.lead.create({
      data: {
        brandName,
        personName,
        address,
        city: city || null,
        businessArea,
        description: description || null,
        phone,
        status: 'NEW',
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    res.status(201).json({ lead });
  })
);

router.patch(
  '/:id/contact',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { contactNote, suggestedAmount } = req.body || {};

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ error: 'لید یافت نشد' });

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: 'CONTACTED',
        contactNote: contactNote || null,
        suggestedAmount: suggestedAmount ? Number(suggestedAmount) : null,
        contactedAt: new Date(),
        contactedById: req.user.id,
      },
      include: {
        contactedBy: { select: { id: true, firstName: true, lastName: true } },
      },
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
    if (!lead) return res.status(404).json({ error: 'لید یافت نشد' });

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        contactNote: contactNote || null,
        contactedAt: new Date(),
        contactedById: req.user.id,
      },
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
    const { brandName, personName, address, city, businessArea, description, phone, status } = req.body || {};

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ error: 'لید یافت نشد' });

    const data = {};
    if (brandName !== undefined) data.brandName = brandName;
    if (personName !== undefined) data.personName = personName;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (businessArea !== undefined) data.businessArea = businessArea;
    if (description !== undefined) data.description = description;
    if (phone !== undefined) data.phone = phone;
    if (status) data.status = status;

    const updated = await prisma.lead.update({ where: { id }, data });
    res.json({ lead: updated });
  })
);

router.delete(
  '/:id',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id } });
    res.json({ ok: true });
  })
);

module.exports = router;
