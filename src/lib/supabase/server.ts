/**
 * Supabase Server Client
 * Digunakan untuk operasi server-side (Server Components, Route Handlers, Server Actions).
 * Menggunakan @supabase/ssr dengan cookie handling async Next.js.
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §20, §22
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Kredensial Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY telah diisi di .env.local.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Dipanggil dari Server Component di mana mutasi cookie tidak diizinkan.
          // Ini aman diabaikan jika middleware menangani refresh session.
        }
      },
    },
  });
}
