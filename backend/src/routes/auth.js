const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const userFields = {
  id: true,
  email: true,
  phone: true,
  role: true,
  firstName: true,
  lastName: true,
  nationalId: true,
  nationalIdPhoto: true,
  birthDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'حساب کاربری شما غیرفعال شده است' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'not authenticated' });
    }
    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (_err) {
      return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده است' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: userFields,
    });
    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    res.json({ user });
  })
);

module.exports = router;
