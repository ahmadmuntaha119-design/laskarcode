import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

export interface RecordAiInteractionInput {
  profileId: string;
  levelId?: string | null;
  attemptId?: string | null;
  type: "KAWAN_KOD" | "BOTI_STORY";
  hintLevel?: number | null;
  context: Record<string, unknown>;
  response: string;
}

export class AiInteractionService {
  private client?: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client;
  }

  private async getClient(): Promise<SupabaseClient<Database>> {
    if (this.client) return this.client;

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      return createAdminClient();
    } catch {
      const { createClient } = await import("@/lib/supabase/server");
      return await createClient();
    }
  }

  /**
   * Menyimpan riwayat interaksi AI secara aman ke tabel `public.ai_interactions`.
   * Gagal secara senyap (tidak memblokir permainan atau petunjuk anak jika database error).
   */
  public async recordInteraction(
    input: RecordAiInteractionInput
  ): Promise<{ id: string } | null> {
    try {
      const client = await this.getClient();

      // Sanitasi tambahan: pastikan context tidak memuat PII atau secret
      const sanitizedContext: Json = {
        levelCode: typeof input.context.levelCode === "string" ? input.context.levelCode : null,
        concepts: Array.isArray(input.context.concepts) ? input.context.concepts.map(String) : [],
        errorType: typeof input.context.errorType === "string" ? input.context.errorType : null,
        hintLevel: input.hintLevel ?? null,
      };

      const { data, error } = await client
        .from("ai_interactions")
        .insert({
          profile_id: input.profileId,
          level_id: input.levelId || null,
          attempt_id: input.attemptId || null,
          type: input.type,
          hint_level: input.hintLevel ?? null,
          context: sanitizedContext,
          response: input.response,
        })
        .select("id")
        .single();

      if (error) {
        console.warn("Penyimpanan ai_interactions gagal (non-blocking):", error.message);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.warn("Exception saat menyimpan ai_interactions (non-blocking):", {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  /**
   * Mengambil cerita Boti Story yang sudah pernah dibuat untuk profil dan attempt/level ini (idempotensi).
   * Mencegah pemanggilan ulang ke Gemini API saat browser di-refresh.
   */
  public async getSavedStory(
    profileId: string,
    options?: { attemptId?: string | null; levelId?: string | null }
  ): Promise<{ title: string; story: string; nextTeaser?: string | null } | null> {
    try {
      const client = await this.getClient();

      let query = client
        .from("ai_interactions")
        .select("response")
        .eq("profile_id", profileId)
        .eq("type", "BOTI_STORY");

      if (options?.attemptId) {
        query = query.eq("attempt_id", options.attemptId);
      } else if (options?.levelId) {
        query = query.eq("level_id", options.levelId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data?.response) {
        return null;
      }

      try {
        const parsed = JSON.parse(data.response);
        if (parsed && typeof parsed.title === "string" && typeof parsed.story === "string") {
          return {
            title: parsed.title,
            story: parsed.story,
            nextTeaser: parsed.nextTeaser ?? null,
          };
        }
      } catch {
        return null;
      }

      return null;
    } catch {
      return null;
    }
  }
}

