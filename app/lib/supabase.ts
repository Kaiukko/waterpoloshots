import { createClient } from "@supabase/supabase-js";

// Public project URL + anon (publishable) key — safe to expose client-side,
// access is governed by Row Level Security policies on the database.
export const SUPABASE_URL = "https://bcyeeduhgdcxblkuknyx.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjeWVlZHVoZ2RjeGJsa3Vrbnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODE2MzksImV4cCI6MjA5OTU1NzYzOX0.WQAlma6BBrU0rL3qtzZgHHNP1LWUmZPBm0EFbI6R_VI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
