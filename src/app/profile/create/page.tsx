import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/profile/CreateProfileForm";

export const metadata: Metadata = {
  title: "Mulai Petualangan — LaskarCode",
  description: "Buat profil anak yang aman dan ramah privasi untuk memulai petualangan coding bersama Boti di LaskarCode",
};

export default function CreateProfilePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 via-white to-emerald-50 py-10 px-4 flex flex-col justify-center items-center">
      <CreateProfileForm />
    </main>
  );
}
