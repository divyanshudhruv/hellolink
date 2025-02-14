import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vhptvvbbiuizziykryct.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // ✅ Safe and private

export const supabase = createClient(supabaseUrl, supabaseKey);
