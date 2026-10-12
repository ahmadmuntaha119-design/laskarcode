/**
 * Supabase Browser Client
 * Digunakan secara eksklusif pada Client Components jika diperlukan interaksi langsung.
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §22.3
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Kredensial Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY telah diisi di .env.local.'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, publishableKey);
}
