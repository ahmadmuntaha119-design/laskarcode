import Link from "next/link";
import { Play, Sparkles, Compass } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-sky-50 via-white to-emerald-50 px-4 text-slate-800">
      <main className="flex max-w-2xl flex-col items-center text-center">
        {/* Mascot / Tag Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/70 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>LaskarCode — Petualangan Coding Anak SD</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
          Belajar Berpikir Komputasional bersama{" "}
          <span className="text-emerald-600 underline decoration-emerald-300">Boti</span>!
        </h1>

        <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-xl">
          Edukasi coding berbasis petualangan dan puzzle interaktif. Bantu Boti menjelajahi pulau-pulau seru dengan visual programming!
        </p>

        {/* Action Button to Vertical Slice Demo */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            id="link-play-demo"
            href="/play"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Mainkan Level 1.1 (Demo)</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Compass className="h-5 w-5 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Deterministic Engine</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sumber kebenaran independen yang menjamin hasil gerakan konsisten.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Sparkles className="h-5 w-5 text-sky-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Blockly Visual Code</h3>
            <p className="text-xs text-slate-500 mt-1">
              Antarmuka blok intuitif yang aman dan mudah dimengerti anak.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Play className="h-5 w-5 text-amber-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Canvas 2D Renderer</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tampilan grid dan karakter Boti responsif untuk layar laptop & HP.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
