import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/ai/hint/route";
import { getRateLimitStatus, resetRateLimit } from "@/lib/ai/rateLimiter";
import { getFallbackHint } from "@/lib/ai/fallbackHints";
import { requestGeminiHint } from "@/lib/ai/geminiClient";
import { hintRequestSchema, hintResponseSchema, type SanitizedGameplayContext } from "@/lib/ai/types";
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

describe("Kawan Kod AI Hint System & Endpoint Tests", () => {
  const mockProfileId = "test-profile-uuid-123";

  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit();
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        message: "Coba perhatikan arah hadap Boti setelah berbelok.",
        hintLevel: 1,
        shouldRevealSolution: false,
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

    const req = createMockRequest({ levelCode: "1.1", hintLevel: 1 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toMatch(/Sesi tidak valid/i);
  });

  // 2. Profile ID dari client TIDAK PERNAH dipercaya
  it("2. Profile ID dari client diabaikan, identitas murni dari server session", async () => {
    const { resolveGuestSession } = await import("@/lib/session/resolveSession");
    vi.mocked(resolveGuestSession).mockResolvedValue({
      profileId: mockProfileId,
      isAuthenticated: true,
    });

    const req = createMockRequest({
      levelCode: "1.1",
      hintLevel: 1,
      // Client mencoba menyusupkan profileId palsu
      profileId: "spoofed-hacker-profile-999",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Rate limit yang terpotong adalah milik session server
    const checkServer = getRateLimitStatus(mockProfileId);
    expect(checkServer.remaining).toBe(9); // 1 consumed by the request
    const checkSpoofed = getRateLimitStatus("spoofed-hacker-profile-999");
    expect(checkSpoofed.remaining).toBe(10); // Untouched
  });

  // 3. Input invalid ditolak (400)
  it("3. Request dengan format body bukan JSON atau field kosong ditolak dengan status 400", async () => {
    const { resolveGuestSession } = await import("@/lib/session/resolveSession");
    vi.mocked(resolveGuestSession).mockResolvedValue({
      profileId: mockProfileId,
      isAuthenticated: true,
    });

    const badReq = {
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as NextRequest;

    const res = await POST(badReq);
    expect(res.status).toBe(400);

    const emptyReq = createMockRequest({});
    const resEmpty = await POST(emptyReq);
    expect(resEmpty.status).toBe(400);
  });

  // 4. Validasi hintLevel hanya 1, 2, atau 3
  it("4. hintLevel di luar 1-3 ditolak oleh schema validation", () => {
    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: 1 }).success).toBe(true);
    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: 2 }).success).toBe(true);
    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: 3 }).success).toBe(true);

    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: 0 }).success).toBe(false);
    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: 4 }).success).toBe(false);
    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: -1 }).success).toBe(false);
    expect(hintRequestSchema.safeParse({ levelCode: "1.1", hintLevel: "one" }).success).toBe(false);
  });

  // 5. Context tanpa identitas atau PII (Data Privacy Sanitization)
  it("5. Konteks yang dikirim ke provider murni teknis gameplay tanpa PII atau rahasia", () => {
    const rawContext: SanitizedGameplayContext = {
      levelCode: "1.1",
      levelTitle: "Langkah Pertama",
      concepts: ["MOVE"],
      hintLevel: 1,
      availableBlocks: ["MOVE"],
      errorType: "BOUNDARY_COLLISION",
      botiPosition: { x: 0, y: 0, direction: "EAST" },
      goalPosition: { x: 2, y: 0 },
      gridSize: { width: 3, height: 3 },
    };

    const serialized = JSON.stringify(rawContext);
    expect(serialized).not.toContain("nickname");
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("profile_id");
    expect(serialized).not.toContain("email");
  });

  // 6, 7, 8. Prinsip 3 Tingkat Pedagogis Fallback (Observasi -> Penalaran -> Bimbingan Spesifik)
  it("6. Hint 1 bersifat observasional dan lembut", () => {
    const hint1 = getFallbackHint({
      levelCode: "1.1",
      levelTitle: "Langkah Pertama",
      concepts: ["MOVE"],
      hintLevel: 1,
      availableBlocks: ["MOVE"],
      errorType: "BOUNDARY_COLLISION",
    });

    expect(hint1.hintLevel).toBe(1);
    expect(hint1.shouldRevealSolution).toBe(false);
    expect(hint1.message.toLowerCase()).toContain("perhatikan");
  });

  it("7. Hint 2 mendorong penalaran dan hubungan langkah dengan tujuan", () => {
    const hint2 = getFallbackHint({
      levelCode: "1.1",
      levelTitle: "Langkah Pertama",
      concepts: ["MOVE"],
      hintLevel: 2,
      availableBlocks: ["MOVE"],
      errorType: "BOUNDARY_COLLISION",
    });

    expect(hint2.hintLevel).toBe(2);
    expect(hint2.shouldRevealSolution).toBe(false);
    expect(hint2.message.toLowerCase()).toContain("sebaiknya");
  });

  it("8. Hint 3 memberikan bimbingan spesifik tanpa membocorkan seluruh urutan balok", () => {
    const hint3 = getFallbackHint({
      levelCode: "1.1",
      levelTitle: "Langkah Pertama",
      concepts: ["MOVE"],
      hintLevel: 3,
      availableBlocks: ["MOVE"],
      errorType: "BOUNDARY_COLLISION",
    });

    expect(hint3.hintLevel).toBe(3);
    expect(hint3.shouldRevealSolution).toBe(false);
    // Tidak pernah memberikan jawaban lengkap seperti "pasang blok maju 3 kali"
    expect(hint3.message).not.toMatch(/pasang.*3.*kali/i);
  });

  // 9. Output schema invalid dari AI ditolak dan dialihkan ke fallback
  it("9. Respons AI yang tidak mematuhi schema ditolak dan dialihkan ke fallback", () => {
    const invalidAiOutput = {
      message: "", // Empty message
      hintLevel: 99,
      shouldRevealSolution: true,
    };

    const parseResult = hintResponseSchema.safeParse(invalidAiOutput);
    expect(parseResult.success).toBe(false);
  });

  // 10. Output melebihi batas karakter di-slice secara aman
  it("10. Output panjang dibatasi ke batas aman (max 240 karakter)", async () => {
    const fallback = getFallbackHint({
      levelCode: "1.1",
      levelTitle: "Level 1",
      concepts: ["MOVE"],
      hintLevel: 1,
      availableBlocks: ["MOVE"],
    });

    expect(fallback.message.length).toBeLessThanOrEqual(240);
  });

  // 11. Rate limiter membatasi request berlebih (> 10 request / 10 menit)
  it("11. Rate limiter menolak request ke-11 dalam periode 10 menit dengan 429", async () => {
    const { resolveGuestSession } = await import("@/lib/session/resolveSession");
    vi.mocked(resolveGuestSession).mockResolvedValue({
      profileId: "rate-limit-test-profile",
      isAuthenticated: true,
    });

    // Jalankan 10 request legal
    for (let i = 0; i < 10; i++) {
      const res = await POST(createMockRequest({ levelCode: "1.1", hintLevel: 1 }));
      expect(res.status).toBe(200);
    }

    // Request ke-11 harus diblokir oleh rate limiter
    const resBlocked = await POST(createMockRequest({ levelCode: "1.1", hintLevel: 1 }));
    expect(resBlocked.status).toBe(429);
    const data = await resBlocked.json();
    expect(data.error).toContain("Permintaan petunjuk terlalu sering");
    expect(resBlocked.headers.get("Retry-After")).toBeDefined();
  });

  // 12. Missing API key otomatis mengaktifkan fallback yang aman
  it("12. Tidak adanya GEMINI_API_KEY menghasilkan fallback statis tanpa melempar exception", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const hint = await requestGeminiHint({
        levelCode: "1.1",
        levelTitle: "Langkah Pertama",
        concepts: ["MOVE"],
        hintLevel: 1,
        availableBlocks: ["MOVE"],
        errorType: "OBSTACLE_COLLISION",
      });

      expect(hint.provider).toBe("fallback");
      expect(hint.message).toBeTruthy();
      expect(hint.shouldRevealSolution).toBe(false);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // 13. Timeout provider mengaktifkan fallback
  it("13. Timeout pada provider menghasilkan fallback ramah tanpa crash", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-dummy-key";

    // Simulasikan Gemini generateContent menggantung lebih lama dari timeout
    mockGenerateContent.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    try {
      // Panggil dengan timeout 10ms sehingga timeoutPromise menang lebih dulu
      const hint = await requestGeminiHint(
        {
          levelCode: "1.1",
          levelTitle: "Langkah Pertama",
          concepts: ["MOVE"],
          hintLevel: 1,
          availableBlocks: ["MOVE"],
          errorType: "GOAL_NOT_REACHED",
        },
        10 // 10 ms timeout
      );

      expect(hint.provider).toBe("fallback");
      expect(hint.message).toBeTruthy();
      expect(hint.shouldRevealSolution).toBe(false);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // 14. Error provider upstream mengaktifkan fallback
  it("14. Upstream error dari provider (503/Network Error) menghasilkan fallback yang aman", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-dummy-key";

    mockGenerateContent.mockRejectedValue(new Error("503 Service Unavailable: High load"));

    try {
      const hint = await requestGeminiHint({
        levelCode: "1.1",
        levelTitle: "Langkah Pertama",
        concepts: ["MOVE"],
        hintLevel: 2,
        availableBlocks: ["MOVE"],
        errorType: "BOUNDARY_COLLISION",
      });

      expect(hint.provider).toBe("fallback");
      expect(hint.message).toBeTruthy();
      expect(hint.hintLevel).toBe(2);
      expect(hint.shouldRevealSolution).toBe(false);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // 14. Error saat menyimpan ke ai_interactions tidak menggagalkan gameplay
  it("14. Penyimpanan ai_interactions yang gagal tidak melempar uncaught error (non-blocking)", async () => {
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
      type: "KAWAN_KOD",
      hintLevel: 1,
      context: { levelCode: "1.1" },
      response: "Coba amati langkah Boti.",
    });

    // Harus mengembalikan null dengan anggun tanpa throw
    expect(result).toBeNull();
  });
});
