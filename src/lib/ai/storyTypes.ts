import { z } from "zod";

/**
 * Zod Schema & Types untuk Boti Story (Task AI-2)
 */

export const storyRequestSchema = z.object({
  levelCode: z.string().min(1, "Kode level wajib diisi"),
  attemptId: z.string().uuid("ID percobaan tidak valid").optional().nullable(),
  actionsUsed: z.number().int().nonnegative().optional(),
  stars: z.number().int().min(1).max(3).optional(),
  collisions: z.number().int().nonnegative().optional(),
});

export type StoryRequest = z.infer<typeof storyRequestSchema>;

export const storyResponseSchema = z.object({
  title: z
    .string()
    .min(1, "Judul cerita tidak boleh kosong")
    .max(60, "Judul cerita terlalu panjang"),
  story: z
    .string()
    .min(10, "Cerita terlalu pendek")
    .max(600, "Cerita terlalu panjang (maksimal 600 karakter / ~80 kata)"),
  nextTeaser: z
    .string()
    .max(200, "Teaser berikutnya terlalu panjang")
    .optional()
    .nullable(),
  provider: z.enum(["gemini", "fallback"]).optional(),
});

export type StoryResponse = z.infer<typeof storyResponseSchema>;

/**
 * Konteks gameplay yang telah disanitasi (Murni teknis tanpa PII anak)
 */
export interface SanitizedStoryContext {
  levelCode: string;
  levelTitle: string;
  islandName: string;
  islandSlug: string;
  concepts: string[];
  objective: string;
  actionsUsed?: number;
  stars?: number;
  collisions?: number;
  nextLevelCode?: string | null;
  nextLevelTitle?: string | null;
}
