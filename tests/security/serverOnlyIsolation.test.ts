import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Server-Only Isolation & Client Component Protection', () => {
  it('12. admin.ts memuat deklarasi statis import server-only', () => {
    const adminFilePath = path.resolve(process.cwd(), 'src/lib/supabase/admin.ts');
    const content = fs.readFileSync(adminFilePath, 'utf-8');

    // Harus secara eksplisit mengimpor server-only
    expect(content).toMatch(/import\s+['"]server-only['"];/);
  });

  it('12. server-only package melempar error saat diimpor di lingkungan client', () => {
    // Jalankan entry point default dari paket server-only (yang di-bundle saat di luar server components)
    const serverOnlyClientEntryPath = path.resolve(
      process.cwd(),
      'node_modules/server-only/index.js'
    );
    const content = fs.readFileSync(serverOnlyClientEntryPath, 'utf-8');

    expect(content).toContain('This module cannot be imported from a Client Component module');
  });

  it('12. Runtime guard createAdminClient menolak eksekusi jika objek window ada', () => {
    const globalObj = globalThis as { window?: unknown };
    globalObj.window = {};

    expect(() => {
      createAdminClient();
    }).toThrow('PELANGGARAN KEAMANAN: createAdminClient (service role) tidak boleh dipanggil di lingkungan browser.');

    delete globalObj.window;
  });
});
