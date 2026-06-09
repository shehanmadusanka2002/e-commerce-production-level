import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@nexora.com';
  const password = 'SuperAdmin123!';
  const fullName = 'Super Admin';

  console.log(`Creating new admin user: ${email} ...`);

  // 1. Sign up the user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    if (error.message.includes('already registered')) {
        console.log("Attempting to sign in to get the UUID...");
        const loginRes = await supabase.auth.signInWithPassword({ email, password });
        if (loginRes.data.user) {
            (data as any).user = loginRes.data.user;
        } else {
            console.log("Could not login. Please use a different email or delete from Supabase first.");
            process.exit(1);
        }
    } else {
        process.exit(1);
    }
  }

  const userId = data.user!.id;
  console.log(`✅ Supabase user created. UID: ${userId}`);

  // 2. Insert into PostgreSQL via Prisma as ADMIN
  console.log('Inserting into PostgreSQL as ADMIN...');
  await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      id: userId
    },
    create: {
      id: userId,
      email: email,
      fullName: fullName,
      role: 'ADMIN',
    },
  });
  console.log('✅ PostgreSQL user inserted and set as ADMIN.');

  // 3. Update the seed.ts file
  const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    seedContent = seedContent.replace(/const adminEmail = '.*';/, `const adminEmail = '${email}';`);
    seedContent = seedContent.replace(/const adminSupabaseId = '.*';/, `const adminSupabaseId = '${userId}';`);
    fs.writeFileSync(seedPath, seedContent);
    console.log('✅ Updated prisma/seed.ts with new Admin UID.');
  }

  console.log('\n=============================================');
  console.log('🎉 NEW SUPER ADMIN SUCCESSFULLY CREATED!');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('=============================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
