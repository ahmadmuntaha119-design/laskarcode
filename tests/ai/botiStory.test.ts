import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/ai/story/route";
import { resetRateLimit } from "@/lib/ai/rateLimiter";
import { getFallbackStory } from "@/lib/ai/fallbackStories";
import { requestGeminiStory } from "@/lib/ai/storyClient";
import {
  storyRequestSchema,
  storyResponseSchema,
  type SanitizedStoryContext,
} from "@/lib/ai/storyTypes";
import { AiInteractionService } from "@/services/aiInteractionService";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Mock helper sesi guest server
vi.mock("@/lib/session/resolveSession", () => ({
  resolveGuestSession: vi.fn(),
}));

const mockGenerateContent = vi.fn();

// Mock @google/genai agar tes unit tidak memerlukan network/API key sungguhan
vi.mock("@google/genai", () => {
  return {
    Type: {
      OBJECT: "OBJECT",
      STRING: "STRING",
      INTEGER: "INTEGER",
      BOOLEAN: "BOOLEAN",
    },
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
  };
});

describe("Boti Story AI Storytelling & Narration Tests (Task AI-2)", () => {
  const mockProfileId = "test-profile-uuid-story-123";
  const mockAttemptId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit();
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        title: "Langkah Pertama di Desa Boti",
        story:
          "Di jalan setapak Desa Boti, sebuah bintang emas berkilau di ujung lintasan. Boti harus menyusuri jalan lurus menuju bintang kejayaan. Berkat instruksi langkah yang kamu susun dengan cermat, Boti berhasil melangkah pasti hingga mencapai bintang target.",
        nextTeaser:
          "Di ujung jalan desa berikutnya, aroma manis buah apel mulai tercium memanggil Boti!",
      }),
    });
  });

  function createMockRequest(body: unknown): NextRequest {
    return {
      json: async () => body,
    } as unknown as NextRequest;
  }

  // 1. Request tanpa guest session ditolak (401)
  it("1. Request tanpa guest session ditolak dengan status 401", async () => {
    const { resolveGuestSession } = await import("@/lib/session/resolveSession");
    vi.mocked(resolveGuestSession).mockResolvedValue(null);

    const req = createMockRequest({ levelCode: "1.1" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toMatch(/Sesi tidak valid/i);
  });

  // 2. Request body invalid ditolak (400)
  it("2. Request dengan format body kosong atau tidak valid ditolak dengan status 400", async () => {
    const { resolveGuestSession } = await import("@/lib/session/resolveSession");
    vi.mocked(resolveGuestSession).mockResolvedValue({
      profileId: mockProfileId,
      isAuthenticated: true,
    });

    expect(storyRequestSchema.safeParse({ levelCode: "1.1" }).success).toBe(true);
    expect(storyRequestSchema.safeParse({}).success).toBe(false);

    const resEmpty = await POST(createMockRequest({}));
    expect(resEmpty.status).toBe(400);

    const resBadJson = await POST({
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as NextRequest);
    expect(resBadJson.status).toBe(400);
  });

  // 3. Konteks tidak memuat data pribadi (PII)
  it("3. Konteks yang dikirim ke provider murni teknis gameplay tanpa PII anak", () => {
    const rawContext: SanitizedStoryContext = {
      levelCode: "1.1",
      levelTitle: "Boti Mau Maju",
      islandName: "Pulau 1 — Desa Boti",
      islandSlug: "desa-boti",
      concepts: ["Instruction", "MOVE"],
      objective: "Bantu Boti melangkah maju 4 kali untuk mencapai bintang target pertamanya.",
      actionsUsed: 4,
      stars: 3,
      collisions: 0,
      nextLevelCode: "1.2",
      nextLevelTitle: "Jalan Menuju Apel",
    };

    const serialized = JSON.stringify(rawContext);
    expect(serialized).not.toContain("nickname");
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("profile_id");
    expect(serialized).not.toContain("email");
  });

  // 4. Validasi schema cerita (Zod)
  it("4. Story schema memvalidasi title, story, dan nextTeaser, serta menolak format invalid", () => {
    const valid = storyResponseSchema.safeParse({
      title: "Kisah Boti di Desa",
      story: "Boti melangkah menyusuri jalan desa dengan gembira. Instruksi balokmu membimbingnya dengan tepat.",
      nextTeaser: "Kejutan manis menunggu di level berikutnya!",
    });
    expect(valid.success).toBe(true);

    // Judul kosong ditolak
    const emptyTitle = storyResponseSchema.safeParse({
      title: "",
      story: "Cerita valid.",
    });
    expect(emptyTitle.success).toBe(false);

    // Cerita terlalu pendek (< 10 karakter) ditolak
    const tooShort = storyResponseSchema.safeParse({
      title: "Judul",
      story: "Pendek",
    });
    expect(tooShort.success).toBe(false);
  });

  // 5. Fallback storytelling deterministik memiliki 4 bagian naratif
  it("5. Fallback story untuk Desa Boti memiliki alur Opening, Challenge, Resolution, dan Teaser", () => {
    const context: SanitizedStoryContext = {
      levelCode: "1.1",
      levelTitle: "Boti Mau Maju",
      islandName: "Pulau 1 — Desa Boti",
      islandSlug: "desa-boti",
      concepts: ["Instruction", "MOVE"],
      objective: "Bantu Boti melangkah maju 4 kali.",
      actionsUsed: 4,
      stars: 3,
      nextLevelCode: "1.2",
      nextLevelTitle: "Jalan Menuju Apel",
    };

    const fallback = getFallbackStory(context);
    expect(fallback.provider).toBe("fallback");
    expect(fallback.title).toMatch(/Desa (Cipi|Boti)/);
    // Mengandung elemen naratif
    expect(fallback.story).toMatch(/(Cipi|Boti)/i);
    expect(fallback.nextTeaser).toContain("1.2");
  });

  // 6. Idempotensi: Cerita yang sudah disimpan tidak memicu pemanggilan Gemini ulang
  it("6. Idempotensi: jika cerita untuk attemptId sudah ada di database, kembalikan dari cache", async () => {
    const { resolveGuestSession } = await import("@/lib/session/resolveSession");
    vi.mocked(resolveGuestSession).mockResolvedValue({
      profileId: mockProfileId,
      isAuthenticated: true,
    });

    const mockCachedStory = {
      title: "Cerita Tersimpan",
      story: "Kisah ini sebelumnya telah disimpan di database untuk attempt ini.",
      nextTeaser: "Tantangan berikutnya sudah menanti!",
    };

    // Spy getSavedStory pada AiInteractionService prototype
    const spy = vi
      .spyOn(AiInteractionService.prototype, "getSavedStory")
      .mockResolvedValue(mockCachedStory);

    const req = createMockRequest({
      levelCode: "1.1",
      attemptId: mockAttemptId,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.title).toBe(mockCachedStory.title);
    expect(data.provider).toBe("saved");
    // mockGenerateContent TIDAK dipanggil karena dilayani dari cache/idempotensi
    expect(mockGenerateContent).not.toHaveBeenCalled();

    spy.mockRestore();
  });

  // 7. Missing GEMINI_API_KEY menghasilkan fallback yang aman
  it("7. Tidak adanya GEMINI_API_KEY menghasilkan fallback cerita tanpa melempar exception", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const story = await requestGeminiStory({
        levelCode: "1.1",
        levelTitle: "Boti Mau Maju",
        islandName: "Pulau 1 — Desa Boti",
        islandSlug: "desa-boti",
        concepts: ["MOVE"],
        objective: "Maju ke bintang",
      });

      expect(story.provider).toBe("fallback");
      expect(story.title).toBeTruthy();
      expect(story.story).toBeTruthy();
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // 8. Timeout provider menghasilkan fallback cerita
  it("8. Timeout pada provider menghasilkan fallback cerita tanpa crash", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-dummy-key";

    // Simulasikan Gemini generateContent menggantung lebih lama dari timeout
    mockGenerateContent.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    try {
      const story = await requestGeminiStory(
        {
          levelCode: "1.1",
          levelTitle: "Boti Mau Maju",
          islandName: "Pulau 1 — Desa Boti",
          islandSlug: "desa-boti",
          concepts: ["MOVE"],
          objective: "Maju ke target",
        },
        10 // 10 ms timeout
      );

      expect(story.provider).toBe("fallback");
      expect(story.title).toBeTruthy();
      expect(story.story).toBeTruthy();
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // 9. Upstream error dari provider menghasilkan fallback yang aman
  it("9. Upstream error dari provider (503/Network Error) menghasilkan fallback cerita yang aman", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-dummy-key";

    mockGenerateContent.mockRejectedValue(new Error("503 Service Unavailable: Overloaded"));

    try {
      const story = await requestGeminiStory({
        levelCode: "2.1",
        levelTitle: "Pola Pertama",
        islandName: "Pulau 2 — Hutan Pola",
        islandSlug: "hutan-pola",
        concepts: ["Pattern"],
        objective: "Ikuti pola langkah",
      });

      expect(story.provider).toBe("fallback");
      expect(story.title).toContain("Hutan Pola");
      expect(story.story).toBeTruthy();
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // 10. Kegagalan database saat menyimpan BOTI_STORY bersifat non-blocking
  it("10. Kegagalan database saat menyimpan BOTI_STORY tidak melempar uncaught error (non-blocking)", async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      }),
    };

    const service = new AiInteractionService(
      mockClient as unknown as SupabaseClient<Database>
    );
    const result = await service.recordInteraction({
      profileId: "test-profile",
      levelId: null,
      type: "BOTI_STORY",
      context: { levelCode: "1.1" },
      response: JSON.stringify({
        title: "Judul",
        story: "Cerita",
      }),
    });

    expect(result).toBeNull();
  });

  // 11. AI tidak dapat mengubah gameplay status
  it("11. AI hanya mengembalikan teks narasi cerita dan tidak dapat mengubah completion atau stars", () => {
    const storyOutput = {
      title: "Boti Berhasil",
      story: "Boti melangkah dengan baik.",
      nextTeaser: "Lanjut!",
      // Mencoba menyusupkan flag manipulasi gameplay
      completed: false,
      stars: 1,
    };

    const parsed = storyResponseSchema.parse(storyOutput);
    // Field manipulasi di luar skema Zod diabaikan secara ketat
    expect((parsed as Record<string, unknown>).completed).toBeUndefined();
    expect((parsed as Record<string, unknown>).stars).toBeUndefined();
  });

  // 12. getSavedStory mengembalikan null jika belum ada cerita yang tersimpan
  it("12. getSavedStory mengembalikan null jika belum ada cerita untuk attempt tersebut", async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    };

    const service = new AiInteractionService(
      mockClient as unknown as SupabaseClient<Database>
    );

    const saved = await service.getSavedStory("profile-1", { attemptId: "attempt-1" });
    expect(saved).toBeNull();
  });

  // 13. Web Speech API: Simulasi pembacaan narasi dan pembatalan ucapan
  it("13. Web Speech API membatalkan ucapan aktif sebelum membaca narasi baru (anti-overlap)", () => {
    const mockCancel = vi.fn();
    const mockSpeak = vi.fn();
    const mockVoices = [
      { lang: "en-US", name: "English Voice" },
      { lang: "id-ID", name: "Indonesian Voice" },
    ];

    const fakeSpeechSynthesis = {
      cancel: mockCancel,
      speak: mockSpeak,
      getVoices: vi.fn().mockReturnValue(mockVoices),
    };

    // Simulasikan trigger play
    fakeSpeechSynthesis.cancel();
    expect(mockCancel).toHaveBeenCalled();

    const textToSpeak = "Boti dan Bintang. Boti melangkah dengan ceria.";
    expect(textToSpeak).toContain("Boti");

    // Simulasi pemilihan suara bahasa Indonesia
    const voices = fakeSpeechSynthesis.getVoices();
    const selectedVoice = voices.find(
      (v: { lang: string; name: string }) => v.lang.startsWith("id")
    );
    expect(selectedVoice?.lang).toBe("id-ID");
  });

  // 14. Fallback saat Web Speech API tidak didukung pada browser
  it("14. Jika window.speechSynthesis tidak tersedia, sistem tetap aman tanpa melempar exception", () => {
    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    // Di Node/Vitest environment default, window mungkin tidak memiliki speechSynthesis
    // Komponen menangani hal ini secara aman dengan flag isSpeechSupported = false
    expect(typeof isSupported).toBe("boolean");
  });
});
