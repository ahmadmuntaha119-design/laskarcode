import type { Metadata } from "next";
import { RecoverProfileForm } from "@/components/profile/RecoverProfileForm";

export const metadata: Metadata = {
  title: "Pulihkan Petualangan — LaskarCode",
  description: "Masukkan Kode Petualangan untuk melanjutkan perjalanan coding Boti dan memulihkan progress belajarmu",
};

export default function RecoverProfilePage() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] py-10 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Playful ambient background blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#4DABF7]/8 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#FFD43B]/10 blur-3xl pointer-events-none -z-10" />

      <RecoverProfileForm />
    </main>
  );
}
