import Spline from "@splinetool/react-spline";
import { Play } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative">
      <div className="relative h-[520px] md:h-[640px]">
        <div className="absolute inset-0">
          <Spline
            scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/20 to-white dark:via-black/30 dark:to-black" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full grid md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Stream. Chat. Sing. Repeat.
              </h1>
              <p className="mt-4 text-base md:text-lg text-black/70 dark:text-white/70 max-w-xl">
                A modern music experience with an AI co‑pilot and built‑in karaoke. Discover tracks, get smart recommendations, and sing along with synced lyrics.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="#karaoke"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-amber-500 text-white px-4 py-2.5 shadow hover:opacity-95 transition-opacity"
                >
                  <Play size={18} /> Try Karaoke
                </a>
                <a
                  href="#chat"
                  className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Ask the AI
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-end justify-end">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4 w-full max-w-sm">
                <div className="text-xs uppercase tracking-wide text-black/60 dark:text-white/60 mb-2">Now Playing</div>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-amber-400" />
                  <div className="flex-1">
                    <div className="font-semibold">Neon Horizon</div>
                    <div className="text-sm text-black/60 dark:text-white/60">VibeTune Collective</div>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
