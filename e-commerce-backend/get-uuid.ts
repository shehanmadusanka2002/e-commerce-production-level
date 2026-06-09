import { createClient } from '@supabase/supabase-js';

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'superadmin@nexora.com';
  const password = 'SuperAdmin123!';
  const loginRes = await supabase.auth.signInWithPassword({ email, password });
  console.log("UUID:", loginRes.data.user?.id);
}

main().catch(console.error);
