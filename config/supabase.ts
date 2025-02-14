import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!; // ✅ Safe and private

export const supabase = createClient(supabaseUrl, supabaseKey);
