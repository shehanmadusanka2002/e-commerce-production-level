import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create or Update the Admin User
  // IMPORTANT: The 'id' here must match the UUID of the user in your Supabase Auth dashboard!
  // If you create a new user in Supabase, copy their UID and replace the 'id' below.
  const adminEmail = 'superadmin@nexora.com';
  const adminSupabaseId = '2c99483e-6d83-4d87-8142-8a43163fc582';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      id: adminSupabaseId // Ensure ID matches Supabase
    },
    create: {
      id: adminSupabaseId,
      email: adminEmail,
      fullName: 'admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user ensured:', admin.email);

  // You can also add default categories or products here if needed
  // ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
