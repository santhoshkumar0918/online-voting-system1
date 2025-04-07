// import { createClient } from "@supabase/supabase-js";

// export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const createSupabaseClient = () =>
//   createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (no auth)
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client with Clerk auth
export const createServerSupabaseClient = async () => {
  const { getToken } = auth();
  const supabaseAccessToken = await getToken({ template: "supabase" });

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  });
};
