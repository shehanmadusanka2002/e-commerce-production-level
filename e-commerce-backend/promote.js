const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.updateMany({
    where: { email: 'shehan@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Updated ' + user.count + ' user(s) to ADMIN');
}

run().finally(() => prisma.$disconnect());
