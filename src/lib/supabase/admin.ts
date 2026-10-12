/**
 * Supabase Admin / Service Role Client
 * DILINDUNGI: HANYA DAPAT DIGUNAKAN DI SERVER.
 * JANGAN PERNAH DIIMPOR ATAU DIGUNAKAN DI CLIENT COMPONENTS.
 *
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §20, §22.3
 */

import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'PELANGGARAN KEAMANAN: createAdminClient (service role) tidak boleh dipanggil di lingkungan browser.'
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      'Kredensial Supabase Admin belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY telah diisi di environment server.'
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
