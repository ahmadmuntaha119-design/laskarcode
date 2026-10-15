import { NextResponse, type NextRequest } from "next/server";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { hintRequestSchema } from "@/lib/ai/types";
import { checkRateLimit } from "@/lib/ai/rateLimiter";
import { requestGeminiHint } from "@/lib/ai/geminiClient";
import { getLevelByCode } from "@/game/levels/catalog";
import { AiInteractionService } from "@/services/aiInteractionService";

/**
 * API Route Handler: /api/ai/hint
 * Endpoint server-side terproteksi untuk sistem petunjuk edukasi Kawan Kod.
 *
 * FITUR KEAMANAN & PRIVASI:
 * 1. Hanya dapat diakses oleh guest session yang valid (terverifikasi via cookie server).
 * 2. profileId TIDAK PERNAH dipercaya dari request body client.
 * 3. Rate limiting in-memory (~10 request per 10 menit per profil).
 * 4. Context ke Gemini disanitasi total (NO nickname, NO UUID, NO session tokens).
 * 5. Structured JSON output yang divalidasi via Zod.
 * 6. Fallback statis deterministik jika Gemini API gagal, timeout, atau kuota habis.
 */

export async function POST(req: NextRequest) {
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

  const parseResult = hintRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Data permintaan petunjuk tidak valid.",
        issues: parseResult.error.issues,
      },
      { status: 400 }
    );
  }

  const { levelCode, hintLevel, attemptId, currentErrorType } = parseResult.data;

  // 3. Validasi Keberadaan Level
  const level = getLevelByCode(levelCode);
  if (!level) {
    return NextResponse.json(
      { error: `Level '${levelCode}' tidak ditemukan dalam katalog sistem.` },
      { status: 404 }
    );
  }

  // 4. Rate Limiting per Profil
  const rateLimit = checkRateLimit(session.profileId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Permintaan petunjuk terlalu sering. Silakan coba pikirkan kembali langkahmu sebentar ya!",
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

  // 5. Bangun Konteks Permainan yang Sudah Disanitasi (NO PII)
  const sanitizedContext = {
    levelCode: level.code,
    levelTitle: level.title,
    concepts: [...level.concepts],
    hintLevel: hintLevel as 1 | 2 | 3,
    availableBlocks: [...level.availableBlocks],
    errorType: currentErrorType || undefined,
    goalPosition: level.goal,
    botiPosition: level.start,
    gridSize: level.grid,
  };

  // 6. Dapatkan Petunjuk dari Gemini (atau Fallback jika error/timeout)
  const hintResponse = await requestGeminiHint(sanitizedContext);

  // 7. Simpan Riwayat Interaksi secara Aman (Non-blocking)
  const aiService = new AiInteractionService();
  void aiService.recordInteraction({
    profileId: session.profileId,
    levelId: null,
    attemptId: attemptId || null,
    type: "KAWAN_KOD",
    hintLevel,
    context: sanitizedContext,
    response: hintResponse.message,
  });

  // 8. Kirimkan Respon ke Klien
  return NextResponse.json({
    success: true,
    ...hintResponse,
  });
}
