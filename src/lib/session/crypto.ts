import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  GuestSessionPayload,
  guestSessionPayloadSchema,
} from './types';
import { ConfigurationError } from '@/services/types';

/**
 * Mengambil secret signing sesi dari environment variable.
 */
export function getGuestSessionSecret(overrideSecret?: string): string {
  const secret = overrideSecret ?? process.env.GUEST_SESSION_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new ConfigurationError(
      'GUEST_SESSION_SECRET belum dikonfigurasi atau kurang dari 32 karakter. Pastikan telah disetel di environment server.'
    );
  }
  return secret;
}

/**
 * Menandatangani payload sesi guest menggunakan HMAC-SHA256 dan mengembalikan token Base64URL.
 * Format token: <base64url_payload>.<base64url_signature>
 */
export function signGuestSessionPayload(
  payload: GuestSessionPayload,
  overrideSecret?: string
): string {
  const secret = getGuestSessionSecret(overrideSecret);
  const validated = guestSessionPayloadSchema.parse(payload);
  const serialized = JSON.stringify(validated);
  const encodedPayload = Buffer.from(serialized, 'utf8').toString('base64url');

  const signature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Memverifikasi integritas, tanda tangan kriptografis, struktur, dan masa berlaku token sesi.
 * Menggunakan timingSafeEqual untuk perbandingan tanda tangan agar tahan timing attack.
 * Mengembalikan payload terverifikasi atau null jika token ditolak/kedaluwarsa.
 */
export function verifyGuestSessionToken(
  token: string | null | undefined,
  overrideSecret?: string
): GuestSessionPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, encodedSignature] = parts;
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  try {
    const secret = getGuestSessionSecret(overrideSecret);

    // 1. Hitung signature yang diharapkan
    const expectedSigBuffer = createHmac('sha256', secret)
      .update(encodedPayload)
      .digest();

    const actualSigBuffer = Buffer.from(encodedSignature, 'base64url');

    // 2. Periksa panjang dan bandingkan tanda tangan secara timing-safe
    if (actualSigBuffer.length !== expectedSigBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(actualSigBuffer, expectedSigBuffer)) {
      return null;
    }

    // 3. Decode payload JSON
    const decodedJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const rawPayload = JSON.parse(decodedJson);

    // 4. Validasi format payload via Zod
    const parsed = guestSessionPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return null;
    }

    // 5. Periksa kedaluwarsa waktu
    if (Date.now() > parsed.data.expiresAt) {
      return null;
    }

    return parsed.data;
  } catch {
    // Jika ada error parsing, HMAC, atau env, tolak secara aman
    return null;
  }
}
