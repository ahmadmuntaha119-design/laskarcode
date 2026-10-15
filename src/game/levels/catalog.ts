import type { IslandDefinition, LevelDefinition } from "./types";

export const ISLANDS: readonly IslandDefinition[] = [
  {
    id: "desa-boti",
    slug: "desa-boti",
    name: "Pulau 1 — Desa Cipi",
    description: "Petualangan perdana Cipi mempelajari instruksi dasar, urutan langkah (sequence), dan arah belok.",
    orderIndex: 1,
    levelCodes: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"],
  },
  {
    id: "hutan-pola",
    slug: "hutan-pola",
    name: "Pulau 2 — Hutan Pola",
    description: "Eksplorasi algoritma langkah, pengenalan pola pergerakan (pattern), dan efisiensi rute di Hutan Pola.",
    orderIndex: 2,
    levelCodes: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
  },
];

export const LEVEL_CATALOG: readonly LevelDefinition[] = [
  // ==========================================
  // PULAU 1 — DESA CIPI
  // ==========================================
  {
    code: "1.1",
    islandSlug: "desa-boti",
    title: "Cipi Mau Maju",
    description: "Bantu Cipi melangkah maju 4 kali untuk mencapai bintang target pertamanya.",
    levelType: "Learn",
    orderIndex: 1,
    difficulty: 1,
    concepts: ["Instruction", "MOVE"],
    grid: { width: 5, height: 3 },
    start: { x: 0, y: 1, direction: "EAST" },
    goal: { x: 4, y: 1 },
    obstacles: [],
    availableBlocks: ["MOVE"],
    maxActions: 10,
  },
  {
    code: "1.2",
    islandSlug: "desa-boti",
    title: "Jalan Menuju Apel",
    description: "Pahami konsep urutan (Sequence) dengan menyusun langkah maju Cipi menuju apel emas.",
    levelType: "Learn",
    orderIndex: 2,
    difficulty: 1,
    concepts: ["Sequence", "Instruction"],
    grid: { width: 5, height: 3 },
    start: { x: 0, y: 2, direction: "EAST" },
    goal: { x: 4, y: 2 },
    obstacles: [{ x: 2, y: 1 }],
    availableBlocks: ["MOVE"],
    maxActions: 10,
  },
  {
    code: "1.3",
    islandSlug: "desa-boti",
    title: "Belok, Cipi!",
    description: "Pelajari cara berbelok menggunakan blok Belok Kanan dan Belok Kiri untuk menghindari pembatas.",
    levelType: "Learn",
    orderIndex: 3,
    difficulty: 2,
    concepts: ["Direction", "TURN"],
    grid: { width: 5, height: 4 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 3, y: 2 },
    obstacles: [
      { x: 3, y: 0 },
      { x: 1, y: 1 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 12,
  },
  {
    code: "1.4",
    islandSlug: "desa-boti",
    title: "Jalan Desa",
    description: "Rencanakan rute berliku di jalan desa agar Cipi sampai ke tujuan tanpa menabrak rintangan.",
    levelType: "Practice",
    orderIndex: 4,
    difficulty: 2,
    concepts: ["Sequence", "Direction", "Planning"],
    grid: { width: 5, height: 3 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 4, y: 2 },
    obstacles: [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 12,
  },
  {
    code: "1.5",
    islandSlug: "desa-boti",
    title: "Perbaiki Jalan Cipi",
    description: "Temukan dan perbaiki kesalahan (bug) pada urutan langkah Cipi agar tidak menabrak rintangan.",
    levelType: "Debugging",
    orderIndex: 5,
    difficulty: 2,
    concepts: ["Debugging", "Direction", "Sequence"],
    grid: { width: 5, height: 4 },
    start: { x: 0, y: 1, direction: "EAST" },
    goal: { x: 3, y: 3 },
    obstacles: [
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 2, y: 2 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 12,
  },
  {
    code: "1.6",
    islandSlug: "desa-boti",
    title: "Tantangan Kelulusan Cipi",
    description: "Uji keahlianmu menyelesaikan rute petualangan mandiri untuk membuktikan kelulusan dari Desa Cipi!",
    levelType: "Mastery Check",
    orderIndex: 6,
    difficulty: 3,
    concepts: ["Sequence", "Direction", "Planning", "Problem Solving"],
    grid: { width: 6, height: 4 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 5, y: 3 },
    obstacles: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 4, y: 2 },
      { x: 1, y: 3 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 16,
  },

  // ==========================================
  // PULAU 2 — HUTAN POLA
  // ==========================================
  {
    code: "2.1",
    islandSlug: "hutan-pola",
    title: "Ikuti Polanya",
    description: "Kenali pola tangga berulang (Maju-Maju-Belok) untuk melintasi Hutan Pola.",
    levelType: "Learn",
    orderIndex: 7,
    difficulty: 2,
    concepts: ["Pattern", "Algorithm"],
    grid: { width: 7, height: 3 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 6, y: 2 },
    obstacles: [
      { x: 3, y: 0 },
      { x: 5, y: 1 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 16,
  },
  {
    code: "2.2",
    islandSlug: "hutan-pola",
    title: "Jalan yang Hilang",
    description: "Lengkapi bagian pola yang rumpang dengan memprediksi arah dan jumlah langkah yang tepat.",
    levelType: "Learn",
    orderIndex: 8,
    difficulty: 2,
    concepts: ["Pattern", "Prediction"],
    grid: { width: 7, height: 4 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 6, y: 3 },
    obstacles: [
      { x: 2, y: 1 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 16,
  },
  {
    code: "2.3",
    islandSlug: "hutan-pola",
    title: "Urutkan Instruksi",
    description: "Susun kembali algoritma langkah Cipi yang berantakan agar berurutan dengan benar menuju target.",
    levelType: "Practice",
    orderIndex: 9,
    difficulty: 2,
    concepts: ["Algorithm", "Sequence"],
    grid: { width: 6, height: 4 },
    start: { x: 0, y: 1, direction: "EAST" },
    goal: { x: 4, y: 3 },
    obstacles: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 14,
  },
  {
    code: "2.4",
    islandSlug: "hutan-pola",
    title: "Dua Jalan",
    description: "Ada dua jalan menuju bintang! Pilih jalan atas yang lebih singkat atau jalan bawah yang memutar.",
    levelType: "Practice",
    orderIndex: 10,
    difficulty: 3,
    concepts: ["Efficiency", "Problem Solving"],
    grid: { width: 6, height: 5 },
    start: { x: 0, y: 2, direction: "EAST" },
    goal: { x: 5, y: 2 },
    obstacles: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 3 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 16,
  },
  {
    code: "2.5",
    islandSlug: "hutan-pola",
    title: "Perbaiki Algoritma",
    description: "Identifikasi kegagalan pola dalam algoritma dan rancang ulang urutan langkah yang benar.",
    levelType: "Debugging",
    orderIndex: 11,
    difficulty: 3,
    concepts: ["Debugging", "Pattern", "Algorithm"],
    grid: { width: 6, height: 4 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 5, y: 3 },
    obstacles: [
      { x: 2, y: 0 },
      { x: 3, y: 2 },
      { x: 1, y: 2 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 16,
  },
  {
    code: "2.6",
    islandSlug: "hutan-pola",
    title: "Master Challenge",
    description: "Tantangan pamungkas Pulau 2: Integrasikan pemahaman pola, arah, dan algoritma untuk mencapai puncak!",
    levelType: "Mastery Check",
    orderIndex: 12,
    difficulty: 3,
    concepts: ["Pattern", "Algorithm", "Sequence", "Direction", "Problem Solving"],
    grid: { width: 7, height: 5 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 6, y: 4 },
    obstacles: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 1, y: 3 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 20,
  },
];

/**
 * Gets a level definition by its unique code (e.g. "1.1", "2.3").
 */
export function getLevelByCode(code: string): LevelDefinition | undefined {
  return LEVEL_CATALOG.find((level) => level.code === code);
}

/**
 * Returns all 12 level definitions.
 */
export function getAllLevels(): readonly LevelDefinition[] {
  return LEVEL_CATALOG;
}

/**
 * Returns all islands definitions.
 */
export function getIslands(): readonly IslandDefinition[] {
  return ISLANDS;
}

/**
 * Gets an island definition by slug or id (e.g. "desa-boti", "desa-cipi", "hutan-pola").
 */
export function getIslandBySlug(slug: string): IslandDefinition | undefined {
  if (slug === "desa-cipi") {
    return ISLANDS.find((island) => island.slug === "desa-boti");
  }
  return ISLANDS.find((island) => island.slug === slug || island.id === slug);
}

/**
 * Gets next level in progression order, or null if this is the final level.
 */
export function getNextLevel(currentCode: string): LevelDefinition | null {
  const currentIndex = LEVEL_CATALOG.findIndex((lvl) => lvl.code === currentCode);
  if (currentIndex === -1 || currentIndex >= LEVEL_CATALOG.length - 1) {
    return null;
  }
  return LEVEL_CATALOG[currentIndex + 1];
}

/**
 * Level 1.1 alias for backward compatibility.
 */
export const LEVEL_1_1 = LEVEL_CATALOG[0];
