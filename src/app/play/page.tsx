import type { Metadata } from "next";
import { LevelPlayer } from "@/components/game/LevelPlayer";

export const metadata: Metadata = {
  title: "Petualangan Level — LaskarCode",
  description: "Belajar coding dengan visual programming Blockly dan bantu Boti menuntaskan misi di Pulau Desa Boti dan Hutan Pola",
};

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-6 px-3 md:px-6 flex flex-col justify-center">
      <LevelPlayer />
    </main>
  );
}
