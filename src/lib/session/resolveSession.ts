import 'server-only';

import { cookies } from 'next/headers';
import { getGuestSessionCookie, CookieStoreLike } from './cookie';
import { verifyGuestSessionToken } from './crypto';
import { AuthContext, AuthorizationError } from '@/services/types';

export interface ResolveSessionOptions {
  cookieStore?: CookieStoreLike;
  secret?: string;
}

/**
 * Menyelesaikan identitas pemain dari signed HTTP-only cookie.
 * HANYA cookie yang valid dan terverifikasi secara kriptografis yang diakui.
 * Jangan pernah mengambil identitas dari URL, request body, atau parameter yang dapat dipalsukan client.
 */
export async function resolveGuestSession(
  options?: ResolveSessionOptions
): Promise<AuthContext | null> {
  const cookieStore = options?.cookieStore ?? (await cookies());
  const token = getGuestSessionCookie(cookieStore);

  if (!token) {
    return null;
  }

  const payload = verifyGuestSessionToken(token, options?.secret);
  if (!payload) {
    return null;
  }

  return {
    profileId: payload.profileId,
    isAuthenticated: true,
  };
}

/**
 * Mengharuskan sesi guest yang sah dan terotorisasi.
 * Melempar AuthorizationError jika sesi tidak ditemukan, kedaluwarsa, atau tanda tangan tidak cocok.
 */
export async function requireGuestSession(
  options?: ResolveSessionOptions
): Promise<AuthContext> {
  const auth = await resolveGuestSession(options);
  if (!auth) {
    throw new AuthorizationError(
      'Akses ditolak: Sesi petualang tidak ditemukan atau telah kedaluwarsa. Silakan mulai petualangan baru atau gunakan Kode Petualangan.'
    );
  }
  return auth;
}
