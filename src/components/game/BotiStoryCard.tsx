"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BookOpen, Volume2, VolumeX, Loader2, Sparkles, AlertCircle } from "lucide-react";
import type { StoryResponse } from "@/lib/ai/storyTypes";
import { getFallbackStory } from "@/lib/ai/fallbackStories";

export interface CipiStoryCardProps {
  levelCode: string;
  attemptId?: string | null;
  actionsUsed?: number;
  stars?: number;
  collisions?: number;
  className?: string;
}

export type BotiStoryCardProps = CipiStoryCardProps;

export function CipiStoryCard({
  levelCode,
  attemptId,
  actionsUsed,
  stars,
  collisions,
  className = "",
}: CipiStoryCardProps) {
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const hasLoadedForLevelRef = useRef<string | null>(null);
  const [isSpeechSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  });

  // Fetch story saat komponen dimuat untuk attempt/level ini
  useEffect(() => {
    let isMounted = true;

    // Hindari pemanggilan ganda jika cerita untuk level ini sudah berhasil dimuat
    if (hasLoadedForLevelRef.current === levelCode) {
      setIsLoading(false);
      return;
    }

    async function loadStory() {
      try {
        const res = await fetch("/api/ai/story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            levelCode,
            attemptId: attemptId || undefined,
            actionsUsed,
            stars,
            collisions,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!isMounted) return;

        if (!res.ok || !data || !data.story) {
          // Graceful fallback jika backend sibuk / kuota AI habis / koneksi terputus
          const islandSlug = levelCode.startsWith("2.") ? "hutan-pola" : "desa-boti";
          const fallback = getFallbackStory({
            levelCode,
            levelTitle: `Level ${levelCode}`,
            islandName: islandSlug === "desa-boti" ? "Desa Cipi" : "Hutan Pola",
            islandSlug,
            concepts: ["MOVE"],
            objective: "Bantu Cipi mencapai bintang!",
            actionsUsed,
            stars,
            collisions,
          });
          setStory(fallback);
          setError(null);
          hasLoadedForLevelRef.current = levelCode;
        } else {
          setStory({
            title: data.title,
            story: data.story,
            nextTeaser: data.nextTeaser,
            provider: data.provider,
          });
          setError(null);
          hasLoadedForLevelRef.current = levelCode;
        }
      } catch {
        if (isMounted) {
          // Graceful degradation: jika terjadi kendala jaringan, tampilkan cerita dari katalog lokal
          const islandSlug = levelCode.startsWith("2.") ? "hutan-pola" : "desa-boti";
          const fallback = getFallbackStory({
            levelCode,
            levelTitle: `Level ${levelCode}`,
            islandName: islandSlug === "desa-boti" ? "Desa Cipi" : "Hutan Pola",
            islandSlug,
            concepts: ["MOVE"],
            objective: "Bantu Cipi mencapai bintang!",
            actionsUsed,
            stars,
            collisions,
          });
          setStory(fallback);
          setError(null);
          hasLoadedForLevelRef.current = levelCode;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStory();

    return () => {
      isMounted = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [levelCode, attemptId, actionsUsed, stars, collisions]);

  // Handler audio narration: Membaca cerita dengan Web Speech API
  const handleToggleAudio = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !story) {
      return;
    }

    const synth = window.speechSynthesis;

    // Jika sedang membaca, hentikan
    if (isPlayingAudio) {
      synth.cancel();
      setIsPlayingAudio(false);
      return;
    }

    // Batalkan ucapan sebelumnya agar tidak bertumpuk
    synth.cancel();

    // Buat teks lengkap yang akan dibacakan
    const textToSpeak = `${story.title}. ${story.story} ${
      story.nextTeaser ? story.nextTeaser : ""
    }`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95; // Kecepatan sedikit ramah anak
    utterance.pitch = 1.05; // Sedikit lebih ceria
    utterance.lang = "id-ID";

    // Pilih suara Bahasa Indonesia jika tersedia di perangkat
    const voices = synth.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang === "id-ID" || v.lang.toLowerCase().startsWith("id")
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = (e) => {
      // Abaikan cancel error saat pemain menekan stop secara manual
      if (e.error !== "canceled") {
        console.warn("Speech synthesis notice:", e.error);
      }
      setIsPlayingAudio(false);
    };

    synth.speak(utterance);
  }, [story, isPlayingAudio]);

  return (
    <div
      id="cipi-story-container"
      data-testid="boti-story-container"
      className={`relative overflow-hidden rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xs p-4 sm:p-5 text-white transition-all ${className}`}
    >
      {/* Decorative subtle book icon in background */}
      <div
        className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none select-none"
        aria-hidden="true"
      >
        <BookOpen className="w-32 h-32" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2.5 py-4 text-white">
          <Loader2 className="w-5 h-5 animate-spin text-[#FFE66D]" />
          <span className="text-xs sm:text-sm font-bold">
            Cipi sedang merangkai kisah petualanganmu...
          </span>
        </div>
      ) : error ? (
        <div className="flex items-start gap-2.5 rounded-2xl bg-black/15 p-3 text-xs sm:text-sm text-emerald-100 border border-white/10">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FFE66D]" />
          <p>{error}</p>
        </div>
      ) : story ? (
        <div className="relative z-10 flex flex-col gap-2.5">
          {/* Header Row: Badge on Left, Audio Button on Right */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-emerald-50 border border-white/25 shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-[#FFE66D]" />
              Kisah Petualangan
            </span>

            {/* Tombol Audio "Dengarkan Cerita" dengan Candy Adventure Style */}
            {isSpeechSupported ? (
              <button
                id="btn-voice-narration"
                type="button"
                onClick={handleToggleAudio}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.18)] active:translate-y-0.5 active:shadow-none shrink-0 ${
                  isPlayingAudio
                    ? "bg-[#FFE66D] text-[#78350F] hover:bg-[#ffd43b]"
                    : "bg-white text-[#087F5B] hover:bg-slate-50"
                }`}
                title={isPlayingAudio ? "Hentikan suara cerita" : "Dengarkan cerita bersuara"}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>Hentikan Cerita</span>
                    <span className="w-2 h-2 rounded-full bg-[#FA5252] animate-ping" />
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#12B886]" />
                    <span>Dengarkan Cerita</span>
                  </>
                )}
              </button>
            ) : null}
          </div>

          {/* Judul Cerita */}
          <div>
            <h5 className="font-black text-base sm:text-lg text-white tracking-tight leading-snug drop-shadow-xs">
              {story.title}
            </h5>
          </div>

          {/* Narasi Cerita */}
          <div className="rounded-2xl bg-black/15 border border-white/10 p-3 sm:p-3.5">
            <p
              id="cipi-story-text"
              data-testid="boti-story-text"
              className="text-xs sm:text-sm text-emerald-50 font-medium leading-relaxed"
            >
              {story.story}
            </p>
          </div>

          {/* Hook / Teaser Level Berikutnya */}
          {story.nextTeaser && (
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-emerald-100/90 font-medium italic">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#FFE66D]" />
              <span>{story.nextTeaser}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export const BotiStoryCard = CipiStoryCard;
export default CipiStoryCard;
