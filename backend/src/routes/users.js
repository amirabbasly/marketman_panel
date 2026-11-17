const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { authenticate, requireManager } = require('../middleware/auth');

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^أ-یa-zA-Z0-9_.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype);
    cb(ok ? null : new Error('فقط تصویر یا PDF مجاز است'), ok);
  },
});

router.get(
  '/',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { role: 'OPERATOR' },
      select: {
        id: true, firstName: true, lastName: true, nationalId: true,
        nationalIdPhoto: true, phone: true, birthDate: true, isActive: true,
        createdAt: true, updatedAt: true,
        _count: { select: { changeRequests: true, contactedLeads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  })
);

router.post(
  '/',
  authenticate,
  requireManager,
  upload.single('nationalIdPhoto'),
  asyncHandler(async (req, res) => {
    const { firstName, lastName, nationalId, phone, birthDate, password } = req.body || {};

    if (!firstName || !lastName || !nationalId || !phone || !password) {
      return res.status(400).json({ error: 'تمام فیلدهای الزامی را پر کنید' });
    }

    const nationalIdPhoto = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const user = await prisma.user.create({
      data: {
        email: `${phone}@marketman.local`,
        phone,
        password: await bcrypt.hash(password, 10),
        role: 'OPERATOR',
        firstName,
        lastName,
        nationalId,
        nationalIdPhoto,
        birthDate: birthDate ? new Date(birthDate) : null,
        isActive: true,
      },
      select: {
        id: true, firstName: true, lastName: true, nationalId: true,
        phone: true, birthDate: true, isActive: true, createdAt: true,
      },
    });
    res.status(201).json({ user });
  })
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'MANAGER' && req.user.id !== id) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, phone: true, role: true, firstName: true,
        lastName: true, nationalId: true, nationalIdPhoto: true, birthDate: true,
        isActive: true, createdAt: true, updatedAt: true,
        changeRequests: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, field: true, oldValue: true, newValue: true, photoUrl: true, status: true, reviewedAt: true, createdAt: true },
        },
        _count: { select: { contactedLeads: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json({ user });
  })
);

router.patch(
  '/:id',
  authenticate,
  requireManager,
  upload.single('nationalIdPhoto'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, nationalId, phone, birthDate, password, isActive } = req.body || {};

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
    if (user.role !== 'OPERATOR') {
      return res.status(400).json({ error: 'فقط می‌توان اطلاعات اپراتور را تغییر داد' });
    }

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (nationalId !== undefined) data.nationalId = nationalId;
    if (phone !== undefined) data.phone = phone;
    if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;
    if (password) data.password = await bcrypt.hash(password, 10);
    if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
    if (req.file) data.nationalIdPhoto = `/uploads/profiles/${req.file.filename}`;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, firstName: true, lastName: true, nationalId: true,
        phone: true, birthDate: true, nationalIdPhoto: true, isActive: true, updatedAt: true,
      },
    });
    res.json({ user: updated });
  })
);

router.post(
  '/change-requests',
  authenticate,
  upload.single('nationalIdPhoto'),
  asyncHandler(async (req, res) => {
    const { field, newValue } = req.body || {};
    if (!field) {
      return res.status(400).json({ error: 'فیلد و مقدار جدید الزامی است' });
    }

    const operator = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!operator || operator.role !== 'OPERATOR') {
      return res.status(403).json({ error: 'فقط اپراتور می‌تواند درخواست تغییر دهد' });
    }

    let oldValue = null;
    if (field === 'firstName') oldValue = operator.firstName;
    else if (field === 'lastName') oldValue = operator.lastName;
    else if (field === 'nationalId') oldValue = operator.nationalId;
    else if (field === 'phone') oldValue = operator.phone;
    else if (field === 'birthDate') oldValue = operator.birthDate ? operator.birthDate.toISOString() : null;

    const photoUrl = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const cr = await prisma.changeRequest.create({
      data: {
        operatorId: req.user.id,
        field,
        oldValue: String(oldValue ?? ''),
        newValue: newValue !== undefined ? String(newValue) : null,
        photoUrl,
        status: 'PENDING',
      },
    });
    res.status(201).json({ changeRequest: cr });
  })
);

router.get(
  '/change-requests',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const requests = await prisma.changeRequest.findMany({
      include: {
        operator: {
          select: { id: true, firstName: true, lastName: true, nationalId: true },
        },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ requests });
  })
);

router.patch(
  '/change-requests/:id/approve',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cr = await prisma.changeRequest.findUnique({ where: { id }, include: { operator: true } });
    if (!cr) return res.status(404).json({ error: 'درخواست یافت نشد' });
    if (cr.status !== 'PENDING') {
      return res.status(400).json({ error: 'این درخواست قبلاً بررسی شده است' });
    }

    const updateData = {};
    if (cr.field === 'nationalIdPhoto' && cr.photoUrl) {
      updateData.nationalIdPhoto = cr.photoUrl;
    } else if (cr.newValue !== null && cr.newValue !== undefined) {
      if (cr.field === 'birthDate') updateData.birthDate = new Date(cr.newValue);
      else updateData[cr.field] = cr.newValue;
    }

    await prisma.user.update({ where: { id: cr.operatorId }, data: updateData });

    const updated = await prisma.changeRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date(), reviewedById: req.user.id },
      include: { operator: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json({ changeRequest: updated });
  })
);

router.patch(
  '/change-requests/:id/reject',
  authenticate,
  requireManager,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cr = await prisma.changeRequest.findUnique({ where: { id } });
    if (!cr) return res.status(404).json({ error: 'درخواست یافت نشد' });
    if (cr.status !== 'PENDING') {
      return res.status(400).json({ error: 'این درخواست قبلاً بررسی شده است' });
    }

    const updated = await prisma.changeRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewedAt: new Date(), reviewedById: req.user.id },
    });
    res.json({ changeRequest: updated });
  })
);

module.exports = router;
