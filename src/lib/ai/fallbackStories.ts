import type { SanitizedStoryContext, StoryResponse } from "./storyTypes";

/**
 * Deterministic Pedagogical Story Fallbacks for Cipi Story
 *
 * Digunakan jika Gemini API tidak tersedia, kuota habis, timeout, atau API key belum dikonfigurasi.
 * Mengikuti struktur 4 bagian naratif:
 * 1. Situasi Petualangan (Opening)
 * 2. Tantangan (Challenge)
 * 3. Keberhasilan Objektif (Resolution)
 * 4. Hook Petualangan Berikutnya (Transition)
 */

interface StoryTemplate {
  title: string;
  story: string;
  nextTeaser: string;
}

const DESA_CIPI_TEMPLATES: Record<string, StoryTemplate> = {
  MOVE: {
    title: "Langkah Pertama di Desa Cipi",
    story:
      "Di jalan setapak Desa Cipi yang cerah, sebuah bintang emas berkilau di ujung lintasan. Cipi harus menempuh jalur lurus tanpa melenceng ke semak-semak. Berkat urutan langkah maju yang kamu susun dengan rapi, Cipi melangkah mantap hingga berhasil menyentuh bintang tujuannya.",
    nextTeaser:
      "Namun di kelokan desa berikutnya, aroma manis buah apel mulai tercium memanggil Cipi!",
  },
  TURN: {
    title: "Menemukan Arah yang Tepat",
    story:
      "Jalan desa mulai berbelok di dekat pondok kayu tua. Cipi sempat ragu menentukan arah hadap, tetapi balok belokan yang kamu berikan mengarahkannya ke jalur yang tepat. Cipi berjalan riang menyusuri jalan baru dan menyentuh bintang sasarannya.",
    nextTeaser:
      "Tantangan berikutnya membutuhkan kombinasi langkah maju dan belokan yang semakin lincah!",
  },
  DEFAULT: {
    title: "Keberhasilan di Desa Cipi",
    story:
      "Suasana Desa Cipi terasa begitu damai saat Cipi memulai perjalanannya. Rute tantangan membutuhkan ketelitian agar tidak tersesat. Dengan balok kode yang kamu rancang, Cipi berhasil menyelesaikan misi dan mengumpulkan bintang kejayaan.",
    nextTeaser:
      "Petualangan di desa masih menyimpan banyak rahasia baru untuk dipecahkan bersama Cipi!",
  },
};

const HUTAN_POLA_TEMPLATES: Record<string, StoryTemplate> = {
  PATTERN: {
    title: "Menyibak Rahasia Hutan Pola",
    story:
      "Pepohonan rindang di Hutan Pola menyembunyikan teka-teki langkah yang saling bersambung. Cipi harus membaca irama langkah yang berulang agar jalannya tetap efisien. Berkat ketelitianmu menyusun pola instruksi, Cipi meluncur melewati rintangan pohon dengan sempurna.",
    nextTeaser:
      "Di tengah kabut hutan yang semakin lebat, pola langkah yang lebih menantang telah menantimu!",
  },
  ALGORITHM: {
    title: "Jejak Langkah Cerdas",
    story:
      "Bebatuan terjal di Hutan Pola mengharuskan Cipi berpikir strategis sebelum melangkah. Setiap instruksi yang kamu berikan menjadi panduan berharga bagi Cipi. Cipi melangkah penuh percaya diri dan meraih bintang target tepat waktu.",
    nextTeaser:
      "Hutan Pola masih membentang luas dengan teka-teki algoritma yang kian memikat!",
  },
  DEFAULT: {
    title: "Petualangan di Hutan Pola",
    story:
      "Di antara dahan rimbun Hutan Pola, Cipi menemukan jalur baru yang penuh teka-teki. Kamu berhasil memandu Cipi dengan instruksi yang tepat sasaran. Bintang emas kini bersinar terang di tangan Cipi sebagai tanda keberhasilanmu.",
    nextTeaser:
      "Tantangan berikutnya sudah menanti di balik rindangnya pepohonan hutan!",
  },
};

const DEFAULT_GLOBAL_TEMPLATE: StoryTemplate = {
  title: "Cipi Meraih Bintang Petualangan",
  story:
    "Cipi berdiri penuh semangat di awal lintasan petualangan. Dengan balok instruksi yang kamu susun dengan cermat, Cipi melangkah mantap menyusuri arena hingga berhasil meraih bintang sasaran. Kerja sama kalian sungguh luar biasa!",
  nextTeaser:
    "Petualangan baru sudah menunggu di depan mata. Yuk, lanjutkan langkahmu!",
};

export function getFallbackStory(context: SanitizedStoryContext): StoryResponse {
  let template: StoryTemplate = DEFAULT_GLOBAL_TEMPLATE;

  const islandSlug = context.islandSlug?.toLowerCase() || "";
  const hasTurn = context.concepts.some((c) =>
    ["TURN", "cipi_turn", "boti_turn", "TURN_LEFT", "TURN_RIGHT"].includes(c)
  );
  const hasPattern = context.concepts.some((c) =>
    ["Pattern", "Algorithm", "LOOP"].includes(c)
  );

  if (
    islandSlug.includes("desa-cipi") ||
    islandSlug.includes("cipi") ||
    islandSlug.includes("desa-boti") ||
    islandSlug.includes("boti")
  ) {
    if (hasTurn) {
      template = DESA_CIPI_TEMPLATES.TURN;
    } else {
      template = DESA_CIPI_TEMPLATES.MOVE;
    }
  } else if (islandSlug.includes("hutan-pola") || islandSlug.includes("hutan")) {
    if (hasPattern) {
      template = HUTAN_POLA_TEMPLATES.PATTERN;
    } else {
      template = HUTAN_POLA_TEMPLATES.ALGORITHM;
    }
  }

  // Sesuaikan nextTeaser dengan level berikutnya jika tersedia konteksnya
  let customizedTeaser = template.nextTeaser;
  if (context.nextLevelCode && context.nextLevelTitle) {
    customizedTeaser = `Tantangan berikutnya: Level ${context.nextLevelCode} — ${context.nextLevelTitle}. Kira-kira, kejutan apa yang menunggu Cipi di sana?`;
  }

  return {
    title: `${context.levelTitle}: ${template.title}`,
    story: template.story,
    nextTeaser: customizedTeaser,
    provider: "fallback",
  };
}
