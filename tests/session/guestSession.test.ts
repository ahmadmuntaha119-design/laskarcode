import { describe, it, expect } from 'vitest';
import {
  signGuestSessionPayload,
  verifyGuestSessionToken,
} from '@/lib/session/crypto';
import { resolveGuestSession, requireGuestSession } from '@/lib/session/resolveSession';
import {
  setGuestSessionCookie,
  getGuestSessionCookie,
  clearGuestSessionCookie,
} from '@/lib/session/cookie';
import { GUEST_SESSION_COOKIE_NAME, GuestSessionPayload } from '@/lib/session/types';
import { AuthorizationError } from '@/services/types';

describe('Guest Session Cryptographic Token & Cookie Tests', () => {
  const testSecret = 'test-guest-session-secret-min-32-chars-long-123456';
  const validProfileId = 'a1111111-1111-1111-1111-111111111111';

  const createMockCookieStore = (initialCookies: Record<string, string> = {}) => {
    const store = new Map<string, string>(Object.entries(initialCookies));
    return {
      get: (name: string) => {
        const val = store.get(name);
        return val !== undefined ? { name, value: val } : undefined;
      },
      set: ({ name, value }: { name: string; value: string }) => {
        store.set(name, value);
      },
      delete: (name: string) => {
        store.delete(name);
      },
      _store: store,
    };
  };

  it('1. Cookie signature valid berhasil diverifikasi', () => {
    const payload: GuestSessionPayload = {
      profileId: validProfileId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 jam ke depan
      v: 1,
    };

    const token = signGuestSessionPayload(payload, testSecret);
    expect(token).toContain('.');

    const verified = verifyGuestSessionToken(token, testSecret);
    expect(verified).not.toBeNull();
    expect(verified?.profileId).toBe(validProfileId);
    expect(verified?.v).toBe(1);
  });

  it('2. Cookie yang dimodifikasi (tampered) ditolak dengan aman', () => {
    const payload: GuestSessionPayload = {
      profileId: validProfileId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
      v: 1,
    };

    const token = signGuestSessionPayload(payload, testSecret);
    const [encodedPayload, signature] = token.split('.');

    // Tampering 1: Mengubah payload untuk mencuri profileId orang lain
    const maliciousPayload = {
      ...payload,
      profileId: 'b2222222-2222-2222-2222-222222222222',
    };
    const tamperedPayloadEncoded = Buffer.from(JSON.stringify(maliciousPayload)).toString('base64url');
    const tamperedToken = `${tamperedPayloadEncoded}.${signature}`;

    expect(verifyGuestSessionToken(tamperedToken, testSecret)).toBeNull();

    // Tampering 2: Mengubah signature
    const corruptedSigToken = `${encodedPayload}.${signature.slice(0, -2)}xx`;
    expect(verifyGuestSessionToken(corruptedSigToken, testSecret)).toBeNull();

    // Tampering 3: Menggunakan secret yang salah
    const wrongSecret = 'another-secret-key-that-is-at-least-32-chars-long';
    expect(verifyGuestSessionToken(token, wrongSecret)).toBeNull();
  });

  it('3. Cookie kedaluwarsa (expired) ditolak', () => {
    const expiredPayload: GuestSessionPayload = {
      profileId: validProfileId,
      issuedAt: Date.now() - 1000 * 60 * 60 * 24, // Kemarin
      expiresAt: Date.now() - 1000, // Sudah lewat 1 detik lalu
      v: 1,
    };

    const token = signGuestSessionPayload(expiredPayload, testSecret);
    const verified = verifyGuestSessionToken(token, testSecret);

    expect(verified).toBeNull();
  });

  it('4. Payload sesi dengan struktur invalid ditolak', () => {
    // Non-UUID profileId
    const invalidPayload = {
      profileId: 'not-a-valid-uuid',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 10000,
      v: 1,
    };
    const encoded = Buffer.from(JSON.stringify(invalidPayload)).toString('base64url');
    // Tandatangani payload yang tidak valid skemanya
    const token = `${encoded}.somesignature`;
    expect(verifyGuestSessionToken(token, testSecret)).toBeNull();

    // String sembarang tanpa separator titik
    expect(verifyGuestSessionToken('invalid-token-string', testSecret)).toBeNull();
    expect(verifyGuestSessionToken('', testSecret)).toBeNull();
    expect(verifyGuestSessionToken(null as unknown as string, testSecret)).toBeNull();
  });

  it('5. Profile ID yang dipalsukan di request tidak mengganti identitas dari cookie', async () => {
    const legitimateProfileId = 'a1111111-1111-1111-1111-111111111111';
    const attackerProfileId = 'c3333333-3333-3333-3333-333333333333';

    const validPayload: GuestSessionPayload = {
      profileId: legitimateProfileId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
      v: 1,
    };

    const token = signGuestSessionPayload(validPayload, testSecret);
    const cookieStore = createMockCookieStore({
      [GUEST_SESSION_COOKIE_NAME]: token,
    });

    // Simulasi request body dari penyerang: mencoba mengirim attackerProfileId
    const fakeClientRequestBody = {
      profileId: attackerProfileId,
    };

    // Resolver sesi server HANYA membaca cookie, sama sekali tidak mempedulikan fakeClientRequestBody
    const resolvedAuth = await resolveGuestSession({
      cookieStore,
      secret: testSecret,
    });

    expect(resolvedAuth).not.toBeNull();
    expect(resolvedAuth?.profileId).toBe(legitimateProfileId);
    expect(resolvedAuth?.profileId).not.toBe(fakeClientRequestBody.profileId);
    expect(resolvedAuth?.isAuthenticated).toBe(true);
  });

  it('Cookie helper get, set, dan clear berfungsi dengan benar', () => {
    const cookieStore = createMockCookieStore();
    expect(getGuestSessionCookie(cookieStore)).toBeNull();

    setGuestSessionCookie(cookieStore, 'sample-token-value');
    expect(getGuestSessionCookie(cookieStore)).toBe('sample-token-value');

    clearGuestSessionCookie(cookieStore);
    expect(getGuestSessionCookie(cookieStore)).toBeNull();
  });

  it('requireGuestSession melempar AuthorizationError jika sesi tidak ada atau ditolak', async () => {
    const emptyCookieStore = createMockCookieStore();

    await expect(
      requireGuestSession({
        cookieStore: emptyCookieStore,
        secret: testSecret,
      })
    ).rejects.toThrow(AuthorizationError);
  });
});
