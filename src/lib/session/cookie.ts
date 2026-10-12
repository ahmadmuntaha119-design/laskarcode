import 'server-only';

import {
  GUEST_SESSION_COOKIE_NAME,
  GUEST_SESSION_MAX_AGE_SECONDS,
} from './types';

export interface CookieStoreLike {
  get: (name: string) => { name: string; value: string } | undefined;
  set: (options: {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
    maxAge?: number;
  }) => void | Promise<void> | unknown;
  delete?: ((name: string) => void | Promise<void> | unknown) | unknown;
}

export function getGuestSessionCookieOptions(maxAge: number = GUEST_SESSION_MAX_AGE_SECONDS) {
  return {
    name: GUEST_SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Menyimpan token sesi guest ke dalam cookie HTTP-Only.
 */
export function setGuestSessionCookie(
  cookieStore: CookieStoreLike,
  token: string
): void {
  const options = getGuestSessionCookieOptions();
  cookieStore.set({
    ...options,
    value: token,
  });
}

/**
 * Membaca token sesi guest dari cookie store.
 */
export function getGuestSessionCookie(
  cookieStore: CookieStoreLike
): string | null {
  const cookie = cookieStore.get(GUEST_SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Menghapus cookie sesi guest saat pemain keluar/reset.
 */
export function clearGuestSessionCookie(
  cookieStore: CookieStoreLike
): void {
  if (typeof cookieStore.delete === 'function') {
    (cookieStore.delete as (name: string) => void)(GUEST_SESSION_COOKIE_NAME);
  } else {
    // Fallback jika delete tidak tersedia: timpa dengan maxAge 0
    cookieStore.set({
      ...getGuestSessionCookieOptions(0),
      value: '',
    });
  }
}
