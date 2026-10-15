import 'server-only';

import { randomBytes, createHmac } from 'node:crypto';
import { z } from 'zod';
import { ConfigurationError } from '@/services/types';

/**
 * Crockford Base32 alphabet yang aman dan ramah anak.
 * Menghilangkan karakter ambigu (0/O, 1/I/L) agar anak SD tidak salah ketik.
 */
const CROCKFORD_SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Schema format Kode Petualangan (Recovery Code) sesuai Dokumen Acuan §21 (misal CIPI-7K4P-92 atau BOTI-7K4P-92).
 */
export const recoveryCodeFormatSchema = z
  .string()
  .trim()
  .min(1, 'Kode Petualangan tidak boleh kosong')
  .max(30, 'Kode Petualangan terlalu panjang')
  .regex(
    /^(CIPI|BOTI)-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{2}$/i,
    'Format Kode Petualangan tidak valid. Contoh format: CIPI-7K4P-92'
  );

/**
 * Menghasilkan Kode Petualangan baru dengan cryptographically secure randomness.
 * Format: CIPI-XXXX-XX (6 karakter Base32 acak = 30^6 = ~729 juta kombinasi)
 */
export function generateRecoveryCode(): string {
  const bytes = randomBytes(6);
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    const index = bytes[i] % CROCKFORD_SAFE_ALPHABET.length;
    part1 += CROCKFORD_SAFE_ALPHABET[index];
  }

  for (let i = 4; i < 6; i++) {
    const index = bytes[i] % CROCKFORD_SAFE_ALPHABET.length;
    part2 += CROCKFORD_SAFE_ALPHABET[index];
  }

  return `CIPI-${part1}-${part2}`;
}

/**
 * Mengambil secret server-side untuk hashing Kode Petualangan.
 */
export function getRecoveryCodeSecret(overrideSecret?: string): string {
  const secret = overrideSecret ?? process.env.RECOVERY_CODE_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new ConfigurationError(
      'RECOVERY_CODE_SECRET belum dikonfigurasi atau kurang dari 32 karakter. Pastikan telah disetel di environment server.'
    );
  }
  return secret;
}

/**
 * Menghitung representasi aman Kode Petualangan menggunakan Keyed HMAC-SHA256.
 * Menggunakan server-side secret untuk melindungi kode berentropi anak-facing
 * dari serangan kamus (dictionary attack) jika database mengalami kebocoran.
 */
export function hashRecoveryCode(code: string, overrideSecret?: string): string {
  const normalized = code.trim().toUpperCase();
  const secret = getRecoveryCodeSecret(overrideSecret);

  return createHmac('sha256', secret)
    .update(normalized)
    .digest('hex');
}
