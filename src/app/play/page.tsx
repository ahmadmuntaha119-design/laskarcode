import type { Metadata } from "next";
import { LEVEL_1_1 } from "@/game/levels";
import { LevelPlayer } from "@/components/game/LevelPlayer";

export const metadata: Metadata = {
  title: "Level 1.1 — Boti Mau Maju | LaskarCode",
  description: "Bantu Boti bergerak menuju bintang dengan visual coding Blockly pada LaskarCode",
};

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-6 px-3 md:px-6 flex flex-col justify-center">
      <LevelPlayer
        levelConfig={LEVEL_1_1}
        title="Level 1.1 — Boti Mau Maju"
        subtitle="Susun 4 blok Maju untuk mengantar Boti dari (0,1) ke Bintang Target di (4,1)!"
        conceptBadge="Instruction / MOVE"
      />
    </main>
  );
}
