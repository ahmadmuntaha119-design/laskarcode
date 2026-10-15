import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/profile/CreateProfileForm";

export const metadata: Metadata = {
  title: "Mulai Petualangan — LaskarCode",
  description: "Buat profil anak yang aman dan ramah privasi untuk memulai petualangan coding bersama Boti di LaskarCode",
};

export default function CreateProfilePage() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] py-10 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Playful ambient background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#12B886]/8 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#FFD43B]/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-[#4DABF7]/8 blur-3xl pointer-events-none -z-10" />

      <CreateProfileForm />
    </main>
  );
}
