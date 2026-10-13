import type { Metadata } from "next";
import { RecoverProfileForm } from "@/components/profile/RecoverProfileForm";

export const metadata: Metadata = {
  title: "Pulihkan Petualangan — LaskarCode",
  description: "Masukkan Kode Petualangan untuk melanjutkan perjalanan coding Boti dan memulihkan progress belajarmu",
};

export default function RecoverProfilePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 via-white to-emerald-50 py-10 px-4 flex flex-col justify-center items-center">
      <RecoverProfileForm />
    </main>
  );
}
