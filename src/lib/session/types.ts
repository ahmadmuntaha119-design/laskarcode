/**
 * Guest Session Types and Schemas
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §20, §21, §22
 */

import { z } from 'zod';
import { uuidSchema } from '@/services/types';

export const GUEST_SESSION_COOKIE_NAME = 'laskarcode_guest_session';
export const GUEST_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 hari

export const guestSessionPayloadSchema = z.object({
  profileId: uuidSchema,
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  v: z.number().int().default(1),
});

export type GuestSessionPayload = z.infer<typeof guestSessionPayloadSchema>;
