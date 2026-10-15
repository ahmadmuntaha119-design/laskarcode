import type { HintLevel, HintResponse, SanitizedGameplayContext } from "./types";

/**
 * Deterministic Pedagogical Fallback Hints for Kawan Kod
 * Digunakan jika Gemini API tidak tersedia, kuota habis, timeout, atau kunci API belum dikonfigurasi.
 * Mengikuti prinsip 3 tingkat: Observasi -> Penalaran -> Bimbingan Spesifik.
 */

type FallbackMatrix = Record<
  string,
  Record<HintLevel, string>
>;

const FALLBACK_HINTS: FallbackMatrix = {
  BOUNDARY_COLLISION: {
    1: "Coba perhatikan arah Cipi saat melangkah. Apakah Cipi hampir melewati garis batas arena?",
    2: "Cipi memerlukan instruksi belok sebelum menyentuh dinding. Di titik mana Cipi sebaiknya berbelok?",
    3: "Periksa kembali blok belok dan jumlah langkah maju agar Cipi tetap berada di dalam jalur peta.",
  },
  OBSTACLE_COLLISION: {
    1: "Ada rintangan di depan Cipi! Coba lihat posisi batu penghalang di peta.",
    2: "Cipi tidak bisa menembus rintangan. Jalan mana yang kosong untuk memutari batu tersebut?",
    3: "Gunakan blok belok sebelum menabrak rintangan, lalu lanjutkan langkah maju di jalur yang bersih.",
  },
  MAX_ACTIONS_REACHED: {
    1: "Cipi sudah melangkah banyak sekali! Coba periksa apakah ada langkah yang berulang tanpa tujuan.",
    2: "Bintang target bisa dicapai dengan rute yang lebih singkat. Apakah ada gerakan yang memutar?",
    3: "Susun langkah Cipi langsung menuju sasaran tanpa langkah tambahan agar balok tidak habis.",
  },
  GOAL_NOT_REACHED: {
    1: "Cipi sudah berhenti melangkah, tapi bintangnya masih ada di depan! Berapa langkah lagi yang kurang?",
    2: "Perhatikan jarak antara posisi Cipi dan bintang target. Arah mana yang perlu Cipi tuju?",
    3: "Tambahkan blok langkah maju atau sesuaikan arah hadap Cipi agar tepat mendarat di bintang target.",
  },
  GENERAL_OBSERVATION: {
    1: "Coba perhatikan letak bintang target dari titik awal Cipi berdiri.",
    2: "Bayangkan jalur langkah Cipi satu per satu sebelum menekan tombol Jalankan.",
    3: "Gunakan kombinasi balok maju dan belok yang tersedia untuk membuat rute menuju target.",
  },
};

/**
 * Mendapatkan petunjuk fallback yang sesuai dengan konteks permainan
 */
export function getFallbackHint(context: SanitizedGameplayContext): HintResponse {
  const errorKey = context.errorType && FALLBACK_HINTS[context.errorType]
    ? context.errorType
    : "GENERAL_OBSERVATION";

  const hintsByLevel = FALLBACK_HINTS[errorKey] || FALLBACK_HINTS.GENERAL_OBSERVATION;
  const message = hintsByLevel[context.hintLevel] || hintsByLevel[1];

  return {
    message,
    hintLevel: context.hintLevel,
    shouldRevealSolution: false,
    provider: "fallback",
    errorType: context.errorType,
  };
}
