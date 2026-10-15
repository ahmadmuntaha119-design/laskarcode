import { NextResponse, type NextRequest } from "next/server";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { storyRequestSchema } from "@/lib/ai/storyTypes";
import { checkRateLimit } from "@/lib/ai/rateLimiter";
import { requestGeminiStory } from "@/lib/ai/storyClient";
import { getFallbackStory } from "@/lib/ai/fallbackStories";
import { getLevelByCode, getNextLevel, getIslandBySlug } from "@/game/levels/catalog";
import { AiInteractionService } from "@/services/aiInteractionService";

/**
 * API Route Handler: /api/ai/story (Task AI-2)
 * Endpoint server-side terproteksi untuk Boti Story: AI Storytelling setelah level selesai.
 *
 * FITUR KEAMANAN, PRIVASI & IDEMPOTENSI:
 * 1. Hanya dapat diakses oleh guest session yang valid (terverifikasi via signed cookie server).
 * 2. profileId TIDAK PERNAH diambil dari request body client.
 * 3. Idempotensi: Jika cerita untuk percobaan (attemptId) ini sudah pernah dibuat, kembalikan dari database tanpa memanggil Gemini lagi.
 * 4. Context ke Gemini disanitasi total (NO nickname, NO UUID, NO session tokens).
 * 5. Structured JSON output divalidasi ketat via Zod.
 * 6. Fallback deterministik berbasis pulau dan konsep jika Gemini API gagal, timeout, atau kuota habis.
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Verifikasi Sesi Guest di Server
    const session = await resolveGuestSession();
    if (!session || !session.profileId) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau telah kedaluwarsa. Silakan muat ulang halaman." },
        { status: 401 }
      );
    }

    // 2. Parse & Validasi Request Body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Format data permintaan tidak valid (harus JSON)." },
        { status: 400 }
      );
    }

    const parseResult = storyRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Data permintaan cerita tidak valid.",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { levelCode, attemptId, actionsUsed, stars, collisions } = parseResult.data;

    // 3. Validasi Keberadaan Level di Katalog
    const level = getLevelByCode(levelCode);
    if (!level) {
      return NextResponse.json(
        { error: `Level '${levelCode}' tidak ditemukan dalam katalog sistem.` },
        { status: 404 }
      );
    }

    const aiService = new AiInteractionService();

    // 4. Pencegahan Duplikasi & Idempotensi: Cek apakah cerita untuk attempt ini sudah pernah dibuat
    if (attemptId) {
      const existingStory = await aiService.getSavedStory(session.profileId, {
        attemptId,
      });
      if (existingStory) {
        return NextResponse.json({
          success: true,
          ...existingStory,
          provider: "saved",
        });
      }
    }

    // 5. Rate Limiting per Profil
    const rateLimit = checkRateLimit(session.profileId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Permintaan cerita terlalu sering. Silakan istirahat sejenak ya!",
          retryAfterMs: rateLimit.resetInMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetInMs / 1000)),
          },
        }
      );
    }

    // 6. Data Pulau & Level Berikutnya
    const island = getIslandBySlug(level.islandSlug);
    const nextLevel = getNextLevel(level.code);

    // 7. Bangun Konteks Cerita yang Sudah Disanitasi (NO PII)
    const sanitizedContext = {
      levelCode: level.code,
      levelTitle: level.title,
      islandName: island?.name || "Desa Boti",
      islandSlug: level.islandSlug,
      concepts: [...level.concepts],
      objective: level.description,
      actionsUsed: actionsUsed ?? undefined,
      stars: stars ?? undefined,
      collisions: collisions ?? undefined,
      nextLevelCode: nextLevel?.code || null,
      nextLevelTitle: nextLevel?.title || null,
    };

    // 8. Dapatkan Cerita dari Gemini (atau Fallback jika error/timeout/API key kosong)
    const storyResponse = await requestGeminiStory(sanitizedContext);

    // 9. Simpan Riwayat Interaksi secara Aman (Non-blocking)
    void aiService.recordInteraction({
      profileId: session.profileId,
      levelId: null,
      attemptId: attemptId || null,
      type: "BOTI_STORY",
      context: {
        levelCode: sanitizedContext.levelCode,
        islandSlug: sanitizedContext.islandSlug,
        concepts: sanitizedContext.concepts,
        actionsUsed: sanitizedContext.actionsUsed,
        stars: sanitizedContext.stars,
      },
      response: JSON.stringify(storyResponse),
    });

    // 10. Kirimkan Respon Cerita ke Klien
    return NextResponse.json({
      success: true,
      ...storyResponse,
    });
  } catch (err: unknown) {
    console.warn("Exception in /api/ai/story, serving graceful fallback:", err);
    const fallback = getFallbackStory({
      levelCode: "1.1",
      levelTitle: "Petualangan Boti",
      islandName: "Desa Boti",
      islandSlug: "desa-boti",
      concepts: ["MOVE"],
      objective: "Bantu Boti mencapai bintang!",
    });
    return NextResponse.json({
      success: true,
      ...fallback,
      provider: "fallback",
    });
  }
}
