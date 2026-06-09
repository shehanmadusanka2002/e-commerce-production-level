const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const email = 'superadmin@nexora.com';
  const password = 'SuperAdmin123!';
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { full_name: 'Super Admin' } }
  });
  
  if (error && !error.message.includes('already registered')) {
    console.error(error); return;
  }
  
  let user = data?.user;
  if (!user) {
    const login = await supabase.auth.signInWithPassword({ email, password });
    user = login.data.user;
  }
  
  console.log("UUID:", user.id);
  
  const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
  let content = fs.readFileSync(seedPath, 'utf8');
  content = content.replace(/const adminEmail = '.*';/, `const adminEmail = '${email}';`);
  content = content.replace(/const adminSupabaseId = '.*';/, `const adminSupabaseId = '${user.id}';`);
  fs.writeFileSync(seedPath, content);
  console.log("Updated seed.ts");
}
main();
