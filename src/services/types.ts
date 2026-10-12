/**
 * Service Layer Types and Zod Validation Schemas
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §15, §18, §20, §22
 */

import { z } from 'zod';

// ============================================================================
// Custom Service Error Classes
// ============================================================================

export class AuthorizationError extends Error {
  constructor(message: string = 'Akses ditolak: Sesi tidak terotorisasi atau profile ID tidak sesuai.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class DatabaseOperationError extends Error {
  public readonly causeDetails?: unknown;

  constructor(message: string, causeDetails?: unknown) {
    super(message);
    this.name = 'DatabaseOperationError';
    this.causeDetails = causeDetails;
  }
}

export class ValidationError extends Error {
  public readonly issues?: z.ZodIssue[];

  constructor(message: string, issues?: z.ZodIssue[]) {
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// ============================================================================
// Authentication & Authorization Context
// Dokumen Acuan §20, §22.2: Jangan mempercayai profile_id dari client
// ============================================================================

export const uuidSchema = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  'Harus berupa valid UUID'
);

export const authContextSchema = z.object({
  profileId: uuidSchema,
  isAuthenticated: z.boolean(),
});

export type AuthContext = z.infer<typeof authContextSchema>;

export function assertAuthorized(auth: AuthContext, targetProfileId: string): void {
  const parsed = authContextSchema.safeParse(auth);
  if (!parsed.success || !auth.isAuthenticated) {
    throw new AuthorizationError('Operasi gagal: Sesi pengguna belum terautentikasi.');
  }

  if (auth.profileId !== targetProfileId) {
    throw new AuthorizationError(
      `Pelanggaran Otorisasi: Profil '${auth.profileId}' dilarang mengakses atau mengubah data profil '${targetProfileId}'.`
    );
  }
}

// ============================================================================
// Level Configuration Schema (JSONB representation in database)
// ============================================================================

export const levelConfigSchema = z.object({
  grid: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  start: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    direction: z.enum(['NORTH', 'EAST', 'SOUTH', 'WEST']),
  }),
  goal: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
  }),
  obstacles: z.array(
    z.object({
      x: z.number().int().nonnegative(),
      y: z.number().int().nonnegative(),
    })
  ),
  availableBlocks: z.array(z.string()).min(1),
  maxActions: z.number().int().positive(),
});

export type LevelConfigJSON = z.infer<typeof levelConfigSchema>;

// ============================================================================
// Attempt Input Schema
// ============================================================================

export const recordAttemptInputSchema = z.object({
  profileId: uuidSchema,
  levelId: uuidSchema,
  attemptNumber: z.number().int().positive(),
  successful: z.boolean(),
  actionsUsed: z.number().int().nonnegative(),
  optimalActions: z.number().int().positive().nullable().optional(),
  collisions: z.number().int().nonnegative().default(0),
  hintsUsed: z.number().int().nonnegative().default(0),
  programChanges: z.number().int().nonnegative().default(0),
  timeToCompleteMs: z.number().int().nonnegative().nullable().optional(),
  errorTypes: z.array(z.string()).default([]),
  programData: z.array(z.any()).default([]),
  startedAt: z.string().optional(),
  completedAt: z.string().nullable().optional(),
});

export type RecordAttemptInput = z.input<typeof recordAttemptInputSchema>;

// ============================================================================
// Progress Input Schema
// ============================================================================

export const updateProgressInputSchema = z.object({
  profileId: uuidSchema,
  levelId: uuidSchema,
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  stars: z.number().int().min(0).max(3),
  bestAttempts: z.number().int().nonnegative().default(0),
  bestTimeMs: z.number().int().nonnegative().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

export type UpdateProgressInput = z.input<typeof updateProgressInputSchema>;

// ============================================================================
// DTOs
// ============================================================================

export interface ActiveLevelDTO {
  id: string;
  islandId: string;
  islandSlug: string;
  islandName: string;
  code: string;
  title: string;
  description: string | null;
  levelType: string;
  orderIndex: number;
  difficulty: number;
  configuration: LevelConfigJSON;
  concepts: {
    slug: string;
    name: string;
    weight: number;
    role: string;
  }[];
}

export interface PlayerProgressDTO {
  id: string;
  profileId: string;
  levelId: string;
  levelCode?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  stars: number;
  bestAttempts: number;
  bestTimeMs: number | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface PlayerMasteryDTO {
  conceptId: string;
  conceptSlug: string;
  conceptName: string;
  score: number;
  status: string;
  evidenceCount: number;
  updatedAt: string;
}
