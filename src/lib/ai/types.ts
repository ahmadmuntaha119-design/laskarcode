import { z } from "zod";

/**
 * Zod Schemas & Types for Kawan Kod AI Hint System
 * Dokumen Acuan: TASK AI-1
 */

export const hintLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export type HintLevel = z.infer<typeof hintLevelSchema>;

/**
 * Incoming request payload from client UI
 * profileId is NOT accepted from client (always extracted from secure session)
 */
export const hintRequestSchema = z.object({
  levelCode: z.string().min(1, "Kode level wajib diisi").max(20),
  hintLevel: z.number().int().min(1).max(3),
  attemptId: z.string().uuid().optional(),
  currentErrorType: z.string().max(50).optional(),
  actionsExecuted: z.number().int().nonnegative().optional(),
});
export type HintRequest = z.infer<typeof hintRequestSchema>;

/**
 * Verified pedagogical hint response returned to client
 */
export const hintResponseSchema = z.object({
  message: z.string().min(1, "Pesan petunjuk tidak boleh kosong").max(250, "Pesan petunjuk melebihi panjang maksimal"),
  hintLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  shouldRevealSolution: z.literal(false),
  provider: z.enum(["gemini", "fallback"]),
  errorType: z.string().optional(),
});
export type HintResponse = z.infer<typeof hintResponseSchema>;

/**
 * Sanitized gameplay context sent to Gemini provider (STRICTLY NO PII, NO TOKENS)
 */
export interface SanitizedGameplayContext {
  levelCode: string;
  levelTitle: string;
  concepts: string[];
  hintLevel: 1 | 2 | 3;
  availableBlocks: string[];
  errorType?: string;
  cipiPosition?: { x: number; y: number; direction: string };
  botiPosition?: { x: number; y: number; direction: string };
  goalPosition?: { x: number; y: number };
  gridSize?: { width: number; height: number };
  attemptNumber?: number;
  actionsCount?: number;
}
