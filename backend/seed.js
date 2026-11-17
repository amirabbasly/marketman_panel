require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@marketman.ir';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log('مدیر پیش‌فرض قبلاً وجود دارد:', email);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      phone: '۰۹۱۲۰۰۰۰۰۰۰',
      password: hash,
      role: 'MANAGER',
      firstName: 'مدیر',
      lastName: 'سامانه',
      isActive: true,
    },
  });
  console.log('مدیر پیش‌فرض ساخته شد:', email);
  console.log('رمز عبور پیش‌فرض:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
